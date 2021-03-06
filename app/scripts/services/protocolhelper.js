/**
 * Copyright 2015 Autodesk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * @ngdoc service
 * @name wetLabAccelerator.protocolHelperNew
 * @description
 * # protocolHelperNew
 * Service in the wetLabAccelerator.
 */
angular.module('wetLabAccelerator')
  .service('ProtocolHelper', function ($q, $rootScope, $timeout, UUIDGen, Omniprotocol, Autoprotocol, Authentication, Notify, Database) {
    var self = this;

    self.currentProtocol = {};

    self.assignCurrentProtocol = function (newProtocol) {
      $timeout(function () {
        console.log('new protocol', newProtocol);
        $rootScope.$broadcast('editor:newprotocol');
      });

      _.assign(self.currentProtocol, self.createNewProtocol(newProtocol));

      $rootScope.$applyAsync();

      return self.currentProtocol;
    };

    self.getProtocol = function (id) {
      return Database.getProject(id);
    };

    self.createNewProtocol = function (inputProtocol) {
      return _.assign(Omniprotocol.utils.getScaffoldProtocol(), {
        metadata: generateNewProtocolMetadata()
      }, inputProtocol);
    };

    self.addProtocol = function (inputProtocol) {
      var protocol = self.createNewProtocol(inputProtocol);

      return Database.saveProject(protocol)
        .then(function () {
          return protocol;
        });
    };

    self.deleteProtocol = function (protocol) {
      return Database.removeProject(protocol);
    };

    self.saveProtocol = function (protocol) {
      if (!protocolHasNecessaryMetadataToSave(protocol)) {
        assignNecessaryMetadataToProtocol(protocol);
      }

      return Database.saveProject(protocol).
        then(self.assignCurrentProtocol);
    };

    self.duplicateProtocol = function (protocol) {
      var dup = _.cloneDeep(protocol);

      self.clearIdentifyingInfo(dup);

      return self.saveProtocol(dup)
        .then(function () {
          return dup;
        });
    };

    self.clearIdentifyingInfo = function (protocol) {
      return _.assign(protocol.metadata, generateNewProtocolMetadata());
    };

    self.clearProtocol = function (protocol) {
      return $q.when(_.assign(protocol, Omniprotocol.utils.getScaffoldProtocol()));
    };

    self.convertToAutoprotocol = function (protocol) {

      //pre-process the protocol
      _.flow(
        assertContainersNamed,
        Omniprotocol.utils.assignParametersToAllFields,
        clearVerifications
      )(protocol);


      try {
        return Autoprotocol.fromAbstraction(protocol);
      } catch (e) {
        if (e instanceof ConversionError) {
          $rootScope.$broadcast('editor:verificationFailureLocal', [{
            $index   : e.$index,
            message  : e.message,
            field    : e.field,
            fieldName: e.fieldName
          }]);
        } else {
          //how to handle?
          console.error(e);
          Notify({
            message: 'Unknown error converting protocol to Autoprotocol. Check browser console.',
            error  : true
          });
        }
      }
    };


    // helpers //

    //todo - this really belongs in omniprotocol utils
    function generateNewProtocolMetadata () {
      return {
        id    : UUIDGen(),
        date  : '' + (new Date()).valueOf(),
        type  : 'protocol',
        author: {
          name: Authentication.getUsername(),
          id  : Authentication.getUserId()
        },
        "tags": [],
        "db"  : {},
        "version" : "1.0.0"
      }
    }

    function assignNecessaryMetadataToProtocol (protocol) {
      var oldMetadata = _.cloneDeep(protocol.metadata);
      return _.assign(protocol.metadata, {name : "My Protocol"}, generateNewProtocolMetadata(), oldMetadata);
    }

    function protocolHasNecessaryMetadataToSave (protocol) {
      return _.every(['id', 'name', 'type', 'author'], function (field) {
        return !_.isEmpty(_.result(protocol.metadata, field));
      });
    }

    /******* utilities ********/

    function assertContainersNamed (protocol) {
      _(protocol.parameters)
        .filter({type: 'container'})
        .forEach(function (param, index) {
          param.name = param.name || 'container' + index;
        })
        .value();
      return protocol;
    }

    function clearVerifications (protocol) {
      _.forEach(protocol.parameters, function (param) {
        delete param.verification;
      });
      return protocol;
    }


    //watch for auth changes
    Authentication.watch(function (creds) {
      self.assignCurrentProtocol({});
    });

  });
