/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
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

var app = angular.module("openattic");
app.controller("VolumeResizeCtrl", function ($scope, VolumeService, poolsService, SizeParserService, $uibModalInstance,
    volume, Notification) {
  $scope.volume = volume;
  $scope.input = {
    newsize: "",
    resizeForm: ""
  };

  poolsService.get(volume.source_pool)
      .$promise
      .then(function (res) {
        $scope.pool = res;
        $scope.pool.usage.max_new_fsv = $scope.pool.usage.max_new_fsv + $scope.volume.usage.size;
      });

  $scope.resize = function () {
    $scope.submitted = true;
    if ($scope.input.resizeForm.$valid) {
      new VolumeService({
        id: $scope.volume.id,
        megs: SizeParserService.parseInt($scope.input.newsize)
      })
          .$update()
          .then(function (res) {
            $uibModalInstance.close("resized");
          });
    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss("cancel");

    Notification.warning({
      title: "Resize volume",
      msg: "Cancelled"
    });
  };
});
