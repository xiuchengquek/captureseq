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
            width = 600 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis().scale(y)
            .orient("left");

        var svg = d3.select("#expression").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
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
        console.log(scope.data)














        function plotBar(data) {
          console.log(data)

          x.domain(data.map(function(d) { return d.label; }));
          y.domain([0, d3.max(data, function(d) { return Number(d.value); })]);

          svg.selectAll(".bar").remove()

         svg.selectAll(".bar")
             .data(data)
             .enter().append("rect")
             .attr("class", "bar")
             .attr("x", function(d) { return x(d.label); })
             .attr("width", x.rangeBand())
             .attr("y", function(d) { console.log('test') ; return y(d.value); })
             .attr("height", function(d) { return height - y(d.value); });


        }







          scope.$on('expression_change', function(event, value){
            plotBar(value)
          });








        }








      }



  })







