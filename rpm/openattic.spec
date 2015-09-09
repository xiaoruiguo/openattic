Name: openattic
Version: %{BUILDVERSION}
Release: %{PKGVERSION}%{?dist}
Summary: openATTIC Comprehensive Storage Management System
Group: System Environment/Libraries
License: GPLv2
URL: http://www.openattic.org
BuildArch: noarch
Source:	openattic-%{BUILDVERSION}-%{PKGVERSION}.tar.bz2

## Documentation at https://fedoraproject.org/wiki/How_to_create_an_RPM_package
#Requires:	zfs-release
#Requires:	epel-release
Requires: openattic-base
Requires:	openattic-module-cron
Requires:	openattic-module-lvm
Requires:	openattic-module-nfs
Requires:	openattic-module-http
Requires:	openattic-module-samba
Requires:	openattic-module-nagios
Requires:	openattic-module-mailaliases
Requires:	openattic-pgsql

%description
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

It comes with an extensible API focused on modularity, so you can tailor
your installation exactly to your needs and embed openATTIC in your existing
data center infrastructure.

This metapackage installs the most common set of openATTIC modules along
with the basic requirements. Those modules are:

  * LVM
  * NFS
  * HTTP
  * LIO (iSCSI, FC)
  * Samba
  * Nagios
  * Cron
  * MailAliases (EMail configuration)

Upstream URL: http://www.openattic.org

%package       base
Requires:	policycoreutils-python
Requires:	python-memcached
Requires:	memcached
Requires:	python-imaging
Requires:	numpy
Requires:	python-rtslib
Requires:	python-requests
Requires:	wget
Requires:	bzip2
Requires:	oxygen-icon-theme
Requires:	python-django
Requires:	python-psycopg2
Requires:	dbus
Requires:	ntp
Requires:	bridge-utils
Requires:	vconfig
Requires:	python-dbus
Requires:	pygobject2
Requires:	python-pam
Requires:	python-m2ext
Requires:	m2crypto
Requires:	python-netifaces
Requires:	python-netaddr
Requires:	python-pyudev
Requires:	mod_wsgi
Requires:	xfsprogs
Requires:	udisks2
Requires:	djextdirect
Requires:	djangorestframework
Requires:	djangorestframework-bulk
Requires:	django-filter
Summary:  Basic requirements for openATTIC

%description base
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package installs the basic framework for openATTIC, which consists
of the RPC and System daemons. You will not be able to manage any storage
using *just* this package, but the other packages require this one to be
available.

%package gui
Requires:	openattic
Requires: policycoreutils-python
Summary:	openATTIC User Interface

%description gui
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package includes the Web UI based on AngularJS/Bootstrap.

%package module-ceph
Summary: Ceph module for openATTIC

%description module-ceph
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package includes support for Ceph, a distributed storage system
designed to provide excellent performance, reliability, and scalability.

%package module-btrfs
Requires:	btrfs-progs
Summary: BTRFS module for openATTIC

%description module-btrfs
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package includes support for BTRFS, a new copy on write filesystem for
Linux aimed at implementing advanced features while focusing on fault
tolerance, repair and easy administration.

%package module-cron
Requires:	/usr/sbin/crond
Summary: Cron module for openATTIC

%description module-cron
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

Cron is a service that provides scheduled task execution. This package
provides configuration facilities for scheduled tasks (a.k.a. Cron jobs).

%package module-drbd
Requires:	drbd84-utils
Requires:	kmod-drbd84
Summary: DRBD module for openATTIC

%description module-drbd
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

LINBIT's Distributed Replicated Block Device is a data replication tool that
mirrors volumes to another openATTIC host in a block oriented fashion. It is
often referred to as RAID-1 over IP.

This module provides the groundwork for building high availability clusters
using openATTIC.

%package module-http
Requires:	httpd
Summary: HTTP module for openATTIC

%description module-http
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

