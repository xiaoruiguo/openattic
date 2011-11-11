Ext.namespace("Ext.oa");

Ext.oa.getDefaultPortlets = function(tools){
  return [{
    title: 'LVs',
    layout:'fit',
    id: 'portlet_lvs',
    tools: tools,
    items: new Ext.grid.GridPanel({
      height: 250,
      viewConfig: { forceFit: true },
      split: true,
      store: (function(){
        // Anon function that is called immediately to set up the store's DefaultSort
        var store = new Ext.data.DirectStore({
          autoLoad: true,
          fields: ['name', 'megs', 'filesystem',  'formatted', 'id', 'state', 'fs', {
            name: 'fsused',
            mapping: 'fs',
            sortType: 'asInt',
            convert: function( val, row ){
              if( val === null || typeof val.stat === "undefined" )
                return '';
              return (val.stat.used / val.stat.size * 100 ).toFixed(2);
            }
          }],
          directFn: lvm__LogicalVolume.all
        });
        store.setDefaultSort("fsused", "DESC");
        return store;
      }()),
      colModel:  new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [{
          header: "LV",
          width: 200,
          dataIndex: "name"
        }, {
          header: "Size",
          width: 75,
          dataIndex: "megs",
          align: 'right',
          renderer: function( val, x, store ){
            return String.format("{0} GB", (val / 1000).toFixed(2));
          }
        }, {
          header: "Used",
          width: 75,
          dataIndex: "fsused",
          align: 'right',
          renderer: function( val, x, store ){
            if( !val )
              return '';
            if( val > Ext.state.Manager.get("lv_red_threshold", 90.0) )
              var color = "red";
            else
              var color = "green";
            return String.format('<span style="color:{1};">{0}%</span>', val, color);
          }
        }]
      })
    })
  }, {
    title: 'NFS',
    layout:'fit',
    id: 'portlet_nfs',
    tools: tools,
    items: new Ext.grid.GridPanel({
    height: 320,
    split: true,
      store: new Ext.data.DirectStore({
        autoLoad: true,
        fields: ['address', 'path', 'options', 'state'],
        directFn: nfs__Export.all
      }),
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [{
          header: "address",
          width: 100,
          dataIndex: "address"
        }, {
          header: "path",
          width: 200,
          dataIndex: "path"
        }, {
          header: "options",
          width: 200,
          dataIndex: "options"
        }, {
          header: "state",
          width: 50,
          dataIndex: "state"
        }]
      })
    })
  }, {
    title: 'CPU Stats',
    id: 'portlet_cpu',
    tools: tools,
    height: 300,
    items: (function(){
      var chart = new Ext.canvasXpress({
        options: {
          graphType: 'Pie',
          background: 'rgb(244,244,244)',
          colorScheme: 'pastel',
          pieSegmentPrecision:  0,
          pieSegmentSeparation: 0,
          pieSegmentLabels: 'inside',
          pieType: 'solid'
        },
        data: {y: {
          vars:  ['a', 'b'],
          smps:  ['CPU'],
          data:  [[1], [2]]
        }},
        events: { click: function(){} }
      });
      hoststats__HostStats.get_cpu(function(provider, result){
        if(result.result){
          var conf = {
            smps: ['CPU'],
            vars: [],
            data: []
          }
          for( var key in result.result ){
            if( key === "time_taken" ) continue;
            if( result.result[key] < 0.5 ) continue;
            conf.vars.push(key);
            conf.data.push([result.result[key]]);
          }
          chart.canvas.updateData({ y: conf });
        }
      });
      return chart;
    }())
  }, {
    title: 'RAM Stats',
    id: 'portlet_ram',
    tools: tools,
    height: 300,
    items: (function(){
      var chart = new Ext.canvasXpress({
        options: {
          graphType: 'Pie',
          background: 'rgb(244,244,244)',
          colorScheme: 'pastel',
          pieSegmentPrecision:  0,
          pieSegmentSeparation: 0,
          pieSegmentLabels: 'inside',
          pieType: 'solid'
        },
        data: {y: {
          vars:  ['a', 'b'],
          smps:  ['RAM'],
          data:  [[1], [2]]
        }},
        events: { click: function(){} }
      });
      hoststats__HostStats.get_mem(function(provider, result){
        if(result.result){
          var conf = {
            smps: ['RAM'],
            vars: [],
            data: []
          }
          for( var key in result.result ){
            conf.vars.push(key);
            conf.data.push([result.result[key]]);
          }
          chart.canvas.updateData({ y: conf });
        }
      });
      chart.on("leftclick", function(){});
      return chart;
    }())
  }];
}

// kate: space-indent on; indent-width 2; replace-tabs on;


