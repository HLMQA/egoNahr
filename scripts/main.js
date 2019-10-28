const jsonConversion = require('./jsonConversion.js');
const actorManagement = require('./actorManagement.js');
const util = require('./util.js');
const d3 = require('d3');


var simulation;


var svg = d3.select("svg");


var width = 1600,
    // height = +svg.attr("height"),
    height = d3.select("#frameHeight").node().value,
    sliderHeight = height * 7 / 8,
    midX = 50;

var sliderOffset = 25;

svg.style("height", height);

var lifeSpanWidth = 200;
var eventList;


var yearFrequency = function (year, frequency) {
    this.year = year;
    this.eventsPerYear = [];
    this.frequency = frequency;
}


var zoom = d3.zoom().scaleExtent([0.5, 4]).on("zoom", zoomed);
var yearSlider, handle, rangeSliderY;

var svgFrame = d3.select("svg")
    .call(zoom);

function zoomed() {
    var translate = d3.event.transform;
    // var xScale = d3.event.scale;
    svg.attr("transform", translate);
}


function drawGraph(data) {


    svgFrame.call(zoom.transform, d3.zoomIdentity);


    svg = svgFrame
        .append("g")
        .attr("class", "canvas")


    var godParentMarkerColor = "#959595";
    var parentMarkerColor = "#000000";
    var highlightedMarkerColor = "#f3b224";

    var defs = svg.append("svg:defs");

    function marker(color) {
        defs.append("svg:marker")
            .attr("id", color.replace("#", ""))
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5) // This sets how far back it sits, kinda
            .attr("refY", 0)
            .attr("markerWidth", 9)
            .attr("markerHeight", 9)
            .attr("orient", "auto")
            .attr("markerUnits", "userSpaceOnUse")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .style("fill", color)
            .style("stroke", "none");

        return "url(" + color + ")";
    };

    var graph = {};
    graph["nodes"] = data.actors;
    graph["links"] = data.ties;

    eventList = data.objects.map(a => a.eventList);
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
        }).distance(function (d) {
                if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) return 400;
                else if (d.tieType === actorManagement.Labels.SIBLINGHOOD_LABEL) return 10;

                else return 80;
            }
        ).strength(function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) return 3;
            else if (d.tieType === actorManagement.Labels.SIBLINGHOOD_LABEL) return 4.2;
            return 1.3;
        }))
        .force("charge", d3.forceManyBody().strength(-500)
            .distanceMin(0)
            .distanceMax(850))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collisionForce", collisionForce);


    d3.select("#spinner")
        .classed("hidden", true);

    var link = svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter().append("path")
        .attr("class", function (d) {
            return ("links " + d.tieType);
        })
        .attr("marker-end", function (d) {
                var target;
                if (typeof d.target === 'string') {
                    target = util.findActorNodeByID(d.target, data.actors);
                } else target = d.target;
                if (!target.isActor) {
                    return;
                }
                if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                    return marker(godParentMarkerColor);
                }
                else return marker(parentMarkerColor);
            }
        );


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
            .on("end", dragended))
        .on("click", function (d) {
            console.log(d.eventTime.year());
            update(d.eventTime.year());
        });


    var text = actorNodes.select('text')
        .data(graph.nodes)
        .enter().append("svg:text")
        .attr("class", function (d) {
            if (d.ID === centralActorID) {
                return ("label centralActor")
            }
            else return ("label")
        })
        .text(function (d) {
            if (d.isActor) {
                var actorData = data.objects.filter(x => x.ID === d.ID);
                var birthDate = "?",
                    deathDate = "?";
                if (actorData[0].baptismDate)
                    birthDate = actorData[0].baptismDate.year();
                if (actorData[0].funeralDate)
                    deathDate = actorData[0].funeralDate.year();
                return (actorData[0].fullName + " (" + birthDate + "-" + deathDate + ")");
            }
        })
        .on('mouseover', function (d) {
            link.classed("active", function (l) {
                var actorObject = util.findActorNodeByID(d.ID, data.objects);
                if (l.source.ID.includes(d.ID) || l.target.ID.includes(d.ID)) {
                    return true;
                }
                if (!actorObject.firstParent) {
                    var firstParentID = ""
                } else var firstParentID = actorObject.firstParent.ID;
                if (!actorObject.secondParent) {
                    var secondParentID = ""
                } else var secondParentID = actorObject.secondParent.ID;


                if ((l.target.ID === firstParentID + "+" + secondParentID) || (l.target.ID === secondParentID + "+" + firstParentID)) {
                    return true;
                }
                else return false;
            })
                .attr("marker-end", function (l) {
                    var target;
                    if (typeof l.target === 'string') {
                        target = util.findActorNodeByID(l.target, data.actors);
                    } else target = l.target;
                    if (!target.isActor) {
                        return;
                    }

                    var actorObject = util.findActorNodeByID(d.ID, data.objects);
                    if (l.source.ID.split("+").includes(d.ID) || l.target.ID.split("+").includes(d.ID)) {
                        return marker(highlightedMarkerColor);
                    }
                    if (!actorObject.firstParent) {
                        var firstParentID = ""
                    } else var firstParentID = actorObject.firstParent.ID;
                    if (!actorObject.secondParent) {
                        var secondParentID = ""
                    } else var secondParentID = actorObject.secondParent.ID;


                    if ((l.target.ID === firstParentID + "+" + secondParentID) || (l.target.ID === secondParentID + "+" + firstParentID)) {
                        return marker(highlightedMarkerColor);
                    }
                    else {
                        var lineColor = d3.select(this).style("stroke");
                        lineColor = d3.color(lineColor).hex();
                        return marker(lineColor);
                    }
                });

            showPopUp(d, data, "actor");

        });

    text.each(function (d) {
        d.textWidth = this.clientWidth;
    });

    text.on('mouseout', function () {
        link.classed('active', function (d) {
            return false;
            // })
            //     .style('stroke', function (d) {
            //     if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
            //         return "#eee";
            //     }
            //     else return "black";
        }).attr("marker-end", function (d) {

            var target;
            if (typeof d.target === 'string') {
                target = util.findActorNodeByID(d.target, data.actors);
            } else target = d.target;
            if (!target.isActor) {
                return;
            }

            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return marker(godParentMarkerColor);
            }
            else return marker(parentMarkerColor);
        });

        d3.select("#tooltip").classed("hidden", true);
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
                if (d.tieType === actorManagement.Labels.SIBLINGHOOD_LABEL) {
                    return d.source.x;
                }
                else if (d.source.isActor) {
                    return d.source.x + d.source.textWidth;
                }
                else return d.source.x + 80;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                if (d.tieType === actorManagement.Labels.SIBLINGHOOD_LABEL)
                    return d.target.x;
                else if (d.target.isActor) {
                    return d.target.x - 10;
                }
                else return d.target.x + 80;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        link.attr("d", d3.linkHorizontal()
            .x(function (d, i) {

                var sourceActor = graph.links[i].source;
                var targetActor = graph.links[i].target;

                if (sourceActor.ID === d.ID) {
                    if (d.isActor) {
                        return d.x + lifeSpanWidth;
                    }
                    else {
                        return d.x + 80;
                    }
                }
                else if (targetActor.ID === d.ID) {
                    if (d.isActor) {
                        return (d.x - 10);
                    }
                    else return d.x + 80;

                }
            }).y(function (d) {
                return d.y;
            }));

        actorNodes
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

    }


    eventNodes.on('mouseover', function (d) {
        showPopUp(d, data, "event")
    })
        .on('mouseout', function (d) {
            d3.select("#eventTooltip").classed("hidden", true);

        });


    rangeSliderY = d3.scaleLinear()
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

    var minorTickNumber = (rangeSliderY.domain()[1] - rangeSliderY.domain()[0]);
    g.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + midX + ", " + sliderOffset + ")")
        .call(d3.axisRight(rangeSliderY)
            .ticks(minorTickNumber, ".0f")
            .tickSize(-2))
        // .selectAll(".tick")
        // .exit()
        .classed("minor", true);

    g.append("g")
        .attr("transform", "translate(" + midX + ", " + sliderOffset + ")")
        .attr("class", "axis")
        .call(d3.axisRight(rangeSliderY)
            .ticks(10, ".0f")
            .tickSize(10, 5)
        );


    var barChart = g.append("g")
        .attr("transform", "translate(" + midX + ", " + sliderOffset + ")");

    var bars = barChart.selectAll(".bar")
        .data(yearFrequencyList)
        .enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(0, " + rangeSliderY(+d.year) + ")";
        });


    var squareWidth = 0;

    var squares = bars.selectAll(".squares")
        .data(function (d) {
            return d.eventsPerYear;
        })
        .enter()
        .append("rect")
        .attr("class", function (d) {
            return "squares " + d.label;
        })
        .attr("height", function (d) {
            return (Math.min(rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1, 6));
        })
        .attr("width", function (d) {
            squareWidth = (Math.min(rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1, 6));
            return (Math.min(rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1, 6));
        })
        .attr("x", function (d, i) {
            return (-squareWidth - (i * (squareWidth + 1) + 1));
        })
        // .attr("fill", function (d) {
        //     return ("#f1dd97")
        // })
        .on("mouseover", function (d) {
            // showToolTip(d, graph)
        }).on("mouseout", function () {
            // d3.select("#tooltip").classed("hidden", true);

        });


    yearSlider = g.append("g")
        .attr("transform", "translate(" + midX + ", " + sliderOffset + ")")
        .attr("class", "yearSlider");

    yearSlider.append("line")
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
                yearSlider.interrupt();

            })
            .on("start drag", function () {
                handle.attr("cy", rangeSliderY(rangeSliderY.invert(d3.event.y)));
                update(float2int(rangeSliderY.invert(d3.event.y) + 0.5));
            }));


    handle = yearSlider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 7)
        .attr("cy", 0);


    var collapseCheckBox = d3.select("#collapseCheckBox");
    collapseCheckBox.on("change", function (d) {
        var selected = this.checked;
        if (selected) {

            d3.selectAll(".actorObject").attr("x", function (d) {
                if (d.recursiveDepth > 1 && d.isActor) {
                    d.fx = 450 + d.treeDepth * 500;
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

function update(inputYear) {
    console.log(inputYear);
    handle
        // .transition()
        .attr("cy", rangeSliderY(inputYear));

    // yearSlider.value(Math.random() * 100)
    changeYear(inputYear);
}

function float2int(value) {
    return value | 0;
}


function showPopUp(element, data, type) {
    if (type === "actor") {

        var currentActor = util.findActorNodeByID(element.ID, data.objects);

        var xPosition = d3.event.clientX;
        var yPosition = d3.event.clientY;

        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#ID")
            .text(currentActor.fullName);

        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#birthYear")
            .text(function (d) {
                if (currentActor.baptismDate) {
                    return currentActor.baptismDate.format("MMM Do YYYY");
                }
                else return ("NA")
            });

        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#deathYear")
            .text(function (d) {
                if (currentActor.funeralDate) {
                    return currentActor.funeralDate.format("MMM Do YYYY");
                }
                else return ("NA")

            });


        d3.select("#tooltip").classed("hidden", false);
    }
    if (type === "event") {

        var xPosition = d3.event.clientX;
        var yPosition = d3.event.clientY;

        d3.select("#eventTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#eventYear")
            .text(element.eventTime.format("MMM Do YYYY"));

        d3.select("#eventTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#eventType")
            .text(function (d) {
                return element.label;
            });

        d3.select("#eventTooltip").classed("hidden", false);

    }

}

d3.select("#spinner")
    .classed("hidden", false);


var centralActorID = d3.select("#actorID").node().value;
var centralActor = actorManagement.getCentralActor(centralActorID);

var populatedActorData = actorManagement.buildNodeList(centralActor);


drawGraph(populatedActorData);

