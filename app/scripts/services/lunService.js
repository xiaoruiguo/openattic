angular.module('openattic')
  .factory('LunService', function ($resource) {
    'use strict';
    return $resource('/openattic/api/luns/:id', {
      id: '@id'
    }, {
      update: {method: 'PUT'},
      query: {
        method: 'GET',
        isArray: true,
        transformResponse: function (data) {
          return JSON.parse(data).results;
        }
      },
      filter: {
        method: 'GET',
        url: '/openattic/api/luns'
      }
    });
  });
