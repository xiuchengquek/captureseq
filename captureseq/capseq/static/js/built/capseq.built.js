/**
 * Created by xiuchengquek on 24/02/2016.
 */
'use strict';

// Declare app level module which depends on views, and components



angular.module('capseq', [
    "angular-multi-select",
    "smart-table"])
;
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
;
/**
 * Created by xiuchengquek on 25/02/2016.
 */

angular.module('capseq')

  .directive('barChart', function () {
    return {
      restrict: 'E',
      scope: {
        'data': '=data',
        'transcript_id': '='
      },
      link: function (scope, element, attrs) {


        var x_axis_order = [
            ''
        ]


        var margin = {top: 20, right: 20, bottom: 120, left: 40},
          width = 520 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

        var melanoma_relabel = {
          "adipose" : "adipose",
          "bladder" : "bladder",
          "brain" : "brain",
          "breast" : "breast",
          "cervix" : "cervix",
          "colon" : "colon",
          "esophagus" : "esophagus",
          "heart" : "heart",
          "kidney" : "kidney",
          "liver" : "liver",
          "lung" : "lung",
          "ovary" : "ovary",
          "placenta" : "placenta",
          "prostate" : "prostate",
          "skmusc" : "skmusc",
          "smint" : "smint",
          "spleen" : "spleen",
          "testes" : "testes",
          "thymus" : "thymus",
          "thyroid" : "thyroid",
          "trachea" : "trachea",
          "melanoma.A02" : "melanoma (A02)",
          "melanoma.A11" : "melanoma (A11)",
          "melanoma.A15" : "melanoma (A15)",
          "melanoma.C001" : "melanoma (C001)",
          "melanoma.C002" : "melanoma (C002)",
          "melanoma.C011" : "melanoma (C011)",
          "melanoma.C021" : "melanoma (C021)",
          "melanoma.C027" : "melanoma (C027)",
          "melanoma.C037" : "melanoma (C037)",
          "melanoma.C054" : "melanoma (C054)",
          "melanoma.C057" : "melanoma (C057)",
          "melanoma.C058" : "melanoma (C058)",
          "melanoma.C077" : "melanoma (C077)"
        };

        var melanoma_order = Object.keys(melanoma_relabel);

        function plotBar(data) {

          var data = data;

          // this is a hack melanoma
          if ( data.length > 30){
            var reordered_data = []
            for(var i = 0; i < melanoma_order.length; i++){
              for(var x =0; x < data.length; x++){
                var current_item = data[x]
                if (current_item.label == melanoma_order[i]){
                  reordered_data.push(current_item)
                  continue;
                }

              }

            };
            data = reordered_data
          }
          console.log(data)

          d3.select(".expression_plot").remove();

          var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

          var y = d3.scale.linear()
            .range([height, 0]);

          x.domain(data.map(function (d) {
            return d.label;
          }));
          y.domain([0, d3.max(data, function (d) {
            return Number(d.value)
          }) * 1.1]);


          var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

          var yAxis = d3.svg.axis().scale(y)
            .orient("left");

          var svg = d3.select("#expression").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "expression_plot")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Expression (FPKM)");

          svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
              return x(d.label);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
              return y(Number(d.value));
            })
            .attr("height", function (d) {
              return height - y(Number(d.value));
            });
        }

        scope.$on('expression_change', function (event, value) {
          plotBar(value)
        });
      }
    }
  });


