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


var lifeSpanWidth = 5;
var eventList;


var yearFrequency = function (year, frequency) {
    this.year = year;
    this.eventsPerYear = [];
    this.frequency = frequency;
}


function drawGraph(data) {

    var gradient = [];


    // var gradient = d3.select("svg").append("defs")
    //     .append("linearGradient")
    //     .attr("id", "gradient")
    //     .attr("spreadMethod", "pad");
    // //start color white
    // gradient.append("stop")
    //     .attr("offset", "0%")
    //     .attr("stop-color", "#f2f2f2")
    //     .attr("stop-opacity", 1);
    // //end color steel blue
    // gradient.append("stop")
    //     .attr("offset", "100%")
    //     .attr("stop-color", "#404040")
    //     .attr("stop-opacity", 1);


    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

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
        }).distance(60).strength(function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) return 0.7;
            return 2;
        }))
        .force("charge", d3.forceManyBody().strength(-2000).distanceMin(0).distanceMax(550))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collisionForce", collisionForce);


    var link = svg.append("g")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("class", function (d) {
            return ("links " + d.tieType);
        })
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        })
        .style("stroke", function (d, i) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "#eee";
            }
            else return "url(#gradient" + i + ")";
        })
        .style("stroke-width", function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return 1;
            }
            else return 2;
        }).attr("marker-end", "url(#end)");

    for (var i = 0; i < graph.links.length; i++) {
        gradient[i] = d3.select("svg").append("defs")
            .append("linearGradient")
            .attr("id", "gradient" + i)
            .attr("spreadMethod", "pad");

        gradient[i].append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#f2f2f2")
            .attr("stop-opacity", 1);

        gradient[i].append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#404040")
            .attr("stop-opacity", 1);

    }


    var actorNodes = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "actorObject")
        .attr("height", 300);
    // .attr("x", function (d) {
    // d.fx = 1 * width / 2 - lifeSpanWidth / 2 + d.treeDepth * width / 4;
    // });


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


    var text = svg.selectAll('text')
        .data(graph.nodes)
        .enter().append("svg:text")
        .attr("class", function (d) {
            if (d.ID === centralActorID) {
                return ("label centralActor")
            }
            else return ("label")
        })
        .style("font-size", "11px")
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
            actorNodes.style('stroke', function (l) {
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
            showPopUp(d, data, "actor");

        });

    text.on('mouseout', function () {
        link.style('stroke', function (d, i) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "#eee";
            }
            else return "url(#gradient" + i + ")";
        });

        d3.select("#tooltip").classed("hidden", true);
    });


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);


    var Vector2 = function (x, y) {
        this.magnitude = Math.sqrt(x * x + y * y);
        this.X = x;
        this.Y = y;
    };

    Vector2.prototype.perpendicularClockwise = function () {
        return new Vector2(-this.Y, this.X);
    };

    Vector2.prototype.perpendicularCounterClockwise = function () {
        return new Vector2(this.Y, -this.X);
    };

    Vector2.prototype.getUnitVector = function () {
        return new Vector2(this.X / this.magnitude, this.Y / this.magnitude);
    };

    Vector2.prototype.scale = function (ratio) {
        return new Vector2(ratio * this.X, ratio * this.Y);
    };

    function ticked() {

        text.attr("x", function (d) {
            return d.x;
        })
            .attr("y", function (d) {
                return d.y;
            });

        actorNodes
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        link
            .attr("x1", function (d) {
                if (d.source.isActor) {
                    return d.source.x;
                }
                else return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {

                if (d.target.isActor) {
                    return d.target.x;
                }
                else return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        d3.selectAll(".links")
            .attr("d", function (d, i) {

                var radius = 10;

                var linkVector = new Vector2(d.target.x - d.source.x, d.target.y - d.source.y).getUnitVector();
                var gradientVector = linkVector.scale(0.5);

                gradient[i]
                    .attr("x1", 0.5 - gradientVector.X)
                    .attr("y1", 0.5 - gradientVector.Y)
                    .attr("x2", 0.5 + gradientVector.X)
                    .attr("y2", 0.5 + gradientVector.Y);

            });


    }


    underlines.on('mouseover', function (d) {
        actorNodes.style('stroke', function (l) {
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
        showPopUp(d, data, "actor");
    });

    underlines.on('mouseout', function () {
        link.style('stroke', function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "#eee";
            }
            else return "black";
        });
        d3.select("#tooltip").classed("hidden", true);

    });


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

        // d3.select("#tooltip")
        //     .style("left", xPosition + "px")
        //     .style("top", yPosition + "px")
        //     .select("#occupation")
        //     .text(currentActor.occupation);

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

// getActors(4);
// getActors(42);
// getActors(480);
// getActors(16);


var centralActorID = "493";
var centralActor = actorManagement.getCentralActor(centralActorID);

var populatedActorData = actorManagement.buildNodeList(centralActor);
console.log(populatedActorData);
drawGraph(populatedActorData);

