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