angular.module('capseq')
  .directive('genomeNavigator', function () {




    return {
      restrict: 'E',
      template: '<button id="zoom_in" type="button" class="btn btn-default  btn-xs"  ng-click="svg_zoom_in()">' +
      '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>' +
      '</button>' +
       '<button id="zoom_out" type="button" class="btn btn-default btn-xs" ng-click="svg_zoom_out()">' +
      '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>' +
      '</button>'+
       '<button id="refresh" type="button" class="btn btn-default  btn-xs" ng-click="svg_zoom_refresh()">' +
      '<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>' +
      '</button>',

      scope: {
        'region': '=',
        'selectedregion': '=',
        'snpToLoci': '<',
        'displayedRegion': '<'
      },
      link: function (scope, element, attr) {
        scope.$watch('displayedRegion', function (newVal, oldVal) {
          highlightNodes(newVal);
        });

        function highlightNodes(arr) {
          d3.selectAll('rect.feature').each(function (d, i) {
            if (typeof d !== 'undefined') {
              if (arr.indexOf(d.loci_id) !== -1) {
                d3.select(this).classed('filtered', false)
              }
              else {
                d3.select(this).classed('filtered', true)
              }
            }
          })
        }

        scope.$on('region_change', function (event, data) {

          var chromSizes =
          {
            1: 249250621,
            2: 243199373,
            3: 198022430,
            4: 191154276,
            5: 180915260,
            6: 171115067,
            7: 159138663,
            8: 146364022,
            9: 141213431,
            10: 135534747,
            11: 135006516,
            12: 133851895,
            13: 115169878,
            14: 107349540,
            15: 102531392,
            16: 90354753,
            17: 81195210,
            18: 78077248,
            20: 63025520,
            19: 59128983,
            22: 51304566,
            21: 48129895
          };


          var current_scale = 0;
          var chr = [];

          d3.map(data, function (d) {
            d.chr = parseInt(d.chr)
          })

          var groupedByChr = _.groupBy(data, function (d) {
            return d.chr
          });

          angular.forEach(groupedByChr, function (v, k) {
            var max = d3.max(v, function (d) {
              return d.end
            });
            var min = d3.min(v, function (d) {
              return d.start
            });

            var chr = k;

            d3.map(v, function (x) {
              x.normalizedStart = x.start - min;
              x.normalizedEnd = x.end - min;
            });

            this.push({
              'chr': k,
              'value': v,
              'max': max,
              'min': min
            })

          }, chr);

          var normalizedMax = d3.max(chr, function (d) {
            return d3.max(d.value, function (x) {
              return x.normalizedEnd
            })
          });

          var chromSizeList = [];

          angular.forEach(chromSizes, function (v, k) {
            this.push({
              chr: k,
              start: 0,
              end: v
            })
          }, chromSizeList);


          var largestChrom = Object.keys(chromSizes).map(function (key) {
            return chromSizes[key];
          });


          largestChrom = d3.max(largestChrom);

          var chrArr = d3.max(chr.map(function (d) {
            return parseInt(d.chr)
          }));

          var colorScale = {
            'tissue': '#17becf',
            'melanoma': ' #d62728'
          };

          var x = d3.scale.linear();

          var y = d3.scale.linear();

          y.domain([1, chrArr]);
          x.domain([1, largestChrom]);

          function render() {
            var divWidth = $(element).parent().width()
            var margin = {top: 20, right: 20, bottom: 30, left: 40},
              width = divWidth - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom,
              feature_height = 20;

            x.range([1, width]);
            y.range([0, height]);

            var zoom = d3.behavior.zoom()
              .x(x)
              .y(y)
              .scaleExtent([0, 10000])
              .on("zoom", zoomed);

            var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickSize(-height);

            var yAxis = d3.svg.axis().scale(y)
              .orient("left")
              .tickValues(chr.map(function (d) {
                return parseInt(d.chr)
              }))
              .tickFormat(d3.format("d"))
              .tickSubdivide(0);


            var svg = d3.select("#navigator").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("class", "navigator")
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .call(zoom);

            svg.append("rect")
              .attr("width", width)
              .attr("height", height)
              .style("fill", "none")
              .style("pointer-events", "all");

            svg.append("g")
              .classed("y axis", true)
              .call(yAxis)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .style("text-anchor", "end")
              .text("Chromosome");

            svg.append("g")
              .classed("x axis", true)
              .attr("transform", "translate(0," + (height + margin.top ) + ")")
              .call(xAxis)
              .append("text")
              .classed("label", true)
              .attr("x", width)
              .attr("y", margin.bottom)
              .style("text-anchor", "end");

            var objects = svg.append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr('id', 'main')

            objects.append("svg:line")
              .classed("axisLine hAxisLine", true)
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", width)
              .attr("y2", 0)
              .attr("transform", "translate(0," + height + ")");

            objects.append("svg:line")
              .classed("axisLine vAxisLine", true)
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 0)
              .attr("y2", height);

            var main = objects.append('g')
              .attr('width', width)
              .attr("height", height)
              .attr('id', 'mainobjects')

            main.selectAll(".box")
              .data(chromSizeList)
              .enter().append("rect")
              .classed("box", true)
              .attr("transform", transform)
              .attr("height", feature_height)
              .attr("width", function (d) {
                return x(d.end)
              }).style('fill', "transparent")
              .style('stroke', 'black')

            main.selectAll(".feature")
              .data(data)
              .enter().append("rect")
              .classed("feature", true)
              .classed("selected", function (d) {
                if (d.track == "melanoma" && d.chr == 1) {
                  return true
                } else {
                  return false
                }
              })
              .attr("transform", transform)
              .attr("height", feature_height)
              .attr("id", function (d) {
                return d.loci_id
              })
              .attr("width", function (d) {
                return x(d.width)
              })
              .style('fill', function (d) {
                return colorScale[d.track]
              })
              .on('click', function (d) {
                var selected = d3.select(this);
                clicked(selected);
                scope.$emit('browserchanged', selected.datum());

              })
              .on('mouseover', function (d) {
                d3.select(this).classed('mouseovered', true)
              })
              .on('mouseout', function (d) {
                d3.select(this).classed('mouseovered', false)
              });

            var default_translation  = angular.copy(d3.transform(d3.select('#mainobjects').attr("transform")).translate);
            var default_scale  = angular.copy(d3.transform(d3.select('#mainobjects').attr("transform")).scale);

            function zoomed() {
              main.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
              svg.select(".y.axis").call(yAxis);
              svg.select(".x.axis").call(xAxis);
            }

            function transform(d) {
              return "translate(" + x(d.start) + "," + y(d.chr) + ")";
            }

            function transformAndScale(that) {
              var scale = 4
              var t = d3.transform(that.attr("transform")),
                x = t.translate[0],
                y = t.translate[1];
              console.log(t)
              svg.transition().duration(400)
                .call(zoom.translate([((x * -scale) + (width / 2)), ((y * -scale) + height / 2)])
                  .scale(scale).event);
              svg.select(".y.axis").call(yAxis);
              svg.select(".x.axis").call(xAxis);
            }

            function clicked(selected) {
              d3.selectAll(".selected").classed('selected', false);
              selected.classed('selected', true);
              transformAndScale(selected)
            }

            scope.svg_zoom_in = function(){
              var t = d3.transform(d3.select('#mainobjects').attr("transform")),
                scale = t.scale[0];
              scale = scale * 1.5;
              svg.transition().duration(400)
                .call(zoom.scale(scale).event);
              svg.select(".y.axis").call(yAxis);
              svg.select(".x.axis").call(xAxis);
            };

            scope.svg_zoom_out = function(){
              var t = d3.transform(d3.select('#mainobjects').attr("transform")),
                scale = t.scale[0];
              console.log(scale)
              scale = scale * 0.5;
              svg.transition().duration(400)
                .call(zoom.scale(scale).event);
              svg.select(".y.axis").call(yAxis);
              svg.select(".x.axis").call(xAxis);
            };

            scope.svg_zoom_refresh = function(){
               svg.transition().duration(400)
                .call(zoom.translate(default_translation)
                  .scale(1).event);
              svg.select(".y.axis").call(yAxis);
              svg.select(".x.axis").call(xAxis);
            };


            scope.$on('goToSnp', function (event, snpLociId) {
              clicked(d3.select('rect[id="' + snpLociId + '"]'))
            });
          }

          window.onresize = function () {
                scope.$apply();
            };

             scope.$watch(function () {
                return angular.element(window)[0].innerWidth;
            }, function () {
               d3.select('svg.navigator').remove()
               render();
            });
        });
      }
    }
  });


