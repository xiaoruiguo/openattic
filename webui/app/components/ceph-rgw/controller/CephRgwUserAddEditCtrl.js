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

var app = angular.module("openattic.cephRgw");
app.controller("CephRgwUserAddEditCtrl", function ($scope, $state, $stateParams, $uibModal,
    cephRgwHelpersService, cephRgwUserService) {
  $scope.user = {
    "subusers": [],
    "keys": [],
    "swift_keys": [],
    "caps": []
  };
  $scope.error = false;
  $scope.requests = [];

  if (!$stateParams.user_id) {
    $scope.editing = false;

    $scope.submitAction = function (userForm) {
      $scope.submitted = true;
      if (userForm.$valid === true) {
        // Create a new user.
        var args = _getPutArgs();
        cephRgwUserService.put(args, undefined)
          .$promise
          .then(function () {
            $state.go("ceph-rgw-users");
          }, function () {
            userForm.$submitted = false;
          });
      }
    };

    // Check if user_id already exists.
    $scope.$watch("user.user_id", function (uid) {
      // Reset the validity flag by default.
      $scope.userForm.user_id.$setValidity("uniqueuserid", true);
      // Exit immediately if user ID is empty.
      if (!angular.isString(uid) || !uid.length) {
        return;
      }
      cephRgwUserService.query({"uid": uid})
        .$promise
        .then(function (res) {
          $scope.userForm.user_id.$setValidity("uniqueuserid", res.length === 0);
        })
        .catch(function (error) {
          // Do not display the error toasty if the user does not exist (the Admin Ops API
          // returns a 404 in this case).
          if (error.status === 404) {
            error.preventDefault();
          }
        });
    });
  } else {
    $scope.editing = true;

    // Load the user data.
    cephRgwUserService.get({"uid": $stateParams.user_id})
      .$promise
      .then(function (res) {
        // Map capabilities.
        var mapPerm = {"read, write": "*"};
        angular.forEach(res.caps, function (cap) {
          if (cap.perm in mapPerm) {
            cap.perm = mapPerm[cap.perm];
          }
        });
        $scope.user = res;
      })
      .catch(function (error) {
        $scope.error = error;
      });

    $scope.submitAction = function (userForm) {
      $scope.submitted = true;
      // Check if the general user information is modified. If this is
      // the case, then add another request that modifies that data via
      // RGW Admin Ops API call.
      if (userForm.$dirty === true) {
        var args = _getPostArgs(userForm);
        _addRequest(function (args) {
          return cephRgwUserService.post(args, undefined).$promise;
        }, [args]);
      }
      // Execute all requests (RGW Admin Ops API call) in sequential order.
      var fn = function (request) {
        var promise = request.getPromiseFn.apply(this, request.args);
        promise.then(function () {
          // Remove the successful request.
          $scope.requests.shift();
          // Execute another request?
          if ($scope.requests.length > 0) {
            fn($scope.requests[0]);
          } else {
            $scope.goToListView();
          }
        }, function () {
          userForm.$submitted = false;
        });
      };
      if ($scope.requests.length > 0) {
        fn($scope.requests[0]);
      } else {
        $scope.goToListView();
      }
    };
  }

  /**
   * Go to the users list view.
   */
  $scope.goToListView = function () {
    $state.go("ceph-rgw-users");
  };

  /**
   * Execute action if the 'Cancel' button has been pressed.
   */
  $scope.cancelAction = function () {
    $scope.goToListView();
  };

  /**
   * Display a modal dialog.
   * @param type The type of the dialog, e.g. subuser|s3key|swiftkey|capability.
   * @param index Optional. The index of the selected configuration object.
   * @private
   */
  var _showModalDialog = function (type, index) {
    var typeMap = {
      subuser: {
        templateUrl: "components/ceph-rgw/templates/cephRgwUserAddEditSubuserModal.html",
        controller: "CephRgwUserAddEditSubuserModalCtrl"
      },
      s3key: {
        templateUrl: "components/ceph-rgw/templates/cephRgwUserAddEditS3KeyModal.html",
        controller: "CephRgwUserAddEditS3KeyModalCtrl"
      },
      swiftkey: {
        templateUrl: "components/ceph-rgw/templates/cephRgwUserAddEditSwiftKeyModal.html",
        controller: "CephRgwUserAddEditSwiftKeyModalCtrl"
      },
      capability: {
        templateUrl: "components/ceph-rgw/templates/CephRgwUserAddEditCapabilityModal.html",
        controller: "CephRgwUserAddEditCapabilityModalCtrl"
      }
    };
    return $uibModal.open({
      windowTemplateUrl: "templates/messagebox.html",
      templateUrl: typeMap[type].templateUrl,
      controller: typeMap[type].controller,
      resolve: {
        user: function () {
          return $scope.user;
        },
        index: function () {
          return index;
        }
      }
    });
  };

  /**
   * Helper function to get the arguments of the PUT request when a new
   * user is created.
   * @private
   */
  var _getPutArgs = function () {
    var caps = [];
    angular.forEach($scope.user.caps, function (cap) {
      caps.push(cap.type + "=" + cap.perm.replace(" ", ""));
    });
    var args = {
      "uid": $scope.user.user_id,
      "display-name": $scope.user.display_name
    };
    if ($scope.user.suspended) {
      angular.extend(args, {
        "suspended": Boolean($scope.user.suspended)
      });
    }
    if (angular.isString($scope.user.email) && $scope.user.email !== "") {
      angular.extend(args, {
        "email": $scope.user.email
      });
    }
    if (caps.length > 0) {
      angular.extend(args, {
        "user-caps": caps.join(";")
      });
    }
    if ($scope.user.max_buckets > 0) {
      angular.extend(args, {
        "max-buckets": $scope.user.max_buckets
      });
    }
    if (!$scope.user.generate_key) {
      angular.extend(args, {
        "access-key": $scope.user.access_key,
        "secret-key": $scope.user.secret_key
      });
    } else {
      angular.extend(args, {
        "generate-key": true
      });
    }
    return args;
  };

  /**
   * Helper function to get the arguments for the POST request when the user
   * configuration is modified.
   * @param userForm The user formular.
   * @private
   */
  var _getPostArgs = function (userForm) {
    var args = {
      "uid": $scope.user.user_id
    };
    if (userForm.display_name.$dirty === true) {
      angular.extend(args, {
        "display-name": $scope.user.display_name
      });
    }
    if (userForm.email.$dirty === true) {
      angular.extend(args, {
        "email": $scope.user.email
      });
    }
    if (userForm.max_buckets.$dirty === true) {
      angular.extend(args, {
        "max-buckets": $scope.user.max_buckets
      });
    }
    if (userForm.suspended.$dirty === true) {
      angular.extend(args, {
        "suspended": Boolean($scope.user.suspended)
      });
    }
    return args;
  };

  /**
   * Helper function to get the arguments for the request e.g. add, modify or
   * delete subusers, keys and capabilites.
   * @param type The request type, e.g. subuser, s3key, swiftkey or caps.
   * @param action The request action, e.g. add, modify or delete.
   * @param data The request data.
   * @private
   */
  var _getTypeArgs = function (type, action, data) {
    var mapPermission = {
      "full-control": "full",
      "read-write": "readwrite"
    };
    var args = {
      "type": type,
      "uid": $scope.user.user_id
    };
    switch (action) {
      case "add":
        switch (type) {
          case "subuser":
            angular.extend(args, {
              "subuser": data.subuser,
              "access": (data.permissions in mapPermission) ?
                mapPermission[data.permissions] :
                data.permissions,
              "key-type": "swift"
            });
            if (!data.generate_secret) {
              angular.extend(args, {
                "secret-key": data.secret_key
              });
            } else {
              angular.extend(args, {
                "generate-secret": true
              });
            }
            break;
          case "s3key":
            angular.extend(args, {
              "type": "key",
              "key-type": "s3",
              "generate-key": Boolean(data.generate_key)
            });
            if (cephRgwHelpersService.isSubuser($scope.user, data.user)) {
              angular.extend(args, {
                "subuser": data.user
              });
            }
            if (!data.generate_key) {
              angular.extend(args, {
                "access-key": data.access_key,
                "secret-key": data.secret_key
              });
            }
            break;
          case "swiftkey":
            /* A key is automatically created with a subuser. It is not possible to
             * apply multiple Swift keys per user.
            angular.extend(args, {
              "type": "key",
              "subuser": data.user,
              "key-type": "swift",
              "generate-key": Boolean(data.generate_key)
            });
            if (!data.generate_key) {
              angular.extend(args, {
                "secret-key": data.secret_key
              });
            }
            */
            break;
          case "caps":
            angular.extend(args, {
              "user-caps": data.type + "=" + data.perm
            });
            break;
        }
        break;
      case "modify":
        switch (type) {
          case "subuser":
            angular.extend(args, {
              "subuser": data.subuser,
              "access": (data.permissions in mapPermission) ?
                mapPermission[data.permissions] :
                data.permissions
            });
            break;
          case "s3key":
            break;
          case "swiftkey":
            break;
          case "caps":
            break;
        }
        break;
      case "delete":
        switch (type) {
          case "subuser":
            angular.extend(args, {
              "subuser": data.id,
              "purge-keys": true
            });
            break;
          case "s3key":
            angular.extend(args, {
              "type": "key",
              "key-type": "s3",
              "access-key": data.access_key
            });
            break;
          case "swiftkey":
            /* A Swift key is purged when the subuser is deleted.
            angular.extend(args, {
              "type": "key",
              "key-type": "swift",
              "subuser": data.user
            });
            */
            break;
          case "caps":
            angular.extend(args, {
              "user-caps": data.type + "=" + data.perm
            });
            break;
        }
        break;
    }
    return args;
  };

  /**
   * Get the deferred promise that will be executed when the 'Submit' button is
   * pressed. This should be done when a subuser, capability or key is created,
   * modified or deleted.
   * @param type The request type, e.g. subuser, s3key, swiftkey or caps.
   * @param action The request action, e.g. add, modify or delete.
   * @param data The request data.
   * @private
   */
  var _getPromiseByType = function (type, action, data) {
    var promise;
    var args = _getTypeArgs(type, action, data);
    switch (action) {
      case "add":
        promise = cephRgwUserService.putType(args, undefined).$promise;
        break;
      case "modify":
        promise = cephRgwUserService.postType(args, undefined).$promise;
        break;
      case "delete":
        promise = cephRgwUserService.deleteType(args, undefined).$promise;
        break;
    }
    return promise;
  };

  /**
   * Add a request will be executed when the 'Submit' button is pressed.
   * @param fn The function that builds the promise.
   * @param args The function arguments.
   * @private
   */
  var _addRequest = function (fn, args) {
    $scope.requests.push({
      getPromiseFn: fn,
      args: angular.copy(args)
    });
  };

  $scope.addEditSubuser = function (index) {
    var modalInstance = _showModalDialog("subuser", index);
    modalInstance.result.then(function (result) {
      _addRequest(_getPromiseByType, ["subuser", result.action, result.data]);
      var subuser = {
        "id": cephRgwHelpersService.buildSubuserId($scope.user.user_id, result.data.subuser),
        "permissions": result.data.permissions
      };
      switch (result.action) {
        case "add":
          $scope.user.subusers.push(subuser);
          // Additionally a Swift key will be added.
          $scope.user.swift_keys.push({
            "user": subuser.id,
            "secret_key": result.data.generate_secret ?
              "Apply your changes first..." : result.data.secret_key
          });
          break;
        case "modify":
          $scope.user.subusers[index] = subuser;
          break;
      }
    });
  };

  $scope.removeSubuser = function (index) {
    var subuser = $scope.user.subusers[index];
    _addRequest(_getPromiseByType, ["subuser", "delete", subuser]);
    // Remove the associated S3 keys.
    $scope.user.keys = $scope.user.keys.filter(function (key) {
      return key.user !== subuser.id;
    });
    // Remove the associated Swift keys.
    $scope.user.swift_keys = $scope.user.swift_keys.filter(function (key) {
      return key.user !== subuser.id;
    });
    // Finally remove the subuser itself.
    $scope.user.subusers.splice(index, 1);
  };

  $scope.addViewS3Key = function (index) {
    var modalInstance = _showModalDialog("s3key", index);
    modalInstance.result.then(function (result) {
      _addRequest(_getPromiseByType, ["s3key", result.action, result.data]);
      switch (result.action) {
        case "add":
          $scope.user.keys.push({
            "user": result.data.user,
            "access_key": result.data.generate_key ?
              "Apply your changes first..." : result.data.access_key,
            "secret_key": result.data.generate_key ?
              "Apply your changes first..." : result.data.secret_key
          });
          break;
      }
    });
  };

  $scope.removeS3Key = function (index) {
    _addRequest(_getPromiseByType, ["s3key", "delete", $scope.user.keys[index]]);
    $scope.user.keys.splice(index, 1);
  };

  $scope.addViewSwiftKey = function (index) {
    var modalInstance = _showModalDialog("swiftkey", index);
    modalInstance.result.then(function (result) {
      _addRequest(_getPromiseByType, ["swiftkey", result.action, result.data]);
      switch (result.action) {
        case "add":
          $scope.user.swift_keys.push({
            "user": result.data.user,
            "secret_key": result.data.generate_key ?
              "Apply your changes first..." : result.data.secret_key
          });
          break;
      }
    });
  };

  /* A Swift key is purged when the subuser is deleted.
  $scope.removeSwiftKey = function (index) {
    _addRequest(_getPromiseByType, ["swiftkey", "delete", $scope.user.swift_keys[index]]);
    $scope.user.swift_keys.splice(index, 1);
  };
  */

  $scope.addEditCapability = function (index) {
    var modalInstance = _showModalDialog("capability", index);
    modalInstance.result.then(function (result) {
      _addRequest(_getPromiseByType, ["caps", result.action, result.data]);
      switch (result.action) {
        case "add":
          $scope.user.caps.push(angular.copy(result.data));
          break;
      }
    });
  };

  $scope.removeCapability = function (index) {
    _addRequest(_getPromiseByType, ["caps", "delete", $scope.user.caps[index]]);
    $scope.user.caps.splice(index, 1);
  };
});
