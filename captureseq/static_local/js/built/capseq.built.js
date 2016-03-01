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
;
/**
 * Created by xiuchengquek on 25/02/2016.
 */

angular.module('capseq')
    .controller('GenomeController', ['$scope', '$rootScope', '$http' ,"$q", "$cookies", function ($scope, $rootScope, $http, $q) {

        var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data/output/';
        'use strict';

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


        function dataParser(feature, info, track) {
            var transcript_id = feature.label;
            var txinfo = getTranscript(transcript_id);
            var expression = getExpression(transcript_id, track);

            $q.all({ txinfo : txinfo, expression : expression })
                .then(function(results){
                    var expressionData = results.expression.data.expression;
                     $scope.transcript_data = results.txinfo.data;
                     $scope.transcript_data.track = track;
                     $scope.$broadcast('expression_change', widthData(expressionData));
            })
        }

        function getTranscript(transcript_id){
            var url = '/txinfo/' + transcript_id
            return $http.get(url)
        }

        function getExpression(transcript_id, track){
            var url = track  + '/' +  transcript_id;
            return $http.get(url)
        }


        new Browser({
            chr: '1',
            viewStart: 150727097,
            viewEnd: 150875437,
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
                    name: 'Capture Region - Tissue',
                    bwgURI: file_server + 'captured_region_tissue.bb'
              },
                {
                    name: 'Capture Region - Melanoma',
                    bwgURI: file_server + 'captured_region_melanoma.bb'
                },
                {
                    name: 'Capture Transcripts - Tissue',
                    bwgURI: file_server + 'captured_transcript_tissue_noex.bb',
                    featureInfoPlugin : function(feat, info){
                        dataParser(feat, info, 'tissue')
                    }
                },
                {
                    name: 'Capture Transcripts - Melanoma',
                    bwgURI: file_server + 'captured_transcript_melanoma_noex.bb',
                    featureInfoPlugin : function(feat, info){
                        dataParser(feat, info, 'melanoma')
                    }

                }]
        });

        function load_default(){

            var txinfo = getTranscript('TCONS_00047715');
            var expressionData =  getExpression('TCONS_00047715', 'melanoma');

            $q.all({ txinfo : txinfo, expression : expressionData })
                .then(function(results){
                    var expressionData = results.expression.data.expression;
                     $scope.transcript_data = results.txinfo.data;
                     $scope.transcript_data.track = 'melanoma';
                     $scope.$broadcast('expression_change', widthData(expressionData));
            })


        }


        load_default()

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


        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 400 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;











        function plotBar(data) {





          d3.select(".expression_plot").remove();

          var x = d3.scale.ordinal()
              .rangeRoundBands([0, width], .1);

          var y = d3.scale.linear()
              .range([height, 0]);

          x.domain(data.map(function(d) { return d.label; }));
          y.domain([0, d3.max(data, function(d) { return Number(d.value) }) * 1.1]);


          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

          var yAxis = d3.svg.axis().scale(y)
              .orient("left");






        var svg = d3.select("#expression").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class" , "expression_plot")
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .selectAll("text")
            .attr("dy", ".35em")
            .attr("dx", ".35em")

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
             .data(data)
             .enter().append("rect")
             .attr("class", "bar")
             .attr("x", function(d) { return x(d.label); })
             .attr("width", x.rangeBand())
             .attr("y", function(d) { return y(Number(d.value)); })
             .attr("height", function(d) { return height - y(Number(d.value)); });


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










  }]);;
/**
 * Created by xiuchengquek on 29/02/2016.
 */


angular.module('capseq')
    .service('defaultSettings', ['dataLoader', '$http', '$q', '$cookies', function(dataLoader, $http, $q, $cookies){

        var default_transcripts = 'TCONS_00047622' || $cookies.get('transcripts');
        var default_track = '/melanoma/' || $cookies.get('track');
        var default_transcripts_url = '/txinfo/' + default_transcripts;
        var default_expression_url = default_track + default_transcripts;

    }])
    .factory('dataLoader',  ['$http', '$q', function($http, $q){




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










    }])



