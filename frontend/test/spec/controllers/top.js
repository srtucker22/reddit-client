describe('Controller: TopCtrl', function () {

  // load the controller's module
  beforeEach(module('app', function($provide){
    $provide.factory('reddit', ['$q', function($q){
      var theCallback;
      return {
        attemptRefresh: function(){
          return $q.when();
        },
        firstPage: function(val){
          if (val === 'top') {
            var defer = $q.defer();
            var res = {data: ['a', 'b', 'c'], after: true};
            !!theCallback && theCallback(res);
            defer.resolve(res);
            return defer.promise;
          } else {
            return $q.when([]);
          }
        },
        nextPage: function(val){
          if (val === 'top') {
            var defer = $q.defer();
            var res = {data: ['d', 'e', 'f'], after: false};
            !!theCallback && theCallback(res);
            defer.resolve(res);
            return defer.promise;
          } else {
            return $q.when([]);
          }
        },
        registerCallback: function(val, callback){
          theCallback = callback;
          return 0;
        },
        unregisterCallback: function(val, callback){
          if(val === 'top'){
            theCallback = null;
            return;
          } else {
            throw new Error('wrong unregisterCallback');
          }
        }
      };
    }]);
  }));

  var TopCtrl,
    scope, q;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $mdToast, $q, $rootScope, reddit) {
    q = $q;
    mockReddit = reddit;
    mdToast = $mdToast;

    spyNext = spyOn(mockReddit, 'nextPage');

    spyOn(mockReddit,'firstPage').and.callThrough();
    spyOn(mockReddit, 'registerCallback').and.callThrough();
    spyOn(mockReddit, 'unregisterCallback').and.callThrough();
    spyOn(mdToast, 'show').and.callThrough;

    scope = $rootScope.$new();
    TopCtrl = $controller('TopCtrl', {
      $scope: scope,
      reddit: mockReddit,
      $mdToast: mdToast
    });
  }));

  it('should initialize the controller and call for reddit data', function () {
    scope.$digest();

    // register the callback
    expect(mockReddit.registerCallback).toHaveBeenCalled();

    // get the first page results
    expect(mockReddit.firstPage).toHaveBeenCalled();
    expect(TopCtrl.posts).toEqual(['a', 'b', 'c']);
    expect(TopCtrl.more).toBe(true);

    // stop showing loading
    expect(TopCtrl.loading).toBe(false);
  });

  it('should get next posts or show an error', function () {
    TopCtrl.more = false;
    TopCtrl.nextPage();
    scope.$digest();

    // we aren't expecting more so don't get more
    expect(mockReddit.nextPage).not.toHaveBeenCalled();

    // show an error when we get one
    spyNext.and.callFake(function(){
      var defer = q.defer();
      defer.reject('testing could not retrieve more posts');
      return defer.promise;
    });
    TopCtrl.more = true;
    TopCtrl.loading = true;
    TopCtrl.nextPage();
    scope.$digest();

    expect(mdToast.show).toHaveBeenCalled();
    expect(TopCtrl.loading).toBe(false);

    // get the next page results
    spyNext.and.callThrough();
    TopCtrl.more = true;
    TopCtrl.loading = true;
    TopCtrl.nextPage();
    scope.$digest();

    expect(mockReddit.nextPage).toHaveBeenCalled();
    expect(TopCtrl.posts).toEqual(['d', 'e', 'f']);
    expect(TopCtrl.more).toBe(false);
    expect(TopCtrl.loading).toBe(false);
  });

  it('should destroy the controller and unregister reddit callback', function () {
    scope.$destroy();

    // register the callback
    expect(mockReddit.unregisterCallback).toHaveBeenCalled();
  });
});
