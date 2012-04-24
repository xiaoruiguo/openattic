# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>
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

import socket
import sys

from optparse import make_option
from getpass  import getpass
from datetime import datetime as PyDateTime

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from xmlrpclib import ServerProxy, ProtocolError
from xmlrpclib import DateTime as XmlDateTime

from rpcd import signals as rpcd_signals
from rpcd.models import APIKey

class Command( BaseCommand ):
    help = "Synchronizes this openATTIC instance with a given master and initializes communication."
    option_list = BaseCommand.option_list + (
        make_option( "-m", "--master",
            help="The Master's API URL.",
            default=""
            ),
        make_option( "-i", "--masterip",
            help=("The Master's host name/IP Address. Will use the user given in -o for authentication. If "
                  "used together with --master, --master will take precedence and --masterip will be ignored."),
            default=""
            ),
        make_option( "-o", "--owner",
            help="The owner's username to use for the Master's API key.",
            default=""
            ),
        )

    def sync_users(self, serv):
        for data in serv.auth.User.all():
            try:
                User.objects.get(id=int(data["id"]))
            except User.DoesNotExist:
                del data["user_permissions"]
                del data["groups"]
                data["date_joined"] = PyDateTime( *data["date_joined"].timetuple()[:7] )
                data["last_login"] = PyDateTime( *data["last_login"].timetuple()[:7] )
                uu = User(**data)
                uu.save()
        rpcd_signals.model_mastersync.send(sender=self, serv=serv, model=User)

    def sync_keys(self, serv):
        for data in serv.rpcd.APIKey.all():
            try:
                APIKey.objects.get(id=int(data["id"]))
            except APIKey.DoesNotExist:
                data["owner"] = User.objects.get(id=data["owner"]["id"])
                kk = APIKey(**data)
                kk.full_clean()
                kk.save()
        rpcd_signals.model_mastersync.send(sender=self, serv=serv, model=APIKey)

    def handle(self, **options):
        if not options["owner"]:
            print >>sys.stderr, "The --owner option is needed."
            return

        masterurl = None
        if options["master"]:
            masterurl = options["master"]
        elif options["masterip"]:
            masterurl = "http://%s:%s@%s:31234/" % (
                options["owner"],
                getpass("Password for %s@%s: " % (options["owner"], options["masterip"])),
                options["masterip"])
        if masterurl is None:
            print >>sys.stderr, "One of --master or --masterip are needed (--master takes precedence over --masterip)."
            return

        serv = ServerProxy(masterurl)
        try:
            serv.ping()
        except ProtocolError, err:
            if err.errcode == 401:
                print >>sys.stderr, err.errmsg
                return
            else:
                raise err

        rpcd_signals.pre_mastersync.send(sender=self, serv=serv)
        self.sync_users(serv)
        self.sync_keys(serv)
        rpcd_signals.post_mastersync.send(sender=self, serv=serv)

        if not serv.peering.PeerHost.filter({"name": socket.gethostname()}):
            keydesc = "Master Key for %s" % serv.hostname()
            if not APIKey.objects.filter(description=keydesc).count():
                kk = APIKey(description=keydesc, owner=User.objects.get(username=options["owner"]))
                kk.full_clean()
                kk.save()
            else:
                kk = APIKey.objects.get(description=keydesc)

            serv.peering.PeerHost.create({
                "name": socket.gethostname(),
                "base_url": "http://__:%s@%s:31234/" % (kk.apikey, socket.getfqdn())
            })

