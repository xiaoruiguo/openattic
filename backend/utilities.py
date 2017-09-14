# -*- coding: utf-8 -*-

"""
 *  Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
 *
 *  openATTIC is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; version 2.
 *
 *  This package is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
"""
import logging
import inspect
from collections import defaultdict
from contextlib import closing
from distutils.spawn import find_executable
from importlib import import_module
from os import path

import django
import multiprocessing
from django.conf import settings

from exception import ExternalCommandError

logger = logging.getLogger(__name__)


def get_related_model(field):
    """
    Provides a Django 1.8 and pre-1.8 compatible version of
    >>> ..._meta.get_field_by_name(...)[0].related.parent_model  # doctest: +SKIP

    :type field: django.db.models.Field
    :rtype: django.db.models.Model
    """
    if django.VERSION < (1, 8):
        return field.related.parent_model
    else:
        return field.related_model


def aggregate_dict(*args, **kwargs):
    """
    >>> assert aggregate_dict({1:2}, {3:4}, a=5) == {1:2, 3:4, 'a':5}

        You can also overwrite keys:
    >>> assert aggregate_dict({1:2}, {1:4}) == {1:4}


    :rtype: dict[str, Any]
    """
    ret = {}
    for arg in args:
        ret.update(arg)
    ret.update(**kwargs)
    return ret


def zip_by_keys(*args):
    """
    Zips lists of dicts by keys into one list of dicts.

    >>> l1 = [{'k1': 0, 'v1': 'hello'},
    ...       {'k1': 1, 'v1': 'Hallo'}]
    >>> l2 = [{'k2': 0, 'v2': 'world'},
    ...       {'k2': 1, 'v2': 'Welt'}]
    >>> r = zip_by_keys(('k1', l1), ('k2', l2))
    >>> assert r == [{'k1': 0, 'v1': 'hello', 'k2': 0, 'v2': 'world'},
    ...              {'k1': 1, 'v1': 'Hallo', 'k2': 1, 'v2': 'Welt'}]

    :type args: tuple(tuple[str, Any]]
    :rtype: list[dict[str, Any]]
    """
    if not args:
        return []
    d = defaultdict(dict)
    for (key, l) in args:
        for elem in l:
            d[elem[key]].update(elem)
    keyname = args[0][0]
    return sorted(d.values(), key=lambda e: getattr(e, keyname, None))


def zip_by_key(key, *args):
    """
    Zip args by key.

    >>> l1 = [{'k': 0, 'v1': 'hello'}, {'k': 1, 'v1': 'Hallo'}]
    >>> l2 = [{'k': 0, 'v2': 'world'}, {'k': 1, 'v2': 'Welt'}]
    >>> r = zip_by_key('k', l1, l2)
    >>> assert r == [{'k': 0, 'v1': 'hello', 'v2': 'world'},
    ...              {'k': 1, 'v1': 'Hallo', 'v2': 'Welt'}]

    :type key: str
    :type args: tuple[dict[str, Any]]
    :rtype: list[dict[str, Any]]
    """
    return zip_by_keys(*[(key, l) for l in args])


def get_django_app_modules(module_name):
    """Returns a list of app modules named `module_name`"""
    plugins = []
    for app in settings.INSTALLED_APPS:
        try:
            module = import_module(app + "." + module_name)
        except ImportError, err:
            if unicode(err) != "No module named {}".format(module_name):
                logger.exception('Got error when checking app: {}'.format(app))
        else:
            plugins.append(module)
    logging.info("Loaded {} modules: {}".format(module_name,
                                                ', '.join([module.__name__ for module in plugins])))
    return plugins


def is_executable_installed(executable):
    """
    Tries to find an executable in the typical locations.
    :type executable: str
    :rtype: bool
    """
    if find_executable(executable):
        return True
    return any([path.isfile(path.join(root, executable)) for root in ['/sbin', '/usr/sbin']])


def in_unittest():
    current_stack = inspect.stack()
    for stack_frame in current_stack:
        for program_line in stack_frame[4]:
            if "unittest" in program_line:
                return True
    return False


def run_in_external_process(func, timeout=30):
    """
    Runs `func` in an external process. Exceptions and return values are forwarded

    :type func: () -> T
    :rtype: T
    """
    class LibradosProcess(multiprocessing.Process):
        def __init__(self, com_pipe):
            multiprocessing.Process.__init__(self)
            self.com_pipe = com_pipe

        def run(self):
            with closing(self.com_pipe):
                try:
                    self.com_pipe.send(func())
                except Exception as e:
                    logger.exception("Exception when running a librados process.")
                    self.com_pipe.send(e)

    com1, com2 = multiprocessing.Pipe()
    p = LibradosProcess(com2)
    p.start()
    with closing(com1):
        if com1.poll(timeout):
            res = com1.recv()
            p.join()
            if isinstance(res, Exception):
                raise res
            return res
        else:
            p.terminate()
            raise ExternalCommandError('Process {} with ID {} terminated because of timeout '
                                       '({} sec).'.format(p.name, p.pid, timeout))
