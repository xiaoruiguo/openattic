/*
 Copyright (C) 2011-2014, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
*/

Ext.namespace("Ext.oa");

Ext.define('Ext.oa.Ifconfig__Host_Panel', {
  extend: 'Ext.oa.ShareGridPanel',
  alias: "widget.ifconfig__host_panel",
  api: ifconfig__Host,
  texts: {
    add:     gettext("Add Host"),
    edit:    gettext("Edit Host"),
    remove:  gettext("Delete Host"),
    confirm: gettext('Do you really want to delete host %s?')
  },
  columns: [{
    header: gettext('Name'),
    width: 200,
    dataIndex: "name"
  }],
  form: {
    items: [{
      xtype: 'fieldset',
      title: 'Host',
      layout: 'form',
      items: [{
        xtype: 'textfield',
        fieldLabel: gettext('Name'),
        allowBlank: false,
        name: "name"
      }]
    }]
  }
});


Ext.define('Ext.oa.Ifconfig__Host_Attributes_TreePanel', {
  extend: 'Ext.tree.TreePanel',
  alias: "widget.ifconfig__host_attributes_panel",
  registerObjType: function(objtype){
    this.objtypes[ objtype.objtype ] = objtype;
  },
  initComponent: function(){
    this.objtypes = {};
    this.pluginstores = [];

    var treestore = Ext.create("Ext.data.TreeStore", {
      fields: ['text'],
      proxy: { type: "memory" },
      root: {
        text:     'root',
        expanded: true,
        id: "host_attr_root_node"
      }
    });

    Ext.apply(this, Ext.apply(this.initialConfig, {
      useArrows       : true,
      autoScroll      : true,
      animate         : true,
      containerScroll : true,
      rootVisible     : false,
      frame           : true,
      store           : treestore,
      buttons         : [{
        text: gettext("Add Attribute"),
        icon: MEDIA_URL + "/icons2/16x16/actions/add.png",
        scope: this,
        handler: function(){
          if( typeof this.host === "undefined" ){
            Ext.MessageBox.alert(gettext("Add Attribute"),
              gettext("Please choose the host to add attributes to."));
            return;
          }
          var sel = this.getSelectionModel().getSelection();
          if(sel.length !== 1){
            Ext.MessageBox.alert(gettext("Add Attribute"),
              gettext("Please choose the type of attribute to add by selecting the respective tree node."));
            return;
          }
          for( var i = 0; i < window.HostAttrPlugins.length; i++ ){
            window.HostAttrPlugins[i].addClicked(this, sel[0], this.host);
          }
        }
      }, {
        text: gettext("Remove Attribute"),
        icon: MEDIA_URL + "/icons2/16x16/actions/remove.png",
        scope: this,
        handler: function(){
          var sel = this.getSelectionModel().getSelection();
          if(sel.length !== 1){
            Ext.MessageBox.alert(gettext("Remove Attribute"),
              gettext("Please choose the attribute to remove by selecting the respective tree node."));
          }
          else{
            for( var i = 0; i < window.HostAttrPlugins.length; i++ ){
              window.HostAttrPlugins[i].removeClicked(this, sel[0]);
            }
          }
        }
      }]
    }));

    this.callParent(arguments);

    var childstore;
    for( var i = 0; i < window.HostAttrPlugins.length; i++ ){
      childstore = window.HostAttrPlugins[i].getStore(this);
      this.pluginstores.push(childstore);
      treestore.getRootNode().appendChild(childstore.getRootNode());
    }
  },
  setHost: function(host){
    this.host = host;
    for( var i = 0; i < this.pluginstores.length; i++ ){
      this.pluginstores[i].getRootNode().collapse();
      this.pluginstores[i].proxy.extraParams.hostkwds = { host__id: host.id };
      this.pluginstores[i].load();
    }
  },
  refresh: function(){
    this.setHost(this.host);
  }
});


Ext.define('Ext.oa.Ifconfig__Host_Groups_Panel', {
  extend: 'Ext.Panel',
  alias: "widget.ifconfig__host_group_panel",
  initComponent: function(){
    Ext.apply(this, Ext.apply(this.initialConfig, {
      id: "ifconfig__host_group_panel_inst",
      title: gettext('Hosts'),
      layout: 'border',
      items: [{
        xtype: "ifconfig__host_panel",
        id:    "ifconfig__host_panel_inst",
        region: "center",
        listeners: {
          itemclick: function( self, record, item, index, evt, evtOpts ){
            Ext.getCmp("ifconfig__host_attributes_panel_inst").setHost(record.data);
          }
        }
      }, {
        region: "east",
        width: (Ext.core.Element.getViewWidth() - 200) / 2,
        split: true,
        title: gettext("Host Attributes"),
        id:    "ifconfig__host_attributes_panel_inst",
        xtype: 'ifconfig__host_attributes_panel'
      }]
    }));
    this.callParent(arguments);
  },
  refresh: function(){
    Ext.getCmp("ifconfig__host_panel_inst").refresh();
    Ext.getCmp("ifconfig__host_attributes_panel_inst").refresh();
  }
});


Ext.oa.Ifconfig__Host_Module =  {
  panel: "ifconfig__host_group_panel",
  prepareMenuTree: function(tree){
    tree.appendToRootNodeById("menu_system", {
      text: gettext('Hosts'),
      leaf: true,
      icon: MEDIA_URL + '/icons2/22x22/apps/nfs.png',
      panel: 'ifconfig__host_group_panel_inst'
    });
  }
};


window.MainViewModules.push( Ext.oa.Ifconfig__Host_Module );

// kate: space-indent on; indent-width 2; replace-tabs on;