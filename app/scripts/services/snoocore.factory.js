(function() {
  'use strict';

  angular
    .module('app')
    .factory('snoocore', snoocore);

  snoocore.$inject = [];

  function snoocore() {
    return function(config){
      var Snoocore = window.Snoocore;
      return new Snoocore(config);
    };
  }
})();
