/**
 * Created by xiuchengquek on 24/02/2016.
 */
'use strict';

// Declare app level module which depends on views, and components
angular.module('capseq', [
    'ngRoute'
]).
    config(['$interpolateProvider', function($interpolateProvider) {
      $interpolateProvider.startSymbol('[[');
      $interpolateProvider.endSymbol(']]')
    }]);
;
/**
 * Created by xiuchengquek on 25/02/2016.
 */

angular.module('capseq')
    .controller('GenomeController', ['$scope', '$rootScope', function ($scope, $rootScope) {

        var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data/output/'

        function gencodeFIP(feature, info) {
            'use strict';
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


        function dataParser(feature, track) {
            $scope.expression.transcript_name = feature.label;
            $scope.expression.track = track;
            angular.forEach($scope.expression.details, function(ele, idx){
                ele.value = feature[ele.field_name]
            });

            $scope.$broadcast('expression_change', $scope.expression);
            $scope.$digest();


        }

        new Browser({
            chr: '10',
            viewStart: 115779011,
            viewEnd: 115783011,
            cookieKey: 'human',

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
                    name: 'Capture Region - Body Atlas',
                    bwgURI: file_server + 'captured_region_tissue.bb'
                },
                {
                    name: 'Capture Region - Melanoma',
                    bwgURI: file_server + 'captured_region_melanoma.bb'
                },

                {
                    name: 'Capture Transcripts - Body Atlas',
                    bwgURI: file_server + 'capture_transcript_tissue_dirty_noas.bb',
                    collapseSuperGroups: true,
                    noSourceFeatureInfo: true,
                    featureInfoPlugin: function (f, info) {
                        dataParser(f, 'tissue')
                    },

                },
                {
                    name: 'Capture Transcripts - Melanoma',
                    bwgURI: file_server + 'capture_transcript_melanoma_dirty_noas.bb',
                    collapseSuperGroups: true,
                    noSourceFeatureInfo: true,
                    featureInfoPlugin: function (f, info) {
                        dataParser(f, 'melanoma')

                    }
                }]
        });

        $scope.expression = {transcript_name : '', track : '', details :
                            [   { field_name : "field8", label :  "adipose" , value : 0 },
                                { field_name : "field9", label :  "bladder" , value : 0 },
                                { field_name : "field10", label :  "brain" , value : 0 },
                                { field_name : "field11", label :  "breast" , value : 0 },
                                { field_name : "field12", label :  "cervix" , value : 0 },
                                { field_name : "field13", label :  "colon" , value : 0 },
                                { field_name : "field14", label :  "esophagus" , value : 0 },
                                { field_name : "field15", label :  "heart" , value : 0 },
                                { field_name : "field16", label :  "kidney" , value : 0 },
                                { field_name : "field17", label :  "liver" , value : 0 },
                                { field_name : "field18", label :  "lung" , value : 0 },
                                { field_name : "field19", label :  "ovary" , value : 0 },
                                { field_name : "field20", label :  "placenta" , value : 0 },
                                { field_name : "field21", label :  "prostate" , value : 0 },
                                { field_name : "field22", label :  "skmusc" , value : 0 },
                                { field_name : "field23", label :  "smint" , value : 0 },
                                { field_name : "field24", label :  "spleen" , value : 0 },
                                { field_name : "field25", label :  "testes" , value : 0 },
                                { field_name : "field26", label :  "thymus" , value : 0 },
                                { field_name : "field27", label :  "thyroid" , value : 0 },
                                { field_name : "field28", label :  "trachea"   , value : 0 }] }
    }]);
;
/**
 * Created by xiuchengquek on 25/02/2016.
 */

angular.module('capseq')

  .directive('barChart', function(){
    return {

      restrict: 'E',
      scope : {
          'data' : '=data',
          'transcript_id' : '='



        },
      link: function(scope, element, attrs){


        var margin = {top: 20, right: 20, bottom: 50, left: 40},
            width = 400 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = d3.select("#expression").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function plotBar(data){

          var value = data.details;
          x.domain(value.map(function(d) { return d.label; }));
          y.domain([0, d3.max(value, function(d) { return d.value; })]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .selectAll("text")
              .attr("y", 0)
              .attr("x", 9)
              .attr("dy", ".35em")
              .attr("transform", "rotate(90)")
              .style("text-anchor", "start");;

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
              .data(value)
            .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) { return x(d.label); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); });
          }



          scope.$on('expression_change', function(event, value){
            plotBar(value)
          });








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










  }]);