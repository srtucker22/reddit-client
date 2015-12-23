(function() {
  'use strict';

  angular
  .module('app', [
    'infinite-scroll',
    'ngAnimate',
    'ngMaterial',
    'ngStorage',
    'ui.router'
  ])
    .run(['$rootScope','reddit', function($rootScope, reddit) {
      reddit.attemptRefresh();
    }]);
})();
