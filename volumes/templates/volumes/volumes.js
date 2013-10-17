/*
 Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
*/

Ext.namespace("Ext.oa");

Ext.define('volumes__volumes_BlockVolume_model', {
  extend: 'Ext.data.TreeModel',
  requires: [
    'Ext.data.NodeInterface'
  ],
  fields: [
    'id', 'name', 'type', 'megs', 'filesystem', 'status', 'usedmegs', 'percent',
    'fswarning', 'fscritical', 'fshost', 'fsmountpoint', 'poolname', 'ownername'
  ],
  createNode: function(record){
    // See if there is a specific model for this object type, and if so, use it
    var modelname = Ext.String.format('volumes__{0}_{1}_model', record.raw.volume_type.app, record.raw.volume_type.obj);
    if( Ext.ClassManager.get(modelname) !== null ){
      var model = Ext.create(modelname);
      return model.createNode(record);
    }
    // There is none, rely on the object having everything we need
    var rootNode;
    record.set("leaf", true);
    rootNode = this.callParent(arguments);
    rootNode.set("name",   toUnicode(record.raw));
    rootNode.set("type",   gettext(Ext.String.capitalize(toUnicode(record.raw.volumepool_type))));
    rootNode.set("icon",   MEDIA_URL + '/icons2/16x16/apps/database.png');
    rootNode.set("status", " ");
    rootNode.set("fshost", toUnicode(record.raw.host));
    return rootNode;
  }
});

Ext.define('volumes__volumes_FileSystemVolume_model', {
  extend: 'Ext.data.TreeModel',
  requires: [
    'Ext.data.NodeInterface'
  ],
  fields: [
    'id', 'name', 'type', 'megs', 'filesystem', 'status', 'usedmegs', 'percent',
    'fswarning', 'fscritical', 'fshost', 'fsmountpoint', 'poolname', 'ownername'
  ],
  createNode: function(record){
    // See if there is a specific model for this object type, and if so, use it
    var modelname = Ext.String.format('volumes__{0}_{1}_model', record.raw.volume_type.app, record.raw.volume_type.obj);
    if( Ext.ClassManager.get(modelname) !== null ){
      var model = Ext.create(modelname);
      return model.createNode(record);
    }
    // There is none, rely on the object having everything we need
    var rootNode;
    record.set("leaf", true);
    rootNode = this.callParent(arguments);
    rootNode.set("name",         toUnicode(record.raw));
    rootNode.set("type",         gettext(Ext.String.capitalize(record.raw.volume.obj ? record.raw.volume.obj : '')));
    rootNode.set("fshost",       toUnicode(record.raw.fs.host));
    rootNode.set("fsmountpoint", record.raw.fs.mountpoint);
    rootNode.set("poolname",     toUnicode(record.raw.pool));
    rootNode.set("ownername",    toUnicode(record.raw.owner));
    rootNode.set("icon",         MEDIA_URL + '/icons2/16x16/apps/database.png');
    rootNode.set("status",       " ");
    if( typeof record.raw.fs.stat !== "undefined" ){
      rootNode.set("percent",    (record.raw.fs.stat.used / record.raw.fs.stat.size * 100).toFixed(2));
    }
    else{
      rootNode.set("percent",    null);
    }
    return rootNode;
  }
});


