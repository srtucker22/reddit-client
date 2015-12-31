(function() {
  'use strict';

  angular.module('app').config([
    '$urlRouterProvider',
    '$stateProvider',
    '$locationProvider',

    function(
      $urlRouterProvider,
      $stateProvider,
      $locationProvider) {

      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      $stateProvider
        .state('top', {
          url: '/?access_token&state',
          templateUrl: 'views/top.html',
          controller: 'TopCtrl',
          controllerAs: 'topctrl',
          resolve: {

          }
        })
        .state('favorites', {
          url: '/favorites',
          templateUrl: 'views/favorites.html',
          controller: 'FavoritesCtrl',
          controllerAs: 'favoritesctrl'
        })
        .state('404', {
          url: '/404',
          template:
            '<div class=\'container\'><div class=\'row\'>' +
              '<h1 class=\'col-xs-12 text-center\'>404</h1>' +
              '<h3 class=\'col-xs-12 text-center text-uppercase\'>Page Not Found</h3>' +
              '<h4 class=\'col-xs-12 text-center text-uppercase\'>' +
                'Sorry, but the page you were trying to view does not exist.' +
              '</h4>' +
            '</div></div>'
        });

      $urlRouterProvider.otherwise('/');
    }]);
})();
