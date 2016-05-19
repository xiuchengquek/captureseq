/**
 * Created by xiuchengquek on 25/02/2016.
 */

angular.module('capseq')
  .controller('GenomeController', ['$scope', '$rootScope', '$http', "$q", "$uibModal", "dataLoader", function ($scope, $rootScope, $http, $q ,$uibModal, dataLoader) {

    /** Selected Region shows the which selection was made on the directive **/

  $scope.input_data = [];

  $scope.output_data = [];
  $scope.displayed_region = [];


  var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data/output/';
  'use strict';

   //      $("#test").multiSelect();


  /** Load information for genome Browser **/

  function gencodeFIP(feature, info) {
    var isGene = false;
    for (var hi = 0; hi < info.hit.length; ++hi) {
      if (info.hit[hi].isSuperGroup) {
        isGene = true;
      }
    }
    if (!isGene) {
      info.setTitle('Transcript: ' + feature.label);
      info.add('Transcript ID', feature.label);
      info.add('Transcript biotype', feature.method);
    } else {
      info.setTitle('Gene: ' + feature.geneId);
    }
    info.add('Gene ID', feature.geneId);
    info.add('Gene name', feature.geneName);
    info.add('Gene biotype', feature.geneBioType);
    if (!isGene) {
      info.add('Transcript attributes', feature.tags);
    }
  }

  var browser = new Browser({
    chr: '1',
    viewStart: 150727097,
    viewEnd: 150875437,
    noPersist: true,

    coordSystem: {
      speciesName: 'Human',
      taxon: 9606,
      auth: 'NCBI',
      version: '36',
      ucscName: 'hg19'
    },
    browserLinks: {
      Ensembl: 'http://www.ensembl.org/Homo_sapiens/Location/View?r=${chr}:${start}-${end}',
      UCSC: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr${chr}:${start}-${end}',
      Sequence: 'http://www.derkholm.net:8080/das/hg38comp/sequence?segment=${chr}:${start},${end}'
    },
    sources: [{
      name: 'Genome',
      twoBitURI: file_server + 'hg19.2bit',
      tier_type: 'sequence',
      pinned: true,
      provides_entrypoints: true
    },
      {
        name: 'GENCODE version 19',
        bwgURI: file_server + 'gencode.v19.annotation.bb',
        collapseSuperGroups: true,
        trixURI: file_server + 'gencode.v19.annotation.ix',
        noSourceFeatureInfo: true,
        featureInfoPlugin: gencodeFIP
      },
      {
        name: 'Capture Region - Tissue',
        bwgURI: file_server + 'captured_region_tissue.bb'
      },
      {
        name: 'Capture Region - Melanoma',
        bwgURI: file_server + 'captured_region_melanoma.bb'
      },
      {
        name: 'Capture Transcripts - Tissue',
        bwgURI: file_server + 'captured_transcript_tissue_single_noex.bb',
        featureInfoPlugin: function (feat, info) {
          dataLoader.getTranscriptChangeInfo(feat.label, info, 'tissue').then(
            function (results) {
              $scope.transcript_data = results.transcriptData;
              $scope.$broadcast('expression_change', results.expressionData);
            }
          );
        }
      },
      {
        name: 'Capture Transcripts - Melanoma',
        bwgURI: file_server + 'captured_transcript_melanoma_single_noex.bb',
        featureInfoPlugin: function (feat, info) {
          dataLoader.getTranscriptChangeInfo(feat.label, info, 'melanoma').then(
            function (results) {
              $scope.transcript_data = results.transcriptData;
              $scope.$broadcast('expression_change', results.expressionData);
            }
          );
        }

      }]
  });

  $scope.$on('browserchanged', function (e, d) {
    browser.setLocation(d.chr.toString(), d.start, d.end);
  });

  // load defualt settings
  dataLoader.loadDefault().then(function (results) {
    var expressionData = results.expression.data.expression;
    $scope.transcript_data = results.txinfo.data;
    $scope.transcript_data.track = 'melanoma';
    $scope.region = results.regionList.data;
    $scope.$broadcast('expression_change', expressionData);
    $scope.$broadcast('region_change', results.regionList.data);
    $scope.selectedregion = {
      chr: 1, start: 150534367, end: 150960349,
      'Region Width': 425983, track: 'melanoma',
      details: { snps: [{ snp_id: "rs7412746" }], disease: [ "melanoma" ]}
    };
  });

  dataLoader.getDiseases().then(function(results){
     var input_data = [];
     var diseaseMap = dataLoader.getDiseaseMap();
        angular.forEach(results, function(value, key){
      var children = [];
      angular.forEach(value, function(v, i){
        this.push({ text : v, value : diseaseMap[v], id : v, checked  :  true })
      }, children);
      input_data.push({ text : key, value : key + "_parent", id :  key,
        children : children, isParent : true  })
    });
    $scope.input_data = input_data;
  });

  dataLoader.getSnpsByLoci().then(function(results){

    $scope.regionToDisease = results;

  })

  $scope.$on('ams_output_model_change', function(event, args){


    var current_diseases = [];

    angular.forEach($scope.output_data, function(value, idx){
      current_diseases = current_diseases.concat(value.value)

    })

    current_diseases = _.uniq(current_diseases);

    console.log($scope.regionToDisease)
    console.log(current_diseases)


    var displayed_region = $scope.regionToDisease.filter(function(val, idx ,arr){
        return (current_diseases.indexOf(val.disease_id) !== -1)
    })

    displayed_region= displayed_region.map(function(value, ix){
        return value.captured_region})

    $scope.displayed_region = _.uniq(displayed_region)








  })


  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'regionModalController',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

}]);
