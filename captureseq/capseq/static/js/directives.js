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
                    console.log(scope.selectedregion)

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
                        width = 1000 - margin.left - margin.right,
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
                        .tickSize(-height)


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
                        .style('fill', 'red')
                        .on('click', function (d) {


                            console.log(d)


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











