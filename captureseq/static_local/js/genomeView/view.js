/**
 * Created by xiuchengquek on 25/02/2016.
 */
'use strict';

angular.module('capseq.genomeView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/genomeView', {
    templateUrl: '/static/js/genomeView/genomeView.html',
    controller: 'genomeViewCtrl'
  });
}])

.controller('genomeViewCtrl', ["$scope",function($scope) {


  console.log('loaded')






}]);



