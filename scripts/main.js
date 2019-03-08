const jsonConversion = require('./jsonConversion.js');
const actorManagement = require('./actorManagement.js');
const util = require('./util.js');
const d3 = require('d3');


var simulation;




var svg = d3.select("svg"),
    // width = +svg._groups[0][0].clientWidth,
    width = 1000,
    height = +svg.attr("height"),
    midX = 50,
    sliderHeight = height * 7 / 8;


var lifeSpanWidth = 200;


var color = d3.scaleOrdinal(d3.schemeCategory20);

var yearFrequency = function (year, frequency) {
    this.year = year;
    this.eventsPerYear = [];
    this.frequency = frequency;
}


function drawGraph(data) {


    var graph = {};
    graph["nodes"] = data.actors;
    graph["links"] = data.ties;

    var eventList = data.objects.map(a => a.eventList);
    eventList = [].concat.apply([], eventList);

    var lifeSpanRange = (d3.extent(data.objects.map(function (e) {
        return e.lifeSpan;
    })));


    var eventPosition = d3.scaleLinear()
        .range([0, lifeSpanWidth])
        .domain([0, 100]);


    var rangeSliderMin = d3.min(eventList, function (d) {
        if (d.eventTime)
            return d.eventTime.year();
    });
    var rangeSliderMax = d3.max(eventList, function (d) {
        if (d.eventTime)
            return d.eventTime.year();
    });

    var yearFrequencyList = (createEventFrequencyList(eventList, rangeSliderMin, rangeSliderMax));

    var collisionForce = d3.forceCollide(12).strength(1).iterations(100);


    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.ID;
        }).distance(60).strength(function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) return 0.2;
            return 2;
        }))
        .force("charge", d3.forceManyBody().strength(-2000).distanceMin(0).distanceMax(550))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collisionForce", collisionForce);


    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .style("stroke", function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "#eee";
            }
            else return "black";
        })
        .style("stroke-width", function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return 1;
            }
            else return 2;
        });






    var actorNodes = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "actorObject")
        .attr("height", 300)
        .attr("x", function (d) {
            // if (d.isActor) {
            d.fx = 1 * width / 2 - lifeSpanWidth / 2 + d.treeDepth * width / 4;
            // }
        });


    var underlines = actorNodes.append("line")
        .attr("class", "underline line")
        .attr("x1", 0)
        .attr("x2", lifeSpanWidth)
        .attr("y1", 5)
        .attr("y2", 5)
        .attr('fill', 'white')
        .attr('stroke', function (d) {
            if (d.isActor) {
                return 'black';
            }
            else
                return 'none';
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    var eventNodes = actorNodes.append("g")
        .attr("class", "eventArray")
        .selectAll("circle")
        .data(function (d) {
            if (d.isActor) {
                var actorObject = util.findActorNodeByID(d.ID, data.objects);
                return (actorObject.eventList.sort(function (x, y) {
                    return d3.ascending(x.eventTime.year(), y.eventTime.year());
                }));
            }
            else return [];
        })
        .enter().append("circle")
        .attr("class", "eventUnit")
        .attr("r", function (d) {
            // if (d.isActor) {
            return 3;
            // }
            // else return 0;
        })
        .attr("cx", function (d, i) {
            return i * 12 + 5
        })
        .attr("cy", 14)
        .attr('fill', 'none')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    var text = svg.selectAll('text')
        .data(graph.nodes)
        .enter().append("svg:text")
        .attr("class", "label")
        .style("font-size", "11px")
        .text(function (d) {
            if (d.isActor) {
                var actorData = data.objects.filter(x => x.ID === d.ID);
                return (actorData[0].fullName);
            }
        });


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);


    function ticked() {

        text.attr("x", function (d) {
            return d.x;
        })
            .attr("y", function (d) {
                return d.y;
            });


        link
            .attr("x1", function (d) {
                // debugger;
                if (d.source.isActor) {
                    return d.source.x + lifeSpanWidth;
                }
                else return d.source.x + 80;
            })
            .attr("y1", function (d) {
                return d.source.y + 5;
            })
            .attr("x2", function (d) {

                if (d.target.isActor) {
                    return d.target.x;
                }
                else return d.target.x + 80;
            })
            .attr("y2", function (d) {
                return d.target.y + 5;
            });

        actorNodes
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

    }


    actorNodes.on('mouseover', function (d) {
        actorNodes.style('stroke', function (l) {
            // debugger;
            if (l.ID === d.ID || l.ID === d.ID) {
                return "red";
            }
            else
                return "blue";
        });
        link.style('stroke', function (l) {
            var actorObject = util.findActorNodeByID(d.ID, data.objects);
            if (l.source.ID.includes(d.ID) || l.target.ID.includes(d.ID)) {
                return "gold";
            }
            if (!actorObject.firstParent) {
                var firstParentID = ""
            } else var firstParentID = actorObject.firstParent.ID;
            if (!actorObject.secondParent) {
                var secondParentID = ""
            } else var secondParentID = actorObject.secondParent.ID;


            if ((l.target.ID === firstParentID + "+" + secondParentID) || (l.target.ID === secondParentID + "+" + firstParentID)) {
                return "gold";
            }
            else
                return "#eee";
        });

    });

    actorNodes.on('mouseout', function () {
        link.style('stroke', function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "#eee";
            }
            else return "black";
        });

    });


    var rangeSliderY = d3.scaleLinear()
        .domain([+rangeSliderMin - 5, +rangeSliderMax + 5])
        .range([0, sliderHeight])
        .clamp(true);


    var barChartX = d3.scaleLinear()
        .range([0, 25])
        .domain([0, d3.max(yearFrequencyList, function (d) {
            return d.eventsPerYear.length;
        })]);


    var g = d3.select("#sideBar").append("g")
        .attr("height", sliderHeight);


    g.append("g")
        .attr("transform", "translate(" + midX + ", 50)")
        .attr("class", "axis")
        .call(d3.axisRight(rangeSliderY)
            .ticks(10, ".0f")
            .tickSize(10, 5)
        );


    var barChart = g.append("g")
        .attr("transform", "translate(" + midX + ", 50)");

    var bars = barChart.selectAll(".bar")
        .data(yearFrequencyList)
        .enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(0, " + rangeSliderY(+d.year) + ")";
        });


    var squares = bars.selectAll(".squares")
        .data(function (d) {
            return d.eventsPerYear
        })
        .enter()
        .append("rect")
        .attr("class", function (d) {
            return "squares " + d.label;
        })
        .attr("x", function (d, i) {
            return (-10 - (i * 11));
        })
        .attr("max-width", "10px")
        .attr("height", function (d) {
            return (rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1);
        })
        .attr("width", function (d) {
            return (rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1);
        })
        .attr("fill", function (d) {
            return ("#f1dd97")
        }).on("mouseover", function (d) {
            showToolTip(d, graph)
        }).on("mouseout", function () {
            d3.select("#tooltip").classed("hidden", true);

        });


    var slider = g.append("g")
        .attr("transform", "translate(" + midX + ", 50)")
        .attr("class", "slider");

    slider.append("line")
        .attr("class", "track")
        .attr("y1", rangeSliderY.range()[0])
        .attr("y2", rangeSliderY.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () {
                slider.interrupt();

            })
            .on("start drag", function () {
                handle.attr("cy", rangeSliderY(rangeSliderY.invert(d3.event.y)));
                update(float2int(rangeSliderY.invert(d3.event.y)));
            }));


    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 7)
        .attr("cy", 0);


    var collapseCheckBox = d3.select("#collapseCheckBox");
    collapseCheckBox.on("change", function (d) {
        var selected = this.checked;
        if (selected) {

            d3.selectAll(".actorObject").attr("x", function (d) {
                if (d.recursiveDepth > 1 && d.isActor) {
                    d.fx = 650 + d.treeDepth * 300;
                }
            })
            d3.selectAll(".rect")
                .attr("width", function (d) {

                        if (d.recursiveDepth > 1) {
                            return 6;
                        }
                        else if (d.isActor) {
                            return lifeSpanWidth;
                        }
                        else return 0;

                    }
                );

            simulation.force("link").distance(function (d) {
                if (d.recursiveDepth > 1)
                    return 30;
                else return 80;
            });

            simulation.force("charge", d3.forceManyBody()
                .strength(function (d) {
                    if (d.recursiveDepth > 1)
                        return -100;
                    else return -500;
                }));
            simulation.alpha(1).restart();


            d3.selectAll(".label")
                .text(function (d) {
                        if (d.recursiveDepth > 1) {
                            return "";
                        }
                        else if (d.isActor) {
                            var actorData = data.objects.filter(x => x.ID === d.ID);
                            return (actorData[0].fullName);
                        }

                    }
                );

        }

        else {
            console.log("unselected");
        }

    });
}


