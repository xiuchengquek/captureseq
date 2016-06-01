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