angular.module('capseq').directive('autocomplete', function () {
  return {
    restrict: 'A',
    scope: {
      'results': '=',
      'suggestions': '<',
      'changeEvent': "&"
    },

    link: function (scope, elem, attr) {


      function checkSearchResults(suggestions, results) {
        if (suggestions.indexOf(results) !== -1) {

          return results
        } else {
          return false
        }
      }

      scope.$watch('suggestions', function (newVal, oldVal) {
        console.log(newVal);
        $("#refsearch").autocomplete({
          source: newVal,
          focus: function (event, ui) {
            scope.results.value = checkSearchResults(scope.suggestions, ui.item.value)
            scope.changeEvent()


          },

          select: function (event, ui) {
            scope.results.value = checkSearchResults(scope.suggestions, ui.item.value)
            scope.changeEvent()
          }
        })

        $('#refsearch').keypress(function (e) {
          if (e.keyCode == 13) {
            e.preventDefault();
            $(this).autocomplete('close');
            console.log(this.value)
            scope.results.value = checkSearchResults(scope.suggestions, this.value)
            scope.$parent.$apply()
            scope.changeEvent()


          }
        })
      })
    }
  }
})


;
/**
 * Created by xiuchengquek on 25/02/2016.
 */
angular.module('capseq')
  .service('getTracks', ['$http', function($http){

      var getTracks = this;
      var trackFile = 'http://pwbc.garvan.org.au/~xiuque/capseq_data/trackfile.txt';

      function getTrackFile(trackFile){


          $http.get(trackFile)








      }










  }]);;
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
;
/**
 * Created by xiuchengquek on 29/02/2016.
 */


