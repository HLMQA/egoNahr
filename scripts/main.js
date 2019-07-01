const jsonConversion = require('./jsonConversion.js');
const actorManagement = require('./actorManagement.js');
const util = require('./util.js');
const d3 = require('d3');


var simulation;


var svg = d3.select("svg"),
    // width = +svg._groups[0][0].clientWidth,
    width = 1000,
    // height = +svg.attr("height"),
    height = 1200,
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
    var gradientHighlighted = [];
    var color = d3.schemeCategory20;

    var godParentMarkerColor = "#c8c8c8";
    var parentMarkerColor = "#000000";
    var highlightedMarkerColor = "#FFD700";

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
            .style("fill", color);

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
        }).distance(40).strength(function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) return 0.7;
            return 2;
        }))
        .force("charge", d3.forceManyBody().strength(-2000).distanceMin(0).distanceMax(750))
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
            return "url(#gradient" + i + ")";
        })
        .style("stroke-width", function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return 1;
            }
            else return 2;
        }).attr("marker-end", function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return marker(godParentMarkerColor);
            }
            else return marker(parentMarkerColor);
        });


    for (var i = 0; i < graph.links.length; i++) {
        gradient[i] = d3.select("svg").append("defs")
            .append("linearGradient")
            .attr("id", "gradient" + i)
            .attr("spreadMethod", "pad");

        gradient[i].append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#f7f7f7")
            .attr("stop-opacity", 0.5);

        gradient[i].append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function () {
                if (graph.links[i].tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                    return godParentMarkerColor
                }
                else
                    return parentMarkerColor;
            })
            .attr("stop-opacity", 1);


        gradientHighlighted[i] = d3.select("svg").append("defs")
            .append("linearGradient")
            .attr("id", "highlighted" + i)
            .attr("spreadMethod", "pad");

        gradientHighlighted[i].append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ffffff")
            .attr("stop-opacity", 1);

        gradientHighlighted[i].append("stop")
            .attr("offset", "100%")
            .attr("stop-color", highlightedMarkerColor)
            .attr("stop-opacity", 1);
    }



    var actorNodes = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "actorObject")
        .attr("height", 300);

    var actorHaloRadius = 18,
        marriageHaloRadius = 8;

    var actorCircles = actorNodes
        .append("circle")
        .attr("class", "halo")
        .attr("r", function (d) {
            if (d.isActor) {
                return actorHaloRadius;
            }
            else return marriageHaloRadius;
        })
        .each(function (d) {
            d.circle = this;
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


    var text = svg.selectAll('text')
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

            actorNodes.style('stroke', function (l) {
                if (l.ID === d.ID || l.ID === d.ID) {
                    return "red";
                }
                else
                    return "blue";
            });

            link.style('stroke', function (l, i) {
                var actorObject = util.findActorNodeByID(d.ID, data.objects);

                if (l.source.ID.split("+").includes(d.ID) || l.target.ID.split("+").includes(d.ID)) {
                    return "url(#highlighted" + l.index+ ")";
                }
                if (!actorObject.firstParent) {
                    var firstParentID = ""
                } else var firstParentID = actorObject.firstParent.ID;
                if (!actorObject.secondParent) {
                    var secondParentID = ""
                } else var secondParentID = actorObject.secondParent.ID;

                if ((l.target.ID === firstParentID + "+" + secondParentID) || (l.target.ID === secondParentID + "+" + firstParentID)) {
                    return "url(#highlighted" + l.index + ")";
                }
                else
                    return "#eee";
            }).attr("marker-end", function (l) {

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
                else
                    return marker("#eee");
            });
            showPopUp(d, data, "actor");

        });

    text.on('mouseout', function () {
        link.style('stroke', function (d, i) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "url(#gradient" + i + ")";
            }
            else return "url(#gradient" + i + ")";
        }).attr("marker-end", function (d) {
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

        link.each(setPath);

    }

    function setPath(d, i) {
        var radius = 10;

        var sourceX = d.source.x;
        var sourceY = d.source.y;
        var targetX = d.target.x;
        var targetY = d.target.y;

        var theta = Math.atan((targetX - sourceX) / (targetY - sourceY));
        var phi = Math.atan((targetY - sourceY) / (targetX - sourceX));

        var sinTheta = d.source.circle.getAttribute("r") * Math.sin(theta);
        var cosTheta = d.source.circle.getAttribute("r") * Math.cos(theta);
        var sinPhi = d.target.circle.getAttribute("r") * Math.sin(phi);
        var cosPhi = d.target.circle.getAttribute("r") * Math.cos(phi);

        // Set the position of the link's end point at the source node
        // such that it is on the edge closest to the target node
        if (d.target.y > d.source.y) {
            sourceX = sourceX + sinTheta;
            sourceY = sourceY + cosTheta;
        }
        else {
            sourceX = sourceX - sinTheta;
            sourceY = sourceY - cosTheta;
        }

        // Set the position of the link's end point at the target node
        // such that it is on the edge closest to the source node
        if (d.source.x > d.target.x) {
            targetX = targetX + cosPhi;
            targetY = targetY + sinPhi;
        }
        else {
            targetX = targetX - cosPhi;
            targetY = targetY - sinPhi;
        }

        d3.select(this).attr("x1", sourceX)
            .attr("y1", sourceY)
            .attr("x2", targetX)
            .attr("y2", targetY);

        var linkVector = new Vector2(targetX - sourceX, targetY - sourceY).getUnitVector();
        var gradientVector = linkVector.scale(0.5);


        gradient[i]
            .attr("x1", 0.5 - gradientVector.X)
            .attr("y1", 0.5 - gradientVector.Y)
            .attr("x2", 0.5 + gradientVector.X)
            .attr("y2", 0.5 + gradientVector.Y);

        gradientHighlighted[i]
            .attr("x1", 0.5 - gradientVector.X)
            .attr("y1", 0.5 - gradientVector.Y)
            .attr("x2", 0.5 + gradientVector.X)
            .attr("y2", 0.5 + gradientVector.Y);


    }


    underlines.on('mouseover', function (d) {
        //     debugger;
        //     actorNodes.style('stroke', function (l) {
        //         if (l.ID === d.ID || l.ID === d.ID) {
        //             return "red";
        //         }
        //         else
        //             return "blue";
        //     });
        //
        //     link.style('stroke', function (l) {
        //         var actorObject = util.findActorNodeByID(d.ID, data.objects);
        //         if (l.source.ID.includes(d.ID) || l.target.ID.includes(d.ID)) {
        //             return highlightedMarkerColor;
        //         }
        //         if (!actorObject.firstParent) {
        //             var firstParentID = ""
        //         } else var firstParentID = actorObject.firstParent.ID;
        //         if (!actorObject.secondParent) {
        //             var secondParentID = ""
        //         } else var secondParentID = actorObject.secondParent.ID;
        //
        //
        //         if ((l.target.ID === firstParentID + "+" + secondParentID) || (l.target.ID === secondParentID + "+" + firstParentID)) {
        //             return highlightedMarkerColor;
        //         }
        //         else
        //             return "#eee";
        //     }).attr("marker-end", marker(highlightedMarkerColor));
        //     showPopUp(d, data, "actor");
        // });
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

    centralActorID = this.value;
    centralActor = actorManagement.getCentralActor(centralActorID);

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

