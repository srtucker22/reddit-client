(function() {
  'use strict';

  angular
    .module('app')
    .factory('reddit', reddit);

  reddit.$inject = [
    '$http',
    '$localStorage',
    '$q',
    '$rootScope',
    '$sessionStorage',
    'snoocore'
  ];

  function reddit(
    $http,
    $localStorage,
    $q,
    $rootScope,
    $sessionStorage,
    snoocore
  ) {
    var interval = 60 * 1000 * 5; // seconds we'll wait before totally refreshing the top feed going upwards
    var redirectUri = window.location.origin;

    /*jshint validthis: true */
    var vm = this;
    var sc;

    function init() {
      // setup sc
      sc = snoocore({
        userAgent: 'test@reddit-client3',
        oauth: {
          type: 'implicit', // required when using explicit OAuth
          key: window.location.origin === 'http://localhost:5000' ?
            'JsanZ0aOnw0PVA' : 'SLfkAxdLrxOD6A',
          redirectUri: redirectUri,
          // make sure to set all the scopes you need.
          scope: ['identity', 'read', 'save', 'history']
        }
      });

      // object to track saved posts
      vm.saved = {
        after: null,
        callbacks: {},
        data: [],
        lastCheck: null,
        uri: $rootScope.user ? '/user/' + $rootScope.user.name + '/saved' : null
      };

      // object to track top posts
      vm.top = {
        after: null,
        callbacks: {},
        data: [],
        lastCheck: null,
        uri: '/r/all/top'
      };
    }

    init();

    // attempt to login automagically
    function attemptRefresh() {
      var defer = $q.defer();
      if (shouldAttemptRefresh()) {
        return refresh($localStorage.accessToken.code);
      } else {
        defer.resolve();
      }
      return defer.promise;
    }

    // log the user into reddit
    function login(code, state) {
      // if the user is already logged in, just return the user
      if (!$rootScope.user) {
        $rootScope.loggingIn = true;

        if (vm.saved && vm.saved.data.length) {
          $localStorage.dirtySaves = vm.saved.data;
        }

        // if the user's refresh token is still around, try refreshing
        // otherwise go through OAuth
        if (!$localStorage.accessToken) {
          if (code && state) {
            // user isn't logged in, but we haz access code for next step
            return postAccessToken(code, state);
          } else {
            return getCode();
          }
        } else {
          // if the moment hasn't expired, refresh with existing token
          if (shouldAttemptRefresh()) {
            return refresh($localStorage.accessToken.code);
          } else {  // otherwise clear the token and reauth
            delete $localStorage.accessToken;
            return getCode();
          }
        }
      } else {
        var defer = $q.defer();
        defer.resolve($rootScope.user);
        return defer.promise;
      }
    }

    // deauth, remove auth key from localstorage, clear the data
    function logout() {
      var defer = $q.defer();
      sc.deauth().then(function(res) {
        $rootScope.user = null;
        delete $localStorage.accessToken;

        // clear the data
        _.each(['saved', 'top'], function(type) {
          vm[type].data = [];
          vm[type].after = null;
          vm[type].before = null;
          vm[type].lastCheck = null;
          notifyObservers(type);
        });

        // then get some fresh data
        firstPage('top').then(function() {
          // this really shouldn't need to be called
          // i'm gonna bet this is a sc issue -- but no time to fix :(
          _.each(vm.top.data, function(val) {
            val.data.saved = false;
          });
        });
        defer.resolve();
      }, function(err) {
        defer.reject(err);
      });
      return defer.promise;
    }

    // get the first page of results
    function firstPage(type) {
      return waitForUser().then(function(){
        // if the user isn't logged in, we can only return what has been saved locally
        if (type === 'saved' && !$rootScope.user) {
          var defer = $q.defer();
          notifyObservers('saved');
          defer.resolve(vm.saved.data);
          return defer.promise;
        }

        // if we have an existing list and it's been less than *interval* min
        // then let's be additive
        if (vm[type].data.length && vm[type].lastCheck &&
        moment().diff(vm.top.lastCheck) < interval) {
          vm[type].lastCheck = moment();  // reset that last check
          return previousPage(type);
        } else {       // otherwise let's just reset
          vm[type].lastCheck = moment();
          vm[type].data = [];
          return nextPage(type);
        }
      });
    }

    // get redirected to reddit for first step in authentication
    function getCode() {
      var defer = $q.defer();
      var state = Math.random().toString(36).substring(7);  // create a random state
      var authUrl = sc.getImplicitAuthUrl(state);
      $sessionStorage.authState = state;
      defer.resolve();
      window.location = authUrl;
      return defer.promise;
    }

    // get the next page of results
    function nextPage(type) {
      var defer = $q.defer();

      waitForUser().then(function(){
        // if the user isn't logged in, we can only return what has been saved locally
        if (type === 'saved' && !$rootScope.user) {
          notifyObservers('saved');
          defer.resolve(vm.saved.data);
          return defer.promise;
        }

        var params;
        if (vm[type].after) {
          params = {
            after: vm[type].after
          };
        }

        sc(vm[type].uri).get(params).then(function(res) {
          vm[type].after = res.data.after;
          vm[type].data = vm[type].data.concat(res.data.children);

          if (type === 'saved') {
            updateTopWithSaved();
          }
          notifyObservers(type);
          defer.resolve(vm[type].data);
        }, function(err) {
          defer.reject(err);
        });
      });

      return defer.promise;
    }

    // call this when you know data has been changed
    function notifyObservers(type) {
      angular.forEach(vm[type].callbacks, function(callback) {
        callback(vm[type]);
      });
    }

    // authenticate with reddit via auth code
    function postAccessToken(AUTHORIZATION_CODE, STATE) {
      var defer = $q.defer();

      if ($sessionStorage.authState !== STATE) {
        $rootScope.loggingIn = false;
        defer.reject('INVALID_STATE');
        return defer.promise;
      } else {
        delete $sessionStorage.authState; // clear the auth state
      }

      // Authenticate with reddit by passing in the authorization code from the response
      sc.auth(AUTHORIZATION_CODE).then(function() {
        // add a code that will expire in 1 hour
        $localStorage.accessToken = {
          code: AUTHORIZATION_CODE,
          expires: moment().add(1, 'hour').toDate()
        };

        // get the user data
        return sc('/api/v1/me').get();
      })
      .then(function(data) {
        $rootScope.user = data;
        vm.saved.uri = '/user/' + $rootScope.user.name + '/saved';  // update the saved uri
        saveDirtySaves();
        $rootScope.loggingIn = false;
        defer.resolve(data);
      }, function(err) {
        $rootScope.loggingIn = false;
        defer.reject(err);
      });

      return defer.promise;
    }

    // get the previous page of results
    function previousPage(type) {
      var defer = $q.defer();

      var params = {
        before: vm[type].data[0].kind + '_' + vm[type].data[0].data.id,  // look above the topmost object
        limit: 100  // lets get as many before the topmost as possible
      };

      sc(vm[type].uri).get(params).then(function(res) {
        vm[type].data = res.data.children.concat(vm[type].data);
        if (res.data.before) {
          previousPage(type);
        } else {
          if (type === 'saved') {
            updateTopWithSaved();
          }
          defer.resolve(vm[type].data);
          notifyObservers(type);
        }
      }, function(err) {
        defer.reject(err);
      });
      return defer.promise;
    }

    // refresh authentication via access_token
    function refresh(SAVED_ACCESS_TOKEN) {
      var defer = $q.defer();

      $rootScope.loggingIn = true;

      sc.auth(SAVED_ACCESS_TOKEN).then(function() {
        // we are authenticated, get the user data
        return sc('/api/v1/me').get();
      }).then(function(data) {
        $rootScope.user = data;

        vm.saved.uri = '/user/' + $rootScope.user.name + '/saved';
        saveDirtySaves();
        $rootScope.loggingIn = false;
        defer.resolve(data);
      }, function(err) {
        console.error(err);
        delete $localStorage.accessToken;
        defer.reject(err);
      });
      return defer.promise;
    }

    // register an observer
    function registerCallback(type, callback) {
      var key = Math.random().toString(36).substring(7);
      vm[type].callbacks[key] = callback;
      return key;
    }

    function save(kind, data) {
      var defer = $q.defer();

      if (!$rootScope.user) {
        var localSaved = {kind: kind, data: data};
        defer.resolve(vm.saved.data.push(localSaved));
        notifyObservers('saved');
        return defer.promise;
      }

      var id = kind + '_' + data.id;

      var params = {
        id: id
      };

      sc('/api/save').post(params).then(function(res) {
        notifyObservers('saved');
        defer.resolve(res);
      }, function(err) {
        defer.reject(err);
      });

      return defer.promise;
    }

    // apply anonymous saves to logged in user
    function saveDirtySaves() {
      if ($localStorage.dirtySaves && $localStorage.dirtySaves.length) {
        // if the user saved data before logging in, save it now
        var savePromises = _.map($localStorage.dirtySaves, function(val) {
          return save(val.kind, val.data);
        });

        // wait for all promises to resolve, then get clean saves from reddit
        $q.all(savePromises).then(function(res) {
          firstPage('saved').then(function() {
            delete $localStorage.dirtySaves;
          }, function(err) {
            delete $localStorage.dirtySaves;
            console.error(err);
          });
        }, function(err) {
          // we couldn't save the local dirty favorites
          console.error(err);
        });
      } else {
        firstPage('saved').then(function() {
          // upload some favs
        }, function(err) {
          console.error(err);
        });
      }
    }

    // logic as to whether to attemp a refresh
    // no user, accessToken in storage, and the accessToken hasn't expired
    function shouldAttemptRefresh() {
      return (!$rootScope.user && $localStorage.accessToken &&
        moment($localStorage.accessToken.expires).diff(moment()) > 0);
    }

    // this function is a bit slow due to array type instead of collection
    function updateTopWithSaved() {
      if (vm.top.data.length && vm.saved.data.length) {
        var keyMap = {};
        _.each(vm.top.data, function(val, index) {
          keyMap[val.data.id] = index;
        });
        _.each(vm.saved.data, function(val) {
          if (!!keyMap[val.data.id]) {
            vm.top.data[keyMap[val.data.id]] = val;
          }
        });
        notifyObservers('top');
      }
    }

    function unregisterCallback(type, key) {
      delete vm[type].callbacks[key];
    }

    function unsave(kind, data) {
      var defer = $q.defer();

      function removeUnsaved() {

        // we have to keep our local storage happy
        function modifyTop() {
          _.each(vm.top.data, function(val) {
            if (val.data && val.data.id === localSaved.data.id &&
            val.kind === localSaved.kind) {
              val.data.saved = false;
            }
          });
        }

        var localSaved = {kind: kind, data: data};
        // this is a bit slow -- runs O(n) -- would be O(1) if we used collection
        var newData = _.reject(vm.saved.data, function(val) {
          return val.data &&
            val.data.id === localSaved.data.id &&
            val.kind === localSaved.kind;
        });
        vm.saved.data = newData;
        modifyTop();
        notifyObservers('saved');
        defer.resolve(vm.saved.length);
      }

      if (!$rootScope.user) {
        removeUnsaved();
      } else {
        sc('/api/unsave').post({
          id: kind + '_' + data.id
        }).then(function() {
          removeUnsaved();
        });
      }

      return defer.promise;
    }

    // wait for authenitcation to complete and return the current user or null
    function waitForUser(){
      var defer = $q.defer();
      if(!$rootScope.loggingIn){
        defer.resolve($rootScope.user);
      } else {
        var watcher = $rootScope.$watch('loggingIn', function(loggingIn){
          if(!loggingIn){
            defer.resolve($rootScope.user);
            watcher();  // unregister the watcher
          }
        });
      }
      return defer.promise;
    }

    // expose methods
    return {
      attemptRefresh: attemptRefresh,
      firstPage: firstPage,
      login: login,
      logout: logout,
      nextPage: nextPage,
      registerCallback: registerCallback,
      save: save,
      saved: vm.saved,
      top: vm.top,
      unregisterCallback: unregisterCallback,
      unsave: unsave,
      waitForUser: waitForUser
    };
  }
})();