angular.module('capseq')
    .service('defaultSettings', ['dataLoader', '$http', '$q', function(dataLoader, $http, $q){

        var default_transcripts = 'TCONS_00047622';
        var default_track = '/melanoma/';
        var default_transcripts_url = '/txinfo/' + default_transcripts;
        var default_expression_url = default_track + default_transcripts;


    }])
    .factory('dataLoader',  ['$http', '$q', function($http, $q){


      var self = {};


      self.diseaseMap = {};
      self.efoToDiseaseId = {};
      self.traitsByDiseaseId = {};


      function mapEfoToDiseaseId(efo_term){
        return self.efoToDiseaseId[efo_term]
      }


       function getTranscript(transcript_id){
            var url = '/txinfo/' + transcript_id
            return $http.get(url)
        }

        function getExpression(transcript_id, track){
            var url = track  + '/' +  transcript_id;
            return $http.get(url)
        }

        function widthData(data){
            var expression = [];
            angular.forEach(data, function(value, key){
                this.push({label : key, value : value})
            }, expression);
            return expression
        }

        function getTranscriptChangeInfo (transcript_id, info, track) {
            var txinfo = getTranscript(transcript_id);
            var expression = getExpression(transcript_id, track);
            return $q.all({ txinfo : txinfo, expression : expression })
              .then(function(results){
                  var transcriptData = results.txinfo.data;
                  transcriptData.track = track;
                  var expressionData = widthData( results.expression.data.expression);
                  return {
                      transcriptData  : transcriptData,
                      expressionData : expressionData
                  }
              })
        }
        function getRegionList(){
            var url = '/capturedregions/';
            return $http.get(url)
        }
        function loadDefault() {
            var txinfo = getTranscript('TCONS_00047715');
            var expressionData =  getExpression('TCONS_00047715', 'melanoma');
            var regionList = getRegionList();
            return $q.all({ txinfo : txinfo, expression : expressionData, regionList :  regionList})
              .then(function(results){
                  results.expression.data.expression = widthData( results.expression.data.expression );
                  return results
              })
        }

      function getDiseases() {
        return $http.get('/traits/all/').then(function(results){
          var disease = {};
          var allTraits = angular.copy(results.data);
          angular.forEach(allTraits, function(d,i,arr){
            this[d.disease_id] = d;
          },self.traitsByDiseaseId)
          self.diseaseMap = results.data;

          angular.forEach(results.data, function(value, idx){
            disease[value.parent_term]  = disease[value.parent_term] || [];
            disease[value.parent_term].push(value.efo_term)
          });
          angular.forEach(disease, function(value, key){
            this[key] = _.uniq(value)
          }, disease);

          angular.forEach(self.diseaseMap, function(value, idx){
            self.efoToDiseaseId[value.efo_term] = self.efoToDiseaseId[value.efo_term] || [];
            self.efoToDiseaseId[value.efo_term].push(value.disease_id)
          });

          angular.forEach(self.diseaseMap, function(value, key){
            this[key] = _.uniq(value)
        }, self.diseaseMap);
          return disease
        });
      }

      function getSnpsByLoci(){
        return $http.get('/snp/').then(function(results){
          return results.data
        })
      }

      function getSnpSpecificLocation(){
        return $http.get('/snp_loc/').then(function(results){
          var data = {};
          angular.forEach(results.data, function(d, i, arr){
             this[d.snp_id] = {
               'chr' : d.chr,
               'start' : d.start - 9,
               'end' : d.end + 10
             }
          },data);
          return data
        })
      }


      function getRegionToTx(loci_id){
        return $http.get('/capturedregions/transcripts/' + loci_id) +'/'.then(function(results){
          return results.data
        })
      }


      function getEfoToDiseaseMap(){
        return self.efoToDiseaseId
      }


      function getTraitsByDiseaseId(){
        return self.traitsByDiseaseId
      }





        return {
            getTranscriptChangeInfo : getTranscriptChangeInfo,
            loadDefault : loadDefault,
            getDiseases : getDiseases,
            mapEfoToDiseaseId  : mapEfoToDiseaseId,
            getEfoToDiseaseMap : getEfoToDiseaseMap,
            getSnpsByLoci : getSnpsByLoci,
            getRegionToTx : getRegionToTx,
            getTraitsByDiseaseId : getTraitsByDiseaseId,
            getSnpSpecificLocation : getSnpSpecificLocation
        }
    }]);



