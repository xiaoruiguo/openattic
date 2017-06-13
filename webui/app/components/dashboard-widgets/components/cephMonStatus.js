/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (c) 2017 SUSE LLC
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation; version 2.
 *
 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * As additional permission under GNU GPL version 2 section 3, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 1, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
"use strict";

var app = angular.module("openattic.dashboardWidgets");
app.component("cephMonStatus", {
  templateUrl: "components/dashboard-widgets/templates/ceph-mon-status.html",
  bindings: {
    settings: "="
  },
  controller: function ($scope, $interval, $filter, cephClusterService) {
    var updateInterval;
    var self = this;
    this.isLoading = false;

    this.$onInit = function () {
      self.updateClusterInformation();
      updateInterval = $interval(function () {
        self.updateClusterInformation();
      }, 60000, false);
    };

    this.updateClusterInformation = function () {
      self.isLoading = true;
      cephClusterService
        .status({
          fsid: self.settings.cluster.fsid
        })
        .$promise
        .then(function (cluster) {
          self.createPieData(self.getCombinedHealth(cluster));
        })
        .finally(function () {
          $interval(function () {
            self.isLoading = false;
          }, 1000, 1);
        });
    };

    this.getCombinedHealth = function (cluster) {
      var clusterHealth = cluster.health;
      var health = {
        "HEALTH_OK": [],
        "HEALTH_WARN": [],
        "HEALTH_ERR": []
      };
      angular.forEach(cluster.monmap.mons, function (mon) {
        mon = self.extendMon(mon, clusterHealth.timechecks.mons);
        mon = self.extendMon(mon, clusterHealth.health.health_services[0].mons);
        if (!mon.health) {
          mon.health = "HEALTH_ERR";
        }
        health[mon.health].push(mon);
      });
      return health;
    };

    this.extendMon = function (mon, objArray) {
      var obj = objArray.find(function (obj) {
        return mon.name === obj.name;
      });
      if (mon.health && obj) {
        obj.health = self.worstHealthState(mon.health, obj.health);
      }
      if (obj) {
        mon = angular.extend({}, mon, obj);
      }
      return mon;
    };

    this.worstHealthState = function (health1, health2) {
      var healthStateValue = {
        "HEALTH_OK": 1,
        "HEALTH_WARN": 2,
        "HEALTH_ERR": 3
      };
      return healthStateValue[health1] > healthStateValue[health2] ? health1 : health2;
    };

    this.createPieData = function (health) {
      var data = [];
      angular.forEach(health, function (mons) {
        data = data.concat(mons);
      });
      self.pieChart = {
        data: data,
        options: self.createPieChart(health)
      };
    };

    this.createPieChart = function (health) {
      var worstState = health.HEALTH_ERR.length > 0 ? "HEALTH_ERR" :
          (health.HEALTH_WARN.length > 0 ? "HEALTH_WARN" : "HEALTH_OK");
      return {
        chart: {
          type: "pieChart",
          showLabels: false,
          x: function (monState) {
            return monState.name;
          },
          y: function () {
            return 1;
          },
          tooltip: {
            contentGenerator: self.nvd3Tooltip
          },
          color: self.nvd3Colorize,
          growOnHover: false,
          donut: true,
          showLegend: false,
          title: health[worstState].length,
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        },
        styles: {
          classes: {
            okState: worstState === "HEALTH_OK",
            warnState: worstState === "HEALTH_WARN",
            errorState: worstState === "HEALTH_ERR"
          }
        }
      };
    };

    this.nvd3Colorize = function (data) {
      switch (data.health){
        case "HEALTH_OK":
          return "#5cb85c"; // Bootstrap success
        case "HEALTH_WARN":
          return "#f0ad4e"; // Bootstrap warning
        default:
          return "#d9534f"; // Bootstrap danger
      }
    };

    this.nvd3Tooltip = function (d) {
      var data = d.data;
      return [
          "<div class=\"panel-default\">",
          "<div class=\"panel-heading small-padding\"><table><thead><tr>",
          "<td class=\"legend-color-guide\"><div style=\"background-color: " + d.series[0].color + ";\"></div></td>",
          "<td class=\"key\">" + data.name + "</td>",
          "</tr></thead></table></div>",
          "<div class=\"panel-body small-padding\">" + self.createMonContent(data) + "</div>",
          "</div>"
        ].join("");
    };

    this.createMonContent = function (mon) {
      return [
          "Addr: " + mon.addr,
          "Health: " + mon.health,
          mon.details ? "Details: " + mon.details : ""
        ].join("<br>");
    };

    // Watcher
    $scope.$watch("widget.settings", function (newValue, oldValue) {
      if (angular.equals(newValue, oldValue)) {
        return;
      }
      self.updateClusterInformation();
    });

    // Event-Handler
    this.$onDestroy = function () {
      $interval.cancel(updateInterval);
    };

    $scope.$on("gridster-resized", function () {
      self.nvd3api.update();
    });

    $scope.$on("gridster-item-transition-end", function () {
      self.nvd3api.update();
    });
  }
});