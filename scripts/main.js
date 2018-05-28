const jsonConversion = require('./jsonConversion.js');
const actorManagement = require('./actorManagement.js');
const d3 = require('d3');
//  var ActorFinal = function (id, fullName, baptismDate, birthYear, birthPlace, deathYear, gender, occupation, firstAppearance, firstParent, secondParent, spouse, firstGodParent, secondGodParent, offSpringList) {
//     this.ID = id;
//     this.firstName = firstName;
//     this.lastName = lastName;
//     this.fullName = fullName;
//     this.baptismDate = baptismDate;
//     this.birthYear = birthYear;
//     this.birthPlace = birthPlace;
//     this.deathYear = deathYear;
//     this.gender = gender;
//     this.occupation = occupation;
//     this.firstAppearance = firstAppearance;
//     this.firstParent = firstParent;
//     this.secondParent = secondParent;
//     this.firstGodParent = firstGodParent;
//     this.secondGodParent = secondGodParent;
//     this.offSpringList = offSpringList;
//
//     this.spouse = spouse;
// };


var simulation;
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    midX = width * 9 / 10;


var lifeSpanWidth = 180;


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

    var rangeSliderMin = d3.min(eventList, function (d) {
        if (d.eventTime)
            return d.eventTime.year();
    });
    var rangeSliderMax = d3.max(eventList, function (d) {
        if (d.eventTime)
            return d.eventTime.year();
    });

    var yearFrequencyList = (createEventFrequencyList(eventList, rangeSliderMin, rangeSliderMax));


    // ORIGINAL -- GO BACK TO

    // simulation = d3.forceSimulation()
    //     .force("link", d3.forceLink().id(function (d) {
    //         return "" + d.ID;
    //     }))
    //     .force("charge", d3.forceManyBody().strength(-400))
    //     .force("center", d3.forceCenter(width / 2, height / 2))
    //     .force("distanceMin", 100);


    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.ID;
        }).distance(60).strength(function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) return 0.2;
            return 1;
        }))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));


    // graph.nodes.filter(function (d) {
    //     if (d.ID === 0) {
    //         d.fy = height / 2;
    //     }
    // });

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
            else return 1.5;
        });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("height", 300)
        .attr("x", function (d) {
            // if (d.isActor) {
            d.fx = 400 + d.treeDepth * 300;
            // }
        })
    ;


    var rectangle = node.append("rect")
        .attr("width", function (d) {
            if (d.isActor) {
                return 180;
            }
            else return 0;
        })
        .attr("height", 6)
        .attr("x", 0)
        .attr("y", 3)
        .attr('fill', 'white')
        .attr('stroke', function (d) {
            var actorObject = actorManagement.findActorNodeByID(d.ID, data.objects);
            if (actorObject && actorObject.baptismDate && actorObject.funeralDate) {
                return 'black';
            }
            else
                return 'black';
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    var text = svg.selectAll('text')
        .data(graph.nodes)
        .enter().append("svg:text")
        .style("font-size", "11px")
        .text(function (d) {
            if (d.isActor) {
                var actorData = data.objects.filter(x => x.ID === d.ID);
                return (actorData[0].fullName);
            }
            // else return d.ID;
        });

    // var labels = node.append("text")
    //     .text(function (d) {
    //         if (d.isActor) {
    //             var actorData = data.objects.filter(x => x.ID === d.ID);
    //             return (actorData[0].fullName);
    //         }
    //         // else return d.ID;
    //     })
    //     .attr('x', -15)
    //     .attr('y', 0);


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

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

    }


    node.on('mouseover', function (d) {
        node.style('stroke', function (l) {
            // debugger;
            if (l.ID === d.ID || l.ID === d.ID) {
                // console.log(this.childNodes[0]);
                return "gold";
            }
            else
                return "#eee";
        });
        link.style('stroke', function (l) {
            if (l.source.ID.includes(d.ID) || l.target.ID.includes(d.ID)) {
                return "gold";
            }
            else
                return "#eee";
        });

    });

    node.on('mouseout', function () {
        link.style('stroke', function (d) {
            if (d.tieType === actorManagement.Labels.GODPARENTHOOD_LABEL) {
                return "#eee";
            }
            else return "black";
        });

    });


    var rangeSliderY = d3.scaleLinear()
        .domain([+rangeSliderMin - 5, +rangeSliderMax + 5])
        .range([0, height - 100])
        .clamp(true);



    var barChartX = d3.scaleLinear()
        .range([0, 25])
        .domain([0, d3.max(yearFrequencyList, function (d) {
            return d.eventsPerYear.length;
        })]);


    var g = svg.append("g")
        .attr("height", height);

    g.append("g")
        .attr("transform", "translate(" + midX + ", 50)")
        .attr("class", "axis")
        .call(d3.axisRight(rangeSliderY)
            .ticks(10, ".0f")
            .tickSize(10, 5)
        );


    var barChart = g.append("g")
        .attr("transform", "translate(" + midX + ", 0)");

    var bars = barChart.selectAll(".bar")
        .data(yearFrequencyList)
        .enter()
        .append("g");

    var squares = bars.selectAll(".squares")
        .data(function (d) {
            return d.eventsPerYear
        })
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return (-10 - (i * 11));
        })
        .attr("y", function (d) {
            return rangeSliderY(+d.eventTime.year());
        })
        .attr("height", function (d) {
            return (rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1);
        })
        .attr("width", function (d) {
            return (rangeSliderY(+d.eventTime.year() + 1) - rangeSliderY(+d.eventTime.year()) - 1);
        })
        .attr("fill", function (d) {
                return ("#f1dd97")
        });





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


// getActors(4);
// getActors(42);
// getActors(480);

var centralActor = actorManagement.getCentralActor("490");


console.log(actorManagement.buildNodeList(centralActor));
drawGraph(actorManagement.data);

