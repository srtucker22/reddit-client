'use strict';

describe('Services: reddit', function () {

  // load the controller's module
  beforeEach(module('app', function($provide){
    $provide.factory('scSpy', [function(){
      return {
        auth: function(){},
        deauth: function(){},
        get: function(){},
        getImplicitAuthUrl: function(){},
        post: function(){}
      };
    }]);

    $provide.factory('snoocore', ['$q', 'scSpy', function($q, scSpy){
      return function() {
        var sc = function(val){
          return {
            get: function() {
              scSpy.get(val);
              if(val.indexOf('saved') > -1){
                return $q.when({data: {children: [{data: {id: 2, name: 'saved', saved: true}}]}});
              } else if(val.indexOf('top') > -1){
                return $q.when({data: {children: [{data: {id: 1, name: 'top', saved: false}}]}});
              } else if(val === '/api/v1/me'){
                return $q.when({name: 'test'});
              }
            },
            post: function(params) {
              scSpy.post(val);
              if(val === '/api/save') {
                return $q.when(params);
              } else if (val === '/api/unsave') {
                return $q.when(params);
              }
            }
          };
        };

        sc.auth = function() {
          scSpy.auth();
          return $q.when();
        };
        sc.deauth = function(){
          scSpy.deauth();
          return $q.when();
        };
        sc.getImplicitAuthUrl = function(state){
          scSpy.getImplicitAuthUrl();
          return state;
        };

        return sc;
      };
    }]);
  }));

  describe('Login functions', function () {

    beforeEach(inject(function(scSpy){
      spyOn(scSpy, 'auth').and.callThrough();
      spyOn(scSpy, 'deauth').and.callThrough();
      spyOn(scSpy, 'get').and.callThrough();
      spyOn(scSpy, 'post').and.callThrough();
    }));

    it('should initialize the factory with reddit credentials', function() {
      inject(function(reddit, $httpBackend, $rootScope) {
        $rootScope.$digest();

        expect(reddit.top).toEqual(jasmine.anything());
        expect(reddit.saved).toEqual(jasmine.anything());
        expect(Object.getOwnPropertyNames(reddit)).toEqual(jasmine.arrayContaining([
          'attemptRefresh',
          'firstPage',
          'login',
          'logout',
          'nextPage',
          'registerCallback',
          'save',
          'saved',
          'top',
          'unregisterCallback',
          'unsave',
          'waitForUser'
        ]));
        $httpBackend.verifyNoOutstandingRequest();
      });
    });

    // this will start to get tricky
    it('attemptRefresh() -- should not login when token doesnt exist', function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, scSpy) {
        // no localStorage
        reddit.attemptRefresh().then(function(){
          expect(scSpy.auth).not.toHaveBeenCalled();
          expect($rootScope.user).not.toEqual(jasmine.anything());
          $httpBackend.verifyNoOutstandingRequest();
          done(); // jasmine async
        });

        $rootScope.$digest();
      });
    });

    it('attemptRefresh() -- should not login when expired token exists', function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, scSpy) {
        // clear user
        $rootScope.user = null;

        // localStorage
        $localStorage.accessToken = {
          code: 1234,
          expires: moment().subtract(1, 'minutes')
        };

        reddit.attemptRefresh().then(function(){
          expect(scSpy.auth).not.toHaveBeenCalled();
          expect($rootScope.user).not.toEqual(jasmine.anything());
          expect($rootScope.loggingIn).not.toBe(true);
          expect(reddit.top.data).toEqual([]);
          expect(reddit.saved.data).toEqual([]);
          $httpBackend.verifyNoOutstandingRequest();
          done(); // async jasmine
        });

        $rootScope.$digest();
      });
    });

    it('attemptRefresh() -- should login when non-expired token exists', function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, scSpy) {
        // clear user
        $rootScope.user = null;

        // localStorage
        $localStorage.accessToken = {
          code: 1234,
          expires: moment().add(1, 'minutes')
        };

        reddit.attemptRefresh().then(function(){
          expect(scSpy.auth).toHaveBeenCalled();
          expect($rootScope.user).toEqual({name: 'test'});
          expect($rootScope.loggingIn).not.toBe(true);
          expect(reddit.top.data).toEqual([]); // get data after login resolves
          expect(reddit.saved.data).toEqual([]); // get data after login resolves
          $httpBackend.verifyNoOutstandingRequest();
          done(); // async jasmine
        });

        $rootScope.$digest();
      });
    });

    it('login(code, state) -- should login user', function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, $sessionStorage, scSpy) {
        // clear user
        $rootScope.user = null;
        $localStorage.accessToken = null;

        var code = 'code';
        var state = 'state';

        // set the session storage to correct state
        $sessionStorage.authState = state;

        // log in
        reddit.login(code, state).then(function(){
          expect(scSpy.auth).toHaveBeenCalled();
          expect($localStorage.accessToken).toEqual(jasmine.anything());
          expect($localStorage.accessToken.code).toEqual(code);
          expect($rootScope.loggingIn).toBe(false);
          expect($rootScope.user).toEqual({name: 'test'});
          $httpBackend.verifyNoOutstandingRequest();
          done(); // async jasmine
        });

        $rootScope.$digest();
      });
    });

    it('login(code, state) -- should prevent user login with invalid session state', function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, $sessionStorage, scSpy) {
        // clear user
        $rootScope.user = null;
        $localStorage.accessToken = null;

        var code = 'code';
        var state = 'state';

        // set the session storage to incorrect state
        $sessionStorage.authState = 'different';

        // log in
        reddit.login(code, state).then(function(){
          // unreached
        }, function(error){
          expect(scSpy.auth).not.toHaveBeenCalled();
          expect(error).toEqual('INVALID_STATE');
          expect($localStorage.accessToken).not.toEqual(jasmine.anything());
          expect($rootScope.loggingIn).toBe(false);
          expect($rootScope.user).not.toEqual(jasmine.anything());
          $httpBackend.verifyNoOutstandingRequest();
          done(); // async jasmine
        });

        $rootScope.$digest();
      });
    });

    it('login(code, state) -- should save dirty saves on login', function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, $sessionStorage, scSpy) {
        // clear user
        $rootScope.user = null;
        $localStorage.accessToken = null;

        var dirty = [
          {kind: 'test', data: {id: 'dirty1'}},
          {kind: 'test', data: {id: 'dirty2'}}
        ];

        reddit.save(dirty[0].kind, dirty[0].data);
        reddit.save(dirty[1].kind, dirty[1].data);

        var code = 'code';
        var state = 'state';

        // set the session storage to correct state
        $sessionStorage.authState = state;

        // log in
        reddit.login(code, state).then(function(){
          expect($rootScope.user).toEqual({name: 'test'});
          expect($localStorage.dirtySaves).toEqual(dirty);  // fill the localstorage
          expect(scSpy.auth).toHaveBeenCalled();

          // wait for data stuff to happen
          setTimeout(function() {
            expect($localStorage.dirtySaves)
              .not.toEqual(jasmine.anything()); // clear localstorage
            expect(reddit.saved.data).toEqual([{data: {name: 'saved', saved: true, id: 2}}]);
            expect(scSpy.post).toHaveBeenCalledWith('/api/save');
            $httpBackend.verifyNoOutstandingRequest();
            done(); // async jasmine
          }, 2000);
        });

        $rootScope.$digest();
      });
    });

    it('logout() -- should clear tokens and reset data when logout',
    function(done) {
      inject(function(reddit, $httpBackend, $localStorage, $rootScope, scSpy) {
        // fake user
        $rootScope.user = 'fake';

        // localStorage
        $localStorage.accessToken = {
          code: 1234,
          expires: moment().add(1, 'minutes')
        };

        reddit.logout().then(function(){
          expect(scSpy.deauth).toHaveBeenCalled();
          expect($localStorage.accessToken).not.toEqual(jasmine.anything());
          expect($rootScope.user).not.toEqual(jasmine.anything());
          setTimeout(function() {
            expect(scSpy.get).toHaveBeenCalledWith('/r/all/top');
            expect(reddit.saved.data).toEqual([]);
            expect(reddit.top.data).toEqual([{data: {name: 'top', saved: false, id: 1}}]);
            $httpBackend.verifyNoOutstandingRequest();
            done(); // async jasmine
          }, 1000);
        });

        $rootScope.$digest();
      });
    });

    // waitForUser
  });

  describe('Data functions', function () {
    beforeEach(inject(function(scSpy){
      spyOn(scSpy, 'get').and.callThrough();
      spyOn(scSpy, 'post').and.callThrough();
    }));

    describe('saving', function(){
      var dirty = [
        {kind: 'test', data: {id: 'dirty1'}},
        {kind: 'test', data: {id: 'dirty2'}}
      ];

      it('save(kind, data) -- should save a post', function(done) {
        inject(function(reddit, $httpBackend, $rootScope, scSpy) {
          $rootScope.user = null;

          reddit.save(dirty[0].kind, dirty[0].data).then(function(){
            expect(scSpy.post).not.toHaveBeenCalled();
            expect(reddit.saved.data).toEqual([dirty[0]]);

            reddit.save(dirty[1].kind, dirty[1].data).then(function(){
              expect(scSpy.post).not.toHaveBeenCalled();
              expect(reddit.saved.data).toEqual(dirty);
              $httpBackend.verifyNoOutstandingRequest();
              done(); // async jasmine
            });
          });

          $rootScope.$digest();
        });

        it('save(kind, data) -- should request to save a post for user', function(done) {
          inject(function(reddit, $httpBackend, $rootScope, scSpy) {
            $rootScope.user = 'fake';

            reddit.save(dirty[0].kind, dirty[0].data).then(function(d1){
              // save changes the object to an id param and resolves
              expect(d1).toEqual({id: dirty[0].kind + '_' + dirty[0].data.id});
              expect(scSpy.post).toHaveBeenCalledWith('/api/save');

              reddit.save(dirty[1].kind, dirty[1].data).then(function(d2){
                expect(d2).toEqual({id: dirty[1].kind + '_' + dirty[1].data.id});
                expect(scSpy.post).toHaveBeenCalledWith('/api/save');
                expect(reddit.saved.data).toEqual([]);  // we're not actually using reddit data, so nothing should get saved
                $httpBackend.verifyNoOutstandingRequest();
                done(); // async jasmine
              });
            });

            $rootScope.$digest();
          });
        });

        it('unsave(kind, data) -- should unsave a post', function(done) {
          inject(function(reddit, $httpBackend, $rootScope, scSpy) {
            $rootScope.user = null;
            reddit.saved.data = dirty;

            reddit.unsave(dirty[0].kind, dirty[0].data).then(function(){
              expect(reddit.saved.data).toEqual([dirty[1]]);
              expect(scSpy.post).not.toHaveBeenCalled();
              $httpBackend.verifyNoOutstandingRequest();
              done(); // async jasmine
            });

            $rootScope.$digest();
          });
        });

        it('unsave(kind, data) -- should request to unsave a post', function(done) {
          inject(function(reddit, $httpBackend, $rootScope, scSpy) {
            $rootScope.user = 'fake';
            reddit.saved.data = dirty;

            reddit.unsave(dirty[0].kind, dirty[0].data).then(function(){
              expect(reddit.saved.data).toEqual([dirty[1]]);
              expect(scSpy.post).toHaveBeenCalledWith('/api/unsave');
              $httpBackend.verifyNoOutstandingRequest();
              done(); // async jasmine
            });

            $rootScope.$digest();
          });
        });
      });
    });

    describe('callbacks', function() {
      var callbacks = {
        topCallback: function(){},
        savedCallback: function(){}
      };
      var topCallbackId, savedCallbackId;

      beforeEach(inject(function(reddit){
        spyOn(callbacks, 'topCallback').and.callThrough();
        spyOn(callbacks, 'savedCallback').and.callThrough();

        topCallbackId = reddit.registerCallback('top', callbacks.topCallback);
        savedCallbackId = reddit.registerCallback('saved', callbacks.savedCallback);
      }));

      it('registerCallback(type, callback) -- should register callback that gets called when data type changes', function(done) {
        inject(function(reddit, $httpBackend, $rootScope) {
          reddit.nextPage('top').then(function(){
            expect(callbacks.topCallback).toHaveBeenCalledWith(reddit.top);
            expect(callbacks.savedCallback).not.toHaveBeenCalled();

            reddit.nextPage('saved').then(function(){
              expect(callbacks.savedCallback).toHaveBeenCalledWith(reddit.saved);
              $httpBackend.verifyNoOutstandingRequest();
              done(); // async jasmine
            });
          });

          $rootScope.$digest();
        });
      });

      it('unregisterCallback(type, index) -- should unregister callback', function(done) {
        inject(function(reddit, $httpBackend, $localStorage, $rootScope) {
          reddit.unregisterCallback('top', topCallbackId);
          reddit.unregisterCallback('saved', savedCallbackId);

          reddit.nextPage('top').then(reddit.nextPage('saved')).then(function(){
            expect(callbacks.topCallback).not.toHaveBeenCalled();
            expect(callbacks.savedCallback).not.toHaveBeenCalled();
            $httpBackend.verifyNoOutstandingRequest();
            done();
          });

          $rootScope.$digest();
        });
      });
    });

    describe('page loading', function(){
      it('firstPage(type) -- should get first page of posts from reddit without user data', function(done) {
        inject(function(reddit, $httpBackend, $localStorage, $rootScope, $q, scSpy) {
          $rootScope.user = null;
          $q.all([reddit.firstPage('top'), reddit.firstPage('saved')]).then(function(){
            expect(reddit.top.data).toEqual([{data: {name: 'top', saved: false, id: 1}}]);
            expect(scSpy.get).toHaveBeenCalledWith('/r/all/top');
            expect(reddit.saved.data).toEqual([]);
            done();
          });
          $rootScope.$digest();
        });
      });

      it('firstPage(type) -- should get first page of posts from reddit with user data', function(done) {
        inject(function(reddit, $httpBackend, $localStorage, $q, $rootScope, $sessionStorage, scSpy) {
          var code = 'code';
          var state = 'state';

          // set the session storage to correct state
          $sessionStorage.authState = state;

          // log in
          reddit.login(code, state).then(function(){
            $q.all([reddit.firstPage('top'), reddit.firstPage('saved')]).then(function(){
              expect(scSpy.get).toHaveBeenCalledWith('/r/all/top');
              expect(scSpy.get).toHaveBeenCalledWith('/user/test/saved');
              expect(reddit.saved.data).toEqual([{data: {name: 'saved', saved: true, id: 2}}]);
              expect(reddit.top.data).toEqual([{data: {name: 'top', saved: false, id: 1}}]);
              done();
            });
          });

          $rootScope.$digest();
        });
      });

      it('nextPage(type) -- should get next page of posts from reddit', function(done) {
        inject(function(reddit, $httpBackend, $localStorage, $rootScope, $q, scSpy) {
          $rootScope.user = null;
          $q.all([reddit.nextPage('top'), reddit.nextPage('saved')]).then(function(){
            expect(reddit.top.data).toEqual([{data: {name: 'top', saved: false, id: 1}}]);
            expect(scSpy.get).toHaveBeenCalledWith('/r/all/top');
            expect(reddit.saved.data).toEqual([]);
            done();
          });
          $rootScope.$digest();
        });
      });

      it('nextPage(type) -- should get next page of posts from reddit with user data', function(done) {
        inject(function(reddit, $httpBackend, $localStorage, $q, $rootScope, $sessionStorage, scSpy) {
          var code = 'code';
          var state = 'state';

          // set the session storage to correct state
          $sessionStorage.authState = state;

          // log in
          reddit.login(code, state).then(function(){
            $q.all([reddit.nextPage('top'), reddit.nextPage('saved')]).then(function(){
              expect(scSpy.get).toHaveBeenCalledWith('/r/all/top');
              expect(scSpy.get).toHaveBeenCalledWith('/user/test/saved');
              expect(reddit.saved.data).toEqual([{data: {name: 'saved', saved: true, id: 2}}]);
              expect(reddit.top.data).toEqual([{data: {name: 'top', saved: false, id: 1}}]);
              done();
            });
          });

          $rootScope.$digest();
        });
      });

      // test updateTopWithSaved functionality
      // test previousPage functionality
    });
  });
});
