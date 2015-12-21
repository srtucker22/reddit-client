'use strict';

(function() {
  angular
  .module('app')
  .directive('post', postDirective);

  postDirective.$inject = ['bowser', 'reddit'];

  function postDirective(bowser, reddit) {
    var directive = {
      link: link,
      templateUrl: 'views/directives/post.html',
      restrict: 'EA',
      replace: true,
      scope: {
        data: '=',
        kind: '@'
      }
    };
    return directive;

    function link(scope, element, attrs) {
      scope.bowser = bowser;

      scope.toggleFavorite = function() {

        scope.data.saved = !scope.data.saved;

        if (scope.data.saved) {
          reddit.save(scope.kind, scope.data);
        } else {
          reddit.unsave(scope.kind, scope.data);
        }
      };
    }
  }
})();
