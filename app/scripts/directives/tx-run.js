'use strict';

/**
 * @ngdoc directive
 * @name transcripticApp.directive:txRun
 * @description
 * # txRun
 */
angular.module('transcripticApp')
  .directive('txRun', function ($q, $timeout, $rootScope, Auth, Autoprotocol, Omniprotocol, Run, Project, ProtocolHelper, RunHelper) {
    return {
      templateUrl     : 'views/tx-run.html',
      restrict        : 'E',
      scope           : {
        protocolForm: '='
      },
      bindToController: true,
      controllerAs    : 'runCtrl',
      controller      : function ($scope, $element, $attrs) {

        var self = this;

        self.protocol = ProtocolHelper.currentProtocol;

        self.projects = [];

        Auth.watch(function () {
          self.projects = Project.list();
        });

        self.findProjectByname = function (projectName) {
          return _.find(self.projects, _.matches({name: projectName}));
        };

        // SUBMIT / ANALYZE RUNS

        function resourceWrap (funcToRun, toModify) {
          angular.extend(toModify.config, {
            initiated : true,
            processing: true
          });

          var projectIdPromise;

          if (_.isObject(self.project) && _.has(self.project, 'id')) {
            projectIdPromise = $q.when(self.project.id);
          }
          //if edited project from dropdown, and not an object
          else {
            var found = self.findProjectByname(self.project);
            //first check and make sure not in projects
            if (_.isObject(found) && _.has(found, 'id')) {
              projectIdPromise = $q.when(found.id);
            }
            //create it and then use for posting later
            else {
              projectIdPromise = Project.create({name: self.project}).$promise.then(function (project) {

                //hack - force an update (maybe move to service? use this so rarely...)
                $timeout(function () {
                  self.projects = Project.list();
                }, 250);

                return project.id;
              });
            }
          }

          projectIdPromise.then(function (projectId) {
            funcToRun(self.protocol, projectId).
              then(function runSuccess (d) {
                console.log(d);
                angular.extend(toModify.config, {
                  processing: false,
                  error     : false
                });
                toModify.response = d;
                $rootScope.$broadcast('editor:verificationSuccess', d);
              }, function runFailure (e) {
                console.log(e);
                angular.extend(toModify.config, {
                  processing: false,
                  error     : true
                });
                //use as simple check for something like a 404 error - i.e. not protocol error but $http error
                if (angular.isUndefined(e.data) || _.isUndefined(e.data.protocol)) {
                  toModify.response = {"error": "Request did not go through... check the console"};
                } else {
                  $rootScope.$broadcast('editor:verificationFailure', e.data.protocol);
                  toModify.response = e.data.protocol;
                }
              });
          });
        }

        self.analysisResponse = {
          config  : {
            type          : "Verification",
            textProcessing: "Processing Verification...",
            textSuccess   : "Protocol valid",
            textError     : "Problems with Protocol listed below"
          },
          response: {}
        };
        self.runResponse      = {
          config  : {
            type          : "Run",
            textProcessing: "Processing Run...",
            textSuccess   : "Protocol initiated",
            textError     : "There was an error running your protocol"
          },
          response: {}
        };

        self.analyze = angular.bind(self, resourceWrap, RunHelper.verifyRun, self.analysisResponse);
        self.submit  = angular.bind(self, resourceWrap, RunHelper.createRun, self.runResponse);


      },
      link            : function (scope, element, attrs) {


      }
    };

  });