The Hypertext Transfer Protocol is not only used for serving web sites, but
can also be used for serving other files in a read-only fashion. This is
commonly used for disk images or software repositories.

This package installs a module which allows you to share volumes or
subdirectories using Apache2.

%package module-ipmi
#require freeipmi oder OpenIPMI ??
Summary:  IPMI module for openATTIC

%description module-ipmi
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

IPMI can be used to query a set of sensors installed in the system. This
module displays the current state of these sensors in the openATTIC GUI.

%package       module-lio
# Welche Pakte werden hierfür benötigt
Summary:  LIO module for openATTIC

%description module-lio
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package includes support for the LIO Linux SCSI Target, which allows
users to configure FibreChannel, FCoE and iSCSI targets over the openATTIC
user interface.

%package module-lvm
Requires:	lvm2
Summary: LVM module for openATTIC

%description module-lvm
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

Handles partitioning of physical disks into volumes using the Linux Logical
Volume Manager. LVM supports enterprise level volume management of disk
and disk subsystems by grouping arbitrary disks into volume groups. The
total capacity of volume groups can be allocated to logical volumes, which
are accessed as regular block devices.

%package module-mailaliases
Requires:	server(smtp)
Summary: MailAliases module for openATTIC

%description module-mailaliases
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

Mail Transfer Agents use a file named /etc/aliases in order to configure
mail redirection for certain users. This package contains an openATTIC module
which automatically alters this file to match the users configured in the
openATTIC database.

%package module-mdraid
Requires: mdadm
Summary: MDRAID module for openATTIC

%description module-mdraid
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package includes support for MD-RAID, the common Linux software RAID.

%package  module-nagios
Requires:	nagios
Requires:	nagios-plugins-all
Requires:	pnp4nagios
Summary: Nagios module for openATTIC

%description module-nagios
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

Nagios is a widely used system monitoring solution. This package installs a
module which automatically configures service checks for your configured
volumes and shares, measures performance data, and provides you with an
intuitive user interface to view the graphs.

This package also contains the Nagios check plugins for openATTIC, namely:
 * check_diskstats
 * check_iface_traffic
 * check_openattic_systemd
 * check_openattic_rpcd

%package module-nfs
Requires:	nfs-utils
Summary: NFS module for openATTIC

%description module-nfs
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

Network File System is the most widely used mechanism for sharing files
between UNIX hosts. This package installs a module that allows Volumes to
be shared using NFS, which is the recommended way not only for UNIXes, but
also for VMware ESX virtualization hosts.

%package module-samba
Requires:	samba
Summary: Samba module for openATTIC

%description module-samba
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

Samba implements the SMB/CIFS protocol and enables file sharing with hosts
that run the Microsoft Windows family of operating systems. This package
provides configuration facilities for Samba Shares.

%package module-twraid
# TODO: List Requirements
Summary: 3ware RAID module for openATTIC

%description module-twraid
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package installs a module that allows administration of 3ware RAID
controllers through openATTIC.

%package module-zfs
Requires:	zfs
Requires:	kernel-devel
Summary: ZFS module for openATTIC

%description module-zfs
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package includes support for ZFS, a pooled file system designed for
maximum data integrity, supporting data snapshots, multiple copies, and data
checksums. It depends on zfsonlinux, the native Linux port of ZFS.

%package pgsql
Requires: postgresql
Requires:	postgresql-server
Requires:	openattic-base
Summary: PGSQL database for openATTIC

%description pgsql
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package configures the PostgreSQL database for openATTIC.

%package release
Summary: openATTIC yum Repository Information

%description release
openATTIC is a storage management system based upon Open Source tools with
a comprehensive user interface that allows you to create, share and backup
storage space on demand.

This package contains the yum repository file to install openATTIC.

%prep
%setup -q -n %{name}-%{version}-%{PKGVERSION}

%build
cd webui
npm install
bower --allow-root install
grunt build

%install

