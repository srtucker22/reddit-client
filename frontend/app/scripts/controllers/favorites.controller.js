'use strict';

(function() {
  angular
  .module('app')
  .controller('FavoritesCtrl', FavoritesCtrl);

  FavoritesCtrl.$inject = [
    '$localStorage',
    '$mdToast',
    '$scope',
    '$stateParams',
    '$timeout',
    'reddit'
  ];

  function FavoritesCtrl(
    $localStorage,
    $mdToast,
    $scope,
    $stateParams,
    $timeout,
    reddit
  ) {
    var vm = this;
    vm.nextPage = nextPage;
    vm.showError = showError;

    var callbackIndex;

    activate();

    function activate() {
      // update the posts whenever the data changes
      var updatePosts = function(saves) {
        vm.posts = saves.data;
        vm.more = saves.after;
      };

      // register the callback for data changes
      callbackIndex = reddit.registerCallback('saved', updatePosts);

      vm.loading = true;
      firstPage();
    }

    // get the first page results
    function firstPage() {
      vm.loading = true;
      reddit.firstPage('saved').then(function() {
        vm.loading = false;
      }, function(err) {
        vm.loading = false;
        console.error(err);
        vm.showError('could not retrieve more favorites');
      });
    }

    // get subsequent page results
    function nextPage() {
      if (!vm.more) { // only if we have more results
        return;
      }

      vm.loading = true;
      reddit.nextPage('saved').then(function() {
        vm.loading = false;
      }, function(err) {
        vm.loading = false;
        console.error(err);
        vm.showError('could not retrieve more favorites');
      });
    }

    function showError(msg) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .hideDelay(3000)
      );
    }

    $scope.$on('destroy', function() {
      if (!!callbackIndex) {
        reddit.unregisterCallback('top', callbackIndex);
      }
    });
  }
})();