Ext.define('Ext.oa.volumes__Volume_Panel', {
  extend: 'Ext.tree.TreePanel',
  alias: 'widget.volumes__volumes_panel',
  initComponent: function(){
    var volumePanel = this;
    Ext.apply(this, Ext.apply(this.initialConfig, {
      id: "volumes__volumes_panel_inst",
      title: gettext('Volume Management'),
      border: false,
      rootVisible: false,
      buttons: [{
        text: "",
        icon: MEDIA_URL + '/icons2/16x16/actions/reload.png',
        tooltip: gettext('Reload'),
        handler: function(self){
          volumePanel.refresh();
        }
      }],
      forceFit: true,
      store: (function(){
        var treestore = Ext.create("Ext.oa.SwitchingTreeStore", {
          fields: ['name'],
          proxy: { type: "memory" },
          root: {
            name:     'root',
            expanded: true,
            id: "volumes_root_node"
          }
        });
        var blockvolstore = Ext.create('Ext.oa.SwitchingTreeStore', {
          model: 'volumes__volumes_BlockVolume_model',
          proxy: {
            type:     'direct',
            directFn: volumes__BlockVolume.filter,
            extraParams: {
              kwds: {
                upper_id__isnull: true
              }
            },
            paramOrder: ["kwds"]
          },
          root: {
            name: gettext("LUNs"),
            id:   "volumes__volumes_blockvolumes_rootnode",
            type: ' ',
            megs: null,
            percent: null,
            status: null,
          },
          sorters: [{property: "name"}]
        });
        var fsvolstore = Ext.create('Ext.oa.SwitchingTreeStore', {
          model: 'volumes__volumes_FileSystemVolume_model',
          proxy: {
            type:     'direct',
            directFn: volumes__FileSystemVolume.all
          },
          root: {
            name: gettext("Volumes"),
            id:   "volumes__volumes_fsvolumes_rootnode",
            type: ' ',
            megs: null,
            percent: null,
            status: null,
          },
          sorters: [{property: "name"}]
        });
        var rootNode = treestore.getRootNode();
        rootNode.appendChild(blockvolstore.getRootNode());
        rootNode.appendChild(fsvolstore.getRootNode());
        return treestore;
      }()),
      defaults: {
        sortable: true
      },
      columns: [{
        xtype: 'treecolumn',
        header: gettext('Name'),
        dataIndex: "name"
      },{
        header: gettext('Type'),
        dataIndex: "type",
        renderer: function(val){ return (val ? val : '♻'); }
      },{
        header: gettext('Size'),
        dataIndex: "megs",
        align: "right",
        renderer: function(val){
          if( val === null ){
            return '';
          }
          if( !val || val === -1 ){
            return '♻';
          }
          if( val >= 1000 ){
            return Ext.String.format("{0} GB", (val / 1000).toFixed(2));
          }
          else{
            return Ext.String.format("{0} MB", val);
          }
        }
      },{
        header: gettext('Used%'),
        dataIndex: "percent",
        renderer: function( val, x, store ){
          if( val === null ){
            return '';
          }
          if( !val || val === -1 ){
            return '♻';
          }
          var id = Ext.id();
          Ext.defer(function(){
            if( Ext.get(id) === null ){
              return;
            }
            new Ext.ProgressBar({
              renderTo: id,
              value: val/100.0,
              text:  Ext.String.format("{0}%", val),
              cls:   ( val > 85 ? "lv_used_crit" :
                      (val > 70 ? "lv_used_warn" : "lv_used_ok"))
            });
          }, 25);
          return Ext.String.format('<span id="{0}"></span>', id);
        }
      },{
        header: gettext('Status'),
        dataIndex: "status",
        renderer: function( val, x, store ){
          if( val === null ){
            return '';
          }
          if( !val || val === -1 ){
            return '♻';
          }
          if( !val.contains(":") ){
            return val;
          }
          var id = Ext.id();
          var desc = Ext.String.capitalize(val.split(":")[0].toLowerCase());
          var perc = parseInt(val.split(":")[1]);
          Ext.defer(function(){
            if( Ext.get(id) === null ){
              return;
            }
            new Ext.ProgressBar({
              renderTo: id,
              value: perc/100.0,
              text:  Ext.String.format("{0} ({1}%)", desc, perc)
            });
          }, 25);
          return Ext.String.format('<span id="{0}"></span>', id);
        }
      },{
        header: gettext('Warning Level'),
        dataIndex: "fswarning",
      },{
        header: gettext('Critical Level'),
        dataIndex: "fscritical",
      },{
        header: gettext('Mounted on Host'),
        dataIndex: "fshost",
      },{
        header: gettext('Volume Pool'),
        dataIndex: "poolname",
      },{
        header: gettext('Owner'),
        dataIndex: "ownername",
      }]
    }));
    this.callParent(arguments);
  },
  onRender: function(){
    this.callParent(arguments);
    var i, nodes = this.getRootNode().childNodes;
    for(var i = 0; i < nodes.length; i++){
      nodes[i].expand();
    }
  },
  refresh: function(){
    var i, nodes = this.getRootNode().childNodes;
    for(var i = 0; i < nodes.length; i++){
      nodes[i].store.load();
    }
  }
});


Ext.oa.volumeGroup_Module = {
  panel: "volumes__volumes_panel",
  prepareMenuTree: function(tree){
    tree.appendToRootNodeById("menu_storage", {
      text: gettext('Volume Management'),
      leaf: true,
      icon: MEDIA_URL + '/icons2/22x22/apps/volume.png',
      panel: "volumes__volumes_panel_inst"
    });
  }
};


window.MainViewModules.push( Ext.oa.volumeGroup_Module );

// kate: space-indent on; indent-width 2; replace-tabs on;