# Build up target directory structure
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_datadir}/openattic-gui
mkdir -p %{buildroot}%{_libdir}/nagios/plugins/
mkdir -p %{buildroot}%{_localstatedir}/lib/%{name}/http/volumes
mkdir -p %{buildroot}%{_localstatedir}/lib/%{name}/nfs_dummy
mkdir -p %{buildroot}%{_localstatedir}/lib/%{name}/static
mkdir -p %{buildroot}%{_localstatedir}/lib/nagios3
mkdir -p %{buildroot}%{_localstatedir}/lock/%{name}
mkdir -p %{buildroot}%{_mandir}/man1/
mkdir -p %{buildroot}%{_sbindir}
mkdir -p %{buildroot}%{_sysconfdir}/cron.d/
mkdir -p %{buildroot}%{_sysconfdir}/dbus-1/system.d/
mkdir -p %{buildroot}%{_sysconfdir}/default/
mkdir -p %{buildroot}%{_sysconfdir}/httpd/conf.d/
mkdir -p %{buildroot}%{_sysconfdir}/modprobe.d/
mkdir -p %{buildroot}%{_sysconfdir}/nagios/conf.d/
mkdir -p %{buildroot}%{_sysconfdir}/%{name}/databases
mkdir -p %{buildroot}%{_sysconfdir}/yum.repos.d/

# Install Backend and binaries
rsync -aAX backend/ %{buildroot}%{_datadir}/%{name}
install -m 755 bin/oacli %{buildroot}%{_bindir}
install -m 755 bin/oaconfig   %{buildroot}%{_sbindir}
install -m 755 bin/blkdevzero %{buildroot}%{_sbindir}

# Install Web UI
rsync -aAX webui/dist/ %{buildroot}%{_datadir}/openattic-gui/
sed -i -e 's/^ANGULAR_LOGIN.*$/ANGULAR_LOGIN = False/g' %{buildroot}%{_datadir}/%{name}/settings.py

# Configure /etc/default/openattic
# TODO: copy file from source tree and use sed to configure for EL7
cat > %{buildroot}/%{_sysconfdir}/default/%{name} <<EOF
PYTHON="/usr/bin/python"
OADIR="/usr/share/openattic"

RPCD_PIDFILE="/var/run/openattic_rpcd.pid"
RPCD_CHUID="openattic:openattic"
RPCD_LOGFILE="/var/log/openattic_rpcd"
RPCD_LOGLEVEL="INFO"
RPCD_OPTIONS="$OADIR/manage.py runrpcd"
RPCD_CERTFILE=""
RPCD_KEYFILE=""

SYSD_PIDFILE="/var/run/openattic_systemd.pid"
SYSD_LOGFILE="/var/log/openattic_systemd"
SYSD_LOGLEVEL="INFO"
SYSD_OPTIONS="$OADIR/manage.py runsystemd"

WEBSERVER_SERVICE="httpd"
SAMBA_SERVICES="smb nmb"
WINBIND_SERVICE="winbind"

NAGIOS_CFG="/etc/nagios/nagios.cfg"
NAGIOS_STATUS_DAT="/var/log/nagios/status.dat"
NAGIOS_SERVICE="nagios"
NPCD_MOD="/usr/lib64/nagios/brokers/npcdmod.o"
NPCD_CFG="/etc/pnp4nagios/npcd.cfg"
NPCD_SERVICE="npcd"
EOF

# database config
## TODO: generate random password

cat <<EOF > %{buildroot}%{_sysconfdir}/%{name}/databases/pgsql.ini
[default]
engine   = django.db.backends.postgresql_psycopg2
name     = openattic
user     = openattic
password = ip32...beg
host     = localhost
port     =
EOF

ln -s %{_sysconfdir}/%{name}/databases/pgsql.ini %{buildroot}%{_sysconfdir}/openattic/database.ini

# configure dbus
install -m 644 etc/dbus-1/system.d/openattic.conf %{buildroot}%{_sysconfdir}/dbus-1/system.d/

