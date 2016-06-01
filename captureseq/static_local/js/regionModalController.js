/**
 * Created by xiuchengquek on 18/05/2016.
 */







angular.module('capseq').controller('regionModalController', function ($scope, $uibModalInstance, regionDetails) {



  $scope.regionDetails = regionDetails;
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
