/**
 * Created by xiuchengquek on 24/02/2016.
 */
'use strict';

// Declare app level module which depends on views, and components
angular.module('capseq', [
    'ngRoute',
    'ngCookies'
]).
    config(['$interpolateProvider', function($interpolateProvider) {
      $interpolateProvider.startSymbol('[[');
      $interpolateProvider.endSymbol(']]')
    }]);
