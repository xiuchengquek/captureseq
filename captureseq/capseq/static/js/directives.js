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
            width = 520 - margin.left - margin.right,
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







