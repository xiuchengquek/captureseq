/**
 * Created by xiuchengquek on 25/02/2016.
 */

/**
* TODO : break up controlllers
 *TODO : Change $scope variable to local variable
*/
  'use strict';


angular.module('capseq')
  .controller('GenomeController', ['$scope', '$rootScope', '$http', "$q", "dataLoader", function ($scope, $rootScope, $http, $q, dataLoader) {

    /** Selected Region shows the which selection was made on the directive **/
  // Input data is the input data for the diseasss and their child terms. they contain a attrinbute called id which is an array of
    // loci_id
  $scope.input_data = [];
  // Output data re the selected diseases
  $scope.output_data = [];

  // array of loci_id to displayed
  $scope.displayed_region = [];

  // total set of snps this is for the autocomplete.
  $scope.availableSnps = [];

  //snpid for search by
  $scope.snpid = {value : ''};

  // find the number of region to tx
  $scope.regionToTx = {};
  // snp and region
  $scope.regionToDisease = [];
  $scope.region = [];
  $scope.selectedregion = {};
  $scope.associatedtable = [];


  var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data-rebuild/data/output/bb/';
  var traitsByDiseaseId = [];




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
        name: 'GWAS Snps',
        bwgURI: file_server + 'gwas_snp.bb'
      },
      {
        name: 'Capture Region - Tissue',
        bwgURI: file_server + 'capture_region_tissue.bb'
      },
      {
        name: 'Capture Region - Melanoma',
        bwgURI: file_server + 'capture_region_melanoma.bb'
      },
      {
        name: 'Capture Transcripts - Tissue',
        bwgURI: file_server + 'transcripts_tissue.bb',
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
        bwgURI: file_server + 'transcripts_melanoma.bb',
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

  $scope.$on('browserchanged', function (e, data, snp) {

    if (angular.isDefined(snp)){
      browser.setLocation(snp.chr.toString(), snp.start, snp.end);
    }
    else {
      browser.setLocation(data.chr.toString(), data.start, data.end);

    }

    var diseaseInSelectedRegion = $scope.regionToDisease.filter(function(d, i, arr){
      return d.captured_region === data.loci_id
    });

    var traitDetails = diseaseInSelectedRegion.map(function(d, arr, i){
      var traitsDetails = angular.copy(traitsByDiseaseId[d.disease_id]);
      traitsDetails.snp = d.snp;
      traitsDetails.pubmed = d.pubmed;
      traitsDetails.pvalue = d.pvalue;
      traitsDetails.snplocation = angular.copy($scope.snpSpecificLocation[d.snp]);
      return traitsDetails
    });
    data.details = traitDetails;
    $scope.selectedregion = data

    //$scope.openRegionModal(d)
  });

  // load defualt settings
  dataLoader.loadDefault().then(function (results) {
    var availableSnps = [];
    var expressionData = results.expression.data.expression;
    $scope.transcript_data = results.txinfo.data;
    $scope.transcript_data.track = 'melanoma';
    $scope.region = results.regionList.data;
    $scope.$broadcast('expression_change', expressionData);
    $scope.$broadcast('region_change', results.regionList.data);
    $scope.selectedregion = {
      chr: 1, start: 150534367, end: 150960349,
      'Region Width': 425983, track: 'melanoma',
      details: [ {snp :"rs7412746" ,  disease: "melanoma", pvalue : '-'  }]
    };
    angular.forEach($scope.region, function(val, idx ){
      availableSnps = availableSnps.concat(val.details)
    });

    $scope.availableSnps = _.uniq(availableSnps);
  });

  dataLoader.getDiseases().then(function(results){
    var input_data = [];
    var diseaseMap = dataLoader.getEfoToDiseaseMap();
    angular.forEach(results, function(value, key){
      var children = [];
      angular.forEach(value, function(v, i){
        this.push({ text : v, value : diseaseMap[v], id : v, checked  :  true })
      }, children);
      input_data.push({ text : key, value : key + "_parent", id :  key,
        children : children, isParent : true  })
    });
    $scope.input_data = input_data;
    traitsByDiseaseId = dataLoader.getTraitsByDiseaseId()

  });

  dataLoader.getSnpsByLoci().then(function(results){
    $scope.regionToDisease = results;
  });

  dataLoader.getSnpSpecificLocation().then(function(results){

    $scope.snpSpecificLocation = results;



  })

  $scope.$on('ams_output_model_change', function(event, args){
    var current_diseases = [];
    angular.forEach($scope.output_data, function(value, idx){
      current_diseases = current_diseases.concat(value.value)
    });
    current_diseases = _.uniq(current_diseases);
    var displayed_region = $scope.regionToDisease.filter(function(val, idx ,arr){
        return (current_diseases.indexOf(val.disease_id) !== -1)
    });
    displayed_region= displayed_region.map(function(value, ix){
        return value.captured_region})
    $scope.displayed_region = _.uniq(displayed_region)
  });


  $scope.snpChanged = function(val){

    var region = $scope.regionToDisease.filter(function(d, i, arr){
        return d.snp === val
      });

    var selectedregion = $scope.region.filter(function(d, i, arr){
        return d.loci_id === region[0].captured_region
      });


    if (!_.isEmpty(selectedregion)){
        var snp_location = $scope.snpSpecificLocation[val];
        $scope.$broadcast('goToSnp' , selectedregion[0].loci_id);
        $scope.$emit('browserchanged', selectedregion[0], snp_location);

      }
  }



}]);
