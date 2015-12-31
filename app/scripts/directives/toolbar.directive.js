'use strict';

(function() {
  angular
  .module('app')
  .directive('toolbar', toolbarDirective);

  toolbarDirective.$inject = ['$mdToast', 'bowser', 'reddit'];

  function toolbarDirective($mdToast, bowser, reddit) {
    var directive = {
      link: link,
      templateUrl: 'views/directives/toolbar.html',
      restrict: 'EA',
      replace: true,
      scope: {
        user: '='
      }
    };
    return directive;

    function link(scope, element, attrs) {
      scope.bowser = bowser;

      scope.login = function() {
        reddit.login().then(function() {
        }, function(err) {
          console.error(err);
          scope.showError('an error occurred while trying to log you in');
        });
      };

      scope.logout = function() {
        reddit.logout().then(function() {
        }, function(err) {
          console.error(err);
          scope.showError('an error occurred while trying to log you out');
        });
      };

      scope.showError = function(msg) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(msg)
            .hideDelay(3000)
        );
      };
    }
  }
})();
