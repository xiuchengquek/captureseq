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
        $scope.selectedregion = {chr : 1, start : 150534367, end : 150960349,
            'Region Width' : 425983,  track : 'melanoma',
         details: {
            snps: [
                {
                    snp_id: "rs7412746"}
            ],
            disease: [
                "melanoma"
            ]
        }
        }

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
            var url = '/txinfo/' + transcript_id;
            return $http.get(url)
        }

        function getExpression(transcript_id, track){
            var url = track  + '/' +  transcript_id;
            return $http.get(url)
        }

        function getRegionList(){
            var url = '/capturedregions/';
            return $http.get(url)
        }


        var browser = new Browser({
            chr: '1',
            viewStart: 150727097,
            viewEnd: 150875437,
            noPersist : true,

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
                    featureInfoPlugin : function(feat, info){
                        dataParser(feat, info, 'tissue')
                    }
                },
                {
                    name: 'Capture Transcripts - Melanoma',
                    bwgURI: file_server + 'captured_transcript_melanoma_single_noex.bb',
                    featureInfoPlugin : function(feat, info){
                        dataParser(feat, info, 'melanoma')
                    }

                }]
        });


        $scope.$on('browserchanged', function(e,d ){
           browser.setLocation(d.chr.toString(), d.start, d.end);
        });



        function load_default(){

            var txinfo = getTranscript('TCONS_00047715');
            var expressionData =  getExpression('TCONS_00047715', 'melanoma');
            var regionList = getRegionList();

            $q.all({ txinfo : txinfo, expression : expressionData, regionList :  regionList})
                .then(function(results){
                     var expressionData = results.expression.data.expression;
                     $scope.transcript_data = results.txinfo.data;
                     $scope.transcript_data.track = 'melanoma';
                     $scope.region = results.regionList.data;
                     $scope.$broadcast('expression_change', widthData(expressionData));
                     $scope.$broadcast('region_change', results.regionList.data);

            })


        }


        load_default()


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


                var margin = {top: 20, right: 20, bottom: 30, left: 40},
                    width = 520 - margin.left - margin.right,
                    height = 300 - margin.top - margin.bottom;

                function plotBar(data) {

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
                    ;

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
            scope: {

                'region': '=',
                'selectedregion': '='

            },
            link: function (scope, element, attr) {


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


                    var margin = {top: 20, right: 20, bottom: 30, left: 40},
                        width = 800 - margin.left - margin.right,
                        height = 600 - margin.top - margin.bottom;

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
                    }))


                    var x = d3.scale.linear()
                        .range([0, width]);
                    var y = d3.scale.linear()
                        .range([0, height]);


                    y.domain([1, chrArr]);
                    x.domain([0, largestChrom]);


                    var zoom = d3.behavior.zoom()
                        .x(x)
                        .y(y)
                        .scaleExtent([0, 10000])
                        .on("zoom", zoomed);


                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        .tickSize(-height);

                    var colorScale = {
                        'tissue' : '#17becf',
                        'melanoma' : ' #d62728'
                    };


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
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Chromosome");

                    svg.append("g")
                        .classed("x axis", true)
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .append("text")
                        .classed("label", true)
                        .attr("x", width)
                        .attr("y", margin.bottom - 10)
                        .style("text-anchor", "end");

                    var objects = svg.append("svg")

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


                    objects.selectAll(".box")
                        .data(chromSizeList)
                        .enter().append("rect")
                        .classed("box", true)
                        .attr("transform", transform)
                        .attr("height", 10)
                        .attr("width", function (d) {


                            return x(d.end)
                        }).style('fill', "transparent")
                        .style('stroke', 'black')


                    objects.selectAll(".feature")
                        .data(data)
                        .enter().append("rect")
                        .classed("feature", true)
                        .attr("transform", transform)
                        .attr("height", 10)
                        .attr("width", function (d) {
                            return x(d.width)
                        })
                        .style('fill', function(d) {

                            return colorScale[d.track]


                        })
                            .on('click', function (d) {
                            scope.$apply(function () {
                                scope.selectedregion = d;

                            })
                                scope.$emit('browserchanged', d);



                            ;


                        })


                    function zoomed() {
                        svg.selectAll(".feature").attr("transform", function (d) {
                            return "translate(" + x(d.start) + "," + y(d.chr) + ")scale(" + d3.event.scale + "," + d3.event.scale + ")"
                        })
                        svg.selectAll(".box").attr("transform", function (d) {
                            return "translate(" + x(d.start) + "," + y(d.chr) + ")scale(" + d3.event.scale + "," + d3.event.scale + ")"
                        })


                        svg.select(".y.axis").call(yAxis);
                        ;
                        svg.select(".x.axis").call(xAxis);
                        ;


                    }

                    function transform(d) {
                        return "translate(" + x(d.start) + "," + y(d.chr) + ")";
                    }

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
    }]);



