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

import dbus

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

from ifconfig.models import Host, HostDependentManager, getHostDependentManagerClass
from volumes import blockdevices
from volumes.models import DeviceNotFound, BlockVolume, CapabilitiesAwareManager

class Array(BlockVolume):
    name        = models.CharField(max_length=50)
    megs        = models.IntegerField()
    host        = models.ForeignKey(Host)
    type        = models.CharField(max_length=50)

    @property
    def device(self):
        return "/dev/" + self.name

    @property
    def disk_stats(self):
        return blockdevices.get_disk_stats( self.name )

    @property
    def member_set(self):
        return BlockVolume.objects.filter(upper_type=ContentType.objects.get_for_model(self.__class__), upper_id=self.id)

    @property
    def status(self):
        with open("/proc/mdstat") as fd:
            for line in fd:
                if line.startswith(self.name):
                    if "(F)" in line:
                        return "degraded"
                    return "active"