function changeYear(year) {

// mark event nodes according to year
    changeEventStatus(year)

// change line status according to year


}

function changeEventStatus(year) {

    d3.selectAll(".eventUnit")
        .filter(function (d) {
            return (d.eventTime.year() < year)
        })
        .attr("class", "eventUnit pastCircle");


    d3.selectAll(".eventUnit")
        .filter(function (d) {
            return (d.eventTime.year() === year)
        })
        .attr("class", "eventUnit currentCircle");


    d3.selectAll(".eventUnit")
        .filter(function (d) {
            return (d.eventTime.year() > year)
        })
        .attr("class", "eventUnit futureCircle");


}


function showToolTip(element, graph) {

    console.log(element);


    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;


    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#source")
        .text(element.source);


    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#target")
        .text(element.target);


    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#label")
        .text(element.label);


    d3.select("#tooltip").classed("hidden", false);
}


function createEventFrequencyList(eventList, minYear, maxYear) {

    var yearFrequencyList = [];

    for (var i = minYear; i < +maxYear + 1; i++) {
        var newYear = new yearFrequency(+i, 0);
        yearFrequencyList.push(newYear);

    }

    for (var i = 0; i < eventList.length; i++) {
        var foundYearIndex;
        var foundYear = yearFrequencyList.filter(function (d) {
            var thisEventYear = eventList[i].eventTime.year();
            return (d.year === +thisEventYear);
        });


        if (foundYear[0]) {
            for (var j = 0; j < yearFrequencyList.length; j++) {
                if (yearFrequencyList[j].year === foundYear[0].year) {
                    foundYearIndex = j;
                    break;
                }
            }
            yearFrequencyList[foundYearIndex].eventsPerYear.push(eventList[i]);
            yearFrequencyList[foundYearIndex].frequency++
        }
    }
    return yearFrequencyList;
}


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}


d3.select("#yearField").on("input", function () {
    update(+this.value);
});

d3.select("#idField").on("keydown", function () {
    if (d3.event.keyCode !== 13)
        return;

    console.log(+this.value);

    var centralActorID = this.value;
    var centralActor = actorManagement.getCentralActor(centralActorID);

    var populatedActorData = actorManagement.buildNodeList(centralActor);
    console.log(populatedActorData);

    d3.selectAll("svg > *").remove();

    drawGraph(populatedActorData);
});

function update(inputYear) {
    console.log(inputYear);
    changeYear(inputYear);
}

function float2int(value) {
    return value | 0;
}


// getActors(4);
// getActors(42);
// getActors(480);
// getActors(16);


var centralActorID = "120";
var centralActor = actorManagement.getCentralActor(centralActorID);

var populatedActorData = actorManagement.buildNodeList(centralActor);
console.log(populatedActorData);
drawGraph(populatedActorData);

