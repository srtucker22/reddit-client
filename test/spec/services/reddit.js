'use strict';

describe('Services: reddit', function () {

  // load the controller's module
  beforeEach(module('app'));
  it('should initialize the factory with reddit credentials', function() {
    inject(function(reddit, $httpBackend, $rootScope) {
      var response = 'cheese';

      $httpBackend.expect('GET', 'success').respond(200, response); // response with data
      $httpBackend.expect('GET', 'fail').respond(200);  // response without data

      $rootScope.$digest();

      expect(reddit.top).toEqual(jasmine.anything())
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
        'user',
        'waitForUser'
      ]));
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

  // this will start to get tricky
  it('should attempt to login if non-expired token exists', function() {
    inject(function(reddit, $httpBackend, $rootScope) {
      // var response = 'cheese';
      //
      // $httpBackend.expect('GET', 'success').respond(200, response); // response with data
      // $httpBackend.expect('GET', 'fail').respond(200);  // response without data
      //
      // reddit.attemptRefresh();
      //
      // $rootScope.$digest();
      // $httpBackend.flush();
      //
      // $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
