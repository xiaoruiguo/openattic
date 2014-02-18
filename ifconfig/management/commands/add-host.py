# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2014, it-novum GmbH <community@open-attic.org>
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

from django.core.management.base import BaseCommand

from ifconfig.models import Host

class Command( BaseCommand ):
    help = "Make sure a Host entry for this host exists."

    def handle(self, **options):
        try:
            host = Host.objects.get_current()
        except Host.DoesNotExist:
            fqdn = socket.getfqdn()
            if '.' not in fqdn:
                raise ValueError("'%s' does not look like a Fully Qualified Domain Name (FQDN)." % fqdn)
            host = Host(name=fqdn)
            host.save()