install -m 644 etc/modprobe.d/drbd.conf %{buildroot}%{_sysconfdir}/modprobe.d/

# configure yum repo
install -m 644 etc/yum.repos.d/%{name}.repo %{buildroot}%{_sysconfdir}/yum.repos.d/

# install man pages
install -m 644 debian/man/*.1 %{buildroot}%{_mandir}/man1/
gzip %{buildroot}%{_mandir}/man1/*.1

#configure nagios
install -m 644 etc/nagios-plugins/config/openattic.cfg %{buildroot}%{_sysconfdir}/nagios/conf.d/openattic_plugins.cfg
install -m 644 etc/nagios3/conf.d/openattic_*.cfg      %{buildroot}%{_sysconfdir}/nagios/conf.d/

for NAGPLUGIN in `ls -1 %{buildroot}%{_datadir}/%{name}/nagios/plugins/`; do
    ln -s "%{_datadir}/%{name}/nagios/plugins/$NAGPLUGIN" "%{buildroot}%{_libdir}/nagios/plugins/$NAGPLUGIN"
done

mkdir -p %{buildroot}/lib/systemd/system/
install -m 644 etc/systemd/*.service %{buildroot}/lib/systemd/system/

# openATTIC httpd config
install -m 644 etc/apache2/conf-available/openattic-volumes.conf %{buildroot}%{_sysconfdir}/httpd/conf.d/
install -m 644 etc/apache2/conf-available/openattic.conf         %{buildroot}%{_sysconfdir}/httpd/conf.d/

install -m 644 etc/cron.d/updatetwraid %{buildroot}%{_sysconfdir}/cron.d/

%pre
# create openattic user/group  if it does not exist
if id -g openattic >/dev/null 2>&1; then
        echo "openattic group exists"
else
        groupadd openattic &&  echo "openattic group created"
fi
if id -u openattic >/dev/null 2>&1; then
        echo "openattic user exists"
else
	adduser --system --shell /bin/bash  --home /var/lib/openattic --gid openattic openattic &&\
	groupmems -g openattic  -a apache &&\
	groupmems -a openattic  -g apache &&\
	groupmems -a openattic  -g nagios &&\
	echo "openattic user created"
	groupmems -g openattic  -a nagios
fi

# for double security only, should be installed correctly
chown -R openattic:openattic /var/lock/openattic
chown -R openattic:openattic /var/lib/openattic

# Sollte im Paket erledigt sein, aber wird zur Sicherheit noch angelegt
touch /var/log/openattic_rpcd
chown openattic:openattic /var/log/openattic_rpcd
chmod 644 /var/log/openattic_rpcd
touch /var/log/openattic_systemd
chown openattic:openattic /var/log/openattic_systemd
chmod 644 /var/log/openattic_systemd

%post base
systemctl daemon-reload
service dbus restart
systemctl start httpd

%postun base
systemctl daemon-reload
service dbus restart
systemctl restart httpd

%post gui
semanage fcontext -a -t httpd_sys_rw_content_t "/usr/share/openattic-gui(/.*)?"
restorecon -vvR
service httpd restart

%postun gui
semanage fcontext -d -t httpd_sys_rw_content_t "/usr/share/openattic-gui(/.*)?"
restorecon -vvR
service httpd restart

%post pgsql

# Configure Postgres DB
systemctl start postgresql
if postgresql-setup initdb; then
	echo "postgresql database initialized";
else
	echo "postgres database already initialized";
fi
systemctl enable postgresql
systemctl start postgresql

#TODO: Dynamisches Passwort erzeugen und ausgeben
#pass=$(openssl rand -hex 10)
dbu=$(su - postgres -c "psql --list" | awk -F'|' ' /openattic/ { print $2 }')
echo "===> $dbu"
if [ -n "$dbu" ]; then
	echo "Database openattic exists, owned by $dbu"
else
su - postgres -c psql << EOT
create user openattic with password 'ip32...beg';
create database openattic with owner openattic;
\q
EOT
	#sed -i -e "s/ip32...beg/$pass/g" /etc/openattic/databases/pgsql.ini
	sed -i -e 's/ident$/md5/g' /var/lib/pgsql/data/pg_hba.conf
fi
systemctl reload postgresql
systemctl status postgresql

%postun pgsql
# Datenbank drop
echo "You need to drop the openattic database & user"
echo "run the following commands as root"
echo ""
echo "su - postgres -c psql"
echo "postgres=# drop database openattic"
echo "postgres=# drop user openattic"
echo "postgres=# \q"
echo ""

%files
%defattr(-,root,root,-)
%doc CHANGELOG LICENSE README.rst

%files 	base
%defattr(-,root,root,-)
%{_bindir}/oacli
%{_sbindir}/blkdevzero
%{_sbindir}/oaconfig
%config %{_sysconfdir}/dbus-1/system.d/openattic.conf
/lib/systemd/system/openattic-rpcd.service
/lib/systemd/system/openattic-systemd.service
%config %{_sysconfdir}/httpd/conf.d/openattic.conf
%defattr(-,openattic,openattic,-)
%dir %{_localstatedir}/lib/openattic
%dir %{_localstatedir}/lock/openattic
%dir %{_datadir}/%{name}/installed_apps.d
%config(noreplace) %{_sysconfdir}/default/%{name}
%config(noreplace) %{_sysconfdir}/%{name}/databases/pgsql.ini
%doc %{_mandir}/man1/oaconfig.1.gz
%doc %{_mandir}/man1/oacli.1.gz
%{_datadir}/%{name}/clustering/
%{_datadir}/%{name}/cmdlog/
%{_datadir}/%{name}/ifconfig/
%{_datadir}/%{name}/__init__.py*
%{_datadir}/%{name}/installed_apps.d/20_volumes
%{_datadir}/%{name}/installed_apps.d/70_clustering
%{_datadir}/%{name}/locale/
%{_datadir}/%{name}/manage.py*
%{_datadir}/%{name}/oa_auth.py*
%{_datadir}/%{name}/openattic.wsgi
%{_datadir}/%{name}/pamauth.py*
%{_datadir}/%{name}/peering/
%{_datadir}/%{name}/processors.py*
%{_datadir}/%{name}/rest/
%{_datadir}/%{name}/rpcd/
%{_datadir}/%{name}/serverstats.wsgi
%{_datadir}/%{name}/settings.py*
%{_datadir}/%{name}/systemd/
%{_datadir}/%{name}/sysutils/
%{_datadir}/%{name}/templates/
%{_datadir}/%{name}/urls.py*
%{_datadir}/%{name}/userprefs/
%{_datadir}/%{name}/views.py*
%{_datadir}/%{name}/volumes/


%files 	module-btrfs
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/10_btrfs
%{_datadir}/%{name}/btrfs/

%files 	module-ceph
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/60_ceph
%{_datadir}/%{name}/ceph/

%files gui
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}-gui

%files 	module-cron
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/09_cron
%{_datadir}/%{name}/cron/

%files 	module-drbd
%defattr(-,openattic,openattic,-)
%config %{_sysconfdir}/modprobe.d/drbd.conf
%{_datadir}/%{name}/drbd/
%{_datadir}/%{name}/installed_apps.d/60_drbd

%files 	module-http
%defattr(-,openattic,openattic,-)
%{_localstatedir}/lib/%{name}/http/
%{_datadir}/%{name}/http/
%{_datadir}/%{name}/installed_apps.d/60_http
%config %{_sysconfdir}/httpd/conf.d/openattic-volumes.conf

%post module-http
systemctl daemon-reload
systemctl restart httpd

%files 	module-ipmi
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/50_ipmi
%{_datadir}/%{name}/ipmi/

%files 	module-lio
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/60_lio
%{_datadir}/%{name}/lio/

%files 	module-lvm
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/lvm/
%{_datadir}/%{name}/installed_apps.d/10_lvm

%post module-lvm
systemctl daemon-reload
systemctl enable lvm2-lvmetad
systemctl start lvm2-lvmetad

%files 	module-mailaliases
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/mailaliases/
%{_datadir}/%{name}/installed_apps.d/50_mailaliases

%files 	module-mdraid
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/mdraid/
%{_datadir}/%{name}/installed_apps.d/09_mdraid

%files 	module-nagios
#/etc/pnp4nagios/check_commands/check_diskstats.cfg
#/etc/pnp4nagios/check_commands/check_all_disks.cfg
%defattr(-,root,root,-)
%config %{_sysconfdir}/nagios/conf.d/openattic_plugins.cfg
%config %{_sysconfdir}/nagios/conf.d/openattic_static.cfg
%config %{_sysconfdir}/nagios/conf.d/openattic_contacts.cfg
%{_libdir}/nagios/plugins/check_cputime
%{_libdir}/nagios/plugins/check_diskstats
%{_libdir}/nagios/plugins/check_drbd
%{_libdir}/nagios/plugins/check_drbdstats
%{_libdir}/nagios/plugins/check_iface_traffic
%{_libdir}/nagios/plugins/check_lvm_snapshot
%{_libdir}/nagios/plugins/check_oa_utilization
%{_libdir}/nagios/plugins/check_openattic_rpcd
%{_libdir}/nagios/plugins/check_openattic_systemd
%{_libdir}/nagios/plugins/check_protocol_traffic
%{_libdir}/nagios/plugins/check_twraid_unit
%{_libdir}/nagios/plugins/notify_openattic
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/50_nagios
%{_datadir}/%{name}/nagios
%defattr(-,nagios,nagios,-)
%{_localstatedir}/lib/nagios3

%post module-nagios
systemctl daemon-reload
chkconfig nagios on
chkconfig npcd on
systemctl start nagios.service
systemctl start npcd.service

%files 	module-nfs
%defattr(-,openattic,openattic,-)
%{_localstatedir}/lib/%{name}/nfs_dummy/
%{_datadir}/%{name}/installed_apps.d/60_nfs
%{_datadir}/%{name}/nfs/

%post module-nfs
systemctl daemon-reload
systemctl start nfs

%files 	module-samba
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/60_samba
%{_datadir}/%{name}/samba/

%files 	module-twraid
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/09_twraid
%{_datadir}/%{name}/twraid/
%config %{_sysconfdir}/cron.d/updatetwraid

%files 	module-zfs
%defattr(-,openattic,openattic,-)
%{_datadir}/%{name}/installed_apps.d/30_zfs
%{_datadir}/%{name}/zfs/

%files 	pgsql
%defattr(-,openattic,openattic,-)
%{_sysconfdir}/openattic/

%files release
%defattr(-,root,root,-)
%{_sysconfdir}/yum.repos.d/%{name}.repo


%changelog
* Mon Sep 07 2015 Lenz Grimmer <lenz@openattic.org> 2.0.2
- Updated package descriptions (fixed formatting)
- Added openattic-module-ceph subpackage (OP-624)
- Use a versioned tar ball as the build source
- Don't install bower and grunt as part of the RPM build process
- Reworked install section, use more RPM macros
- Removed compiled Python objects from the file list
- Added /var/lib/nagios3 to the nagios subpackage
- Added policycoreutils-python dependency to the gui package (OP-571)

* Thu May 21 2015 Michael Ziegler <michael@open-attic.org> - %{BUILDVERSION}-%{PKGVERSION}
- Remove prep stuff
- Replace fixed version numbers by BUILDVERSION and PKGVERSION macros which are populated with info from HG
- rm the docs from RPM_BUILD_ROOT and properly install them through %doc

* Tue Feb 24 2015 Markus Koch  <mkoch@redhat.com> - 1.2 build
- split into package modules

* Fri May 23 2003 Markus Koch  <mkoch@redhat.com> - 1.2 build version 1
- First build.