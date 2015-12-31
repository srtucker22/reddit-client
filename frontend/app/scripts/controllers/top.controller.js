(function() {
  'use strict';

  angular
    .module('app')
    .controller('TopCtrl', TopCtrl);

  TopCtrl.$inject = [
    '$localStorage',
    '$mdToast',
    '$scope',
    '$state',
    '$stateParams',
    'reddit'
  ];

  function TopCtrl(
    $localStorage,
    $mdToast,
    $scope,
    $state,
    $stateParams,
    reddit
  ) {
    var vm = this;
    vm.nextPage = nextPage;
    vm.showError = showError;

    var callbackIndex;

    activate();

    // activate the controller
    function activate() {
      var updatePosts = function(top) {
        vm.posts = top.data;
        vm.more = top.after;
      };

      // register the callback for data changes
      callbackIndex = reddit.registerCallback('top', updatePosts);

      vm.loading = true;

      // if we are coming back from reddit, then login
      if ($stateParams['access_token']) {
        reddit.login($stateParams['access_token'], $stateParams.state)
          .then(function() {
            $state.go('.', {code: undefined, state: undefined});
            firstPage();
          }, function() {
            vm.loading = false;
            $state.go('.', {code: undefined, state: undefined});
          });
      } else {
        firstPage();
      }
    }

    function firstPage() {
      vm.loading = true;
      reddit.firstPage('top').then(function(data) {
        vm.loading = false;
      }, function(err) {
        vm.loading = false;
        console.error(err);
        vm.showError('could not retrieve more posts');
      });
    }

    function nextPage() {
      if (!vm.more) {
        return;
      }

      vm.loading = true;
      reddit.nextPage('top').then(function(data) {
        vm.loading = false;
      }, function(err) {
        vm.loading = false;
        console.error(err);
        vm.showError('could not retrieve more posts');
      });
    }

    function showError(msg) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .hideDelay(3000)
      );
    }

    $scope.$on('$destroy', function() {
      if (!!callbackIndex || callbackIndex === 0) {
        reddit.unregisterCallback('top', callbackIndex);
      }
    });
  }
})();
