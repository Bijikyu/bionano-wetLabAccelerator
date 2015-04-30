'use strict';

/**
 * @ngdoc directive
 * @name transcripticApp.directive:txCredTranscriptic
 * @description
 * # txCredTranscriptic
 *
 * usage: <tx-cred-transcriptic ng-form="transcripticCred"></tx-cred-transcriptic>
 * !!! do not use 'form' instead of 'ng-form'
 *
 * and will expose to formController
 */
angular.module('transcripticApp')
  .directive('txCredTranscriptic', function (simpleLogin, FBProfile) {
    return {
      templateUrl: 'views/tx-cred-transcriptic.html',
      restrict: 'E',
      require: 'form',
      bindToController: true,
      controllerAs: 'authCtrl',
      controller: function ($scope, $element, $attrs) {

        var self = this;

        //don't actually bind to Auth here, Auth listens to 'txAuth' from firebase directly
        //will need to refactor to pull via REST or something, and shuold update DB automatically
        var bindtoWatcher = angular.noop;
        simpleLogin.watch(function(user) {
          self.loggedIn = !!user;
          if (!!user) {
            bindtoWatcher();
            new FBProfile(user.uid, 'txAuth')
              .$asObject()
              .$bindTo($scope, 'auth')
              .then(function (unbind) {
                bindtoWatcher = unbind;
              });
          }
        });

        //note that temporarily we will get errors in the console for invalid credentials (and you have to be signed into firebase), but once move DB that will go away.
      }
    };
  });