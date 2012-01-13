# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

import dbus.service
from functools     import partial
from threading     import Lock

from django.conf   import settings

class BasePlugin(dbus.service.Object):
    """ Basic SystemD plugin that handles DBus object initialization properly.

        Classes that inherit from this class MUST define a `dbus_path` property,
        in which the object path is defined under which this object is to be exported.
    """
    def __init__(self, bus, busname, mainobj):
        self.bus     = bus
        self.busname = busname
        self.mainobj = mainobj
        dbus.service.Object.__init__(self, self.bus, self.dbus_path)

    def job_add_command(self, jid, cmd):
        """ Add the given command to the job queue with Job ID `jid`. """
        return self.mainobj._job_add_command(jid, cmd)

class LockingPlugin(BasePlugin):
    """ SystemD plugin with a threading.Lock instance available at self.lock. """
    def __init__(self, bus, busname, mainobj):
        BasePlugin.__init__(self, bus, busname, mainobj)
        self.lock    = Lock()

method = partial( dbus.service.method, settings.DBUS_IFACE_SYSTEMD )
signal = partial( dbus.service.signal, settings.DBUS_IFACE_SYSTEMD )

method.__doc__ = "Method decorator that has the DBus Interface pre-defined."
signal.__doc__ = "Signal decorator that has the DBus Interface pre-defined."
