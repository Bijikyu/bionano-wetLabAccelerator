'use strict';

/**
 * @ngdoc function
 * @name transcripticApp.controller:TestingRestyleCtrl
 * @description
 * # TestingRestyleCtrl
 * Controller of the transcripticApp
 */
angular.module('transcripticApp')
  .controller('TestingRestyleCtrl', function ($scope, $http, simpleLogin, FBProfile, ProtocolHelper) {
    var self = this;

    self.allProtocols = ProtocolHelper.protocols;

    self.currentProtocol = ProtocolHelper.currentProtocol;

    self.loadDemo = function () {
      $http.get('demo_protocols/omniprotocol/protocol_transfer.json').success(function (d) {
        ProtocolHelper.assignCurrentProtocol(d);
      });
    };

    $scope.modalShown = false;
    $scope.toggleModal = function() {
      $scope.modalShown = !$scope.modalShown;
    };
  });
