'use strict';

/**
 * @ngdoc overview
 * @name transcripticApp
 * @description
 * # transcripticApp
 *
 * Main module of the application.
 */
angular
  .module('transcripticApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap',
    'angularFileUpload',
    'firebase',
    'tx.communication',
    'tx.datavis',
    'tx.protocolEditor'
  ])
  .config(function ($routeProvider) {

    $routeProvider
      .when('/', {
        controller  : 'HomeCtrl',
        controllerAs: 'homeCtrl',
        templateUrl : 'views/routes/home.html'
      })

      //main routes

      .when('/protocol', {
        templateUrl : 'views/routes/protocol.html',
        controller  : 'ProtocolCtrl',
        controllerAs: 'restyleCtrl', //todo - rename to ProtocolCtrl, make sure not passed down and breaking
        resolve     : {
          protocol: ['ProtocolHelper', function (ProtocolHelper) {
            if (_.isEmpty(ProtocolHelper.currentProtocol)) {
              ProtocolHelper.assignCurrentProtocol(ProtocolHelper.createNewProtocol());
            }
          }]
        }
      })
      .when('/results', {
        templateUrl : 'views/routes/results.html',
        controller  : 'ResultsCtrl',
        controllerAs: 'resultsCtrl'
      })
      .when('/auth', {
        templateUrl: 'views/routes/auth.html'
      })

      //testing routes

      /*
      .when('/gallery', {
        templateUrl : 'views/routes/gallery.html',
        controller  : 'GalleryCtrl',
        controllerAs: 'galleryCtrl'
      })
      .when('/testing', {
        redirectTo: '/testing/plate'
      })
      .when('/testing/plate', {
        templateUrl : 'views/testing/plate.html',
        controller  : 'TestingPlateCtrl',
        controllerAs: 'testCtrl'
      })
      .when('/testing/field', {
        templateUrl : 'views/testing/field.html',
        controller  : 'TestingFieldCtrl',
        controllerAs: 'testingFieldCtrl'
      })
      */
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function (simpleLogin, Authentication, $rootScope, $location, FBProfile, $q, Platform, Database) {

    $rootScope.$on('$locationChangeSuccess', function () {
      $rootScope.currentPath = $location.path();
    });

    //testing - importing of runs and protocols

    /*
    simpleLogin.watch(function (user) {
      if (!!user) {

        var txAuthSync = new FBProfile(user.uid, 'txAuth');
        var txAuth = txAuthSync.$asObject();

        Platform.authenticate('maxwell@autodesk.com')
          .then(function () {

            var txAuth = new FBProfile(user.uid, 'txAuth').$asObject();
            txAuth.$watch(function () {
              console.log(txAuth);

              var keymap = {
                'email'       : 'transcripticEmail',
                'key'         : 'transcripticKey',
                'organization': 'transcripticOrg'
              };

              return $q.all(_.map(keymap, function (dbkey, txkey) {
                Platform.userValue(dbkey, txAuth[txkey]);
              }));
            });
          });
      }
    });
    */

    /*
    simpleLogin.watch(function (user) {
      if (!!user) {

        var txAuth = new FBProfile(user.uid, 'txAuth').$asObject();

        var firebaseRunSync = new FBProfile(user.uid, 'runs');
        var firebaseRuns    = firebaseRunSync.$asArray();

        var firebaseProtocolSync = new FBProfile(user.uid, 'omniprotocols');
        var firebaseProtocols    = firebaseProtocolSync.$asArray();

        Platform.authenticate('maxwell@autodesk.com')
          .then(firebaseProtocols.$loaded)
          .then(function () {
            //use only if uploading to DB
            return $q.all(_.map(firebaseProtocols, function (protocol) {
              var pruned = Database.removeExtraneousFields(protocol);
              if (_.has(pruned, 'groups')) {
                return Platform.saveProject(pruned);
              }
            }));
          })
          .then(firebaseRuns.$loaded)
          .then(function () {
            //use only if uploading to DB
            return $q.all(_.map(firebaseRuns, function (protocol) {
              var pruned = Database.removeExtraneousFields(protocol);
              return Platform.saveProject(pruned);
            }));
          })
          .then(Platform.get_all_project_ids)
          .then(function (rpc) {
            console.log(rpc);
            return $q.all(_.map(rpc.result, Platform.getProject));
          })
          .then(function (projects) {
            return _.map(projects, Database.removeExtraneousFields);
          })
          .then(console.log.bind(console));
      }
    });
    */

  });
