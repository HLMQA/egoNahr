"use strict";

var jsonConversion = require('./jsonConversion.js');

var CENTRAL_DEPTH_LEVEL = 0;

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
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

function getCentralActor(id) {
    var thisChild = {},
        thisGrandChild = {};
    var centralActor = jsonConversion.getActorData(id);
    if (centralActor.offSpringList) {
        for (var i = 0; i < centralActor.offSpringList.length; i++) {
            thisChild = jsonConversion.getActorData(centralActor.offSpringList[i].ID);

            if (thisChild.offSpringList) {
                for (var j = 0; j < thisChild.offSpringList.length; j++) {
                    thisGrandChild = jsonConversion.getActorData(thisChild.offSpringList[j].ID);
                    assignOriginParentNodeToChild(thisGrandChild, thisChild);
                    thisChild.offSpringList[j] = thisGrandChild;
                }
            }
            assignOriginParentNodeToChild(thisChild, centralActor);
            centralActor.offSpringList[i] = thisChild;
        }
    }

    console.log(centralActor);
}

function assignOriginParentNodeToChild(actor, originParent) {

    if (actor.firstParent.ID = originParent.ID) {
        actor.firstParent = originParent;
    } else if (actor.secondParent.ID = originParent.ID) {
        actor.secondParent = originParent;
    }
}

function drawGraph(nodes, links) {

    var graph = {};
    graph["nodes"] = nodes;
    graph["links"] = links;

    simulation = d3.forceSimulation().force("link", d3.forceLink().id(function (d) {
        return "" + d.ID;
    })).force("charge", d3.forceManyBody().strength(-250)).force("center", d3.forceCenter(width / 2, height / 2));

    // graph.nodes.filter(function (d) {
    //     if (d.type === "root") {
    //         d.fx = 100;
    //     }
    //     else if (d.type === "leaf") {
    //         d.fx = 500;
    //     }
    //
    // });

    var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line");

    var node = svg.append("g").attr("class", "nodes").selectAll("g").data(graph.nodes).enter().append("g");

    var rectangle = node.append("rect").attr("width", function (d) {
        if (d.isActor) {
            return 60;
        } else return 0;
    }).attr("height", 6).attr("x", -15).attr("y", -3).attr('fill', 'white').attr('stroke', 'black').call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    var labels = node.append("text").text(function (d) {
        if (d.isActor) return d.fullName;
    }).attr('x', -10).attr('y', -10);

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    function ticked() {
        link.attr("x1", function (d) {
            return d.source.x;
        }).attr("y1", function (d) {
            return d.source.y;
        }).attr("x2", function (d) {
            return d.target.x;
        }).attr("y2", function (d) {
            return d.target.y;
        });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }
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

function traverseGraph(actor) {
    console.log(actor);

    if (actor.offSpringList) {
        for (var i = 0; i < actor.offSpringList.length; i++) {
            getActors(actor.offSpringList[i].ID);
            if (actor.offSpringList[i].offSpringList) {
                for (var j = 0; j < actor.offSpringList[i].offSpringList[j]; j++) {
                    actor.offSpringList[i].offSpringList[j].depth = CENTRAL_DEPTH_LEVEL - 2;
                }
            }
            actor.offSpringList[i].depth = CENTRAL_DEPTH_LEVEL - 1;

            // console.log(getActors(actor.offSpringList[i].ID));
        }
    }
    actor.depth = CENTRAL_DEPTH_LEVEL;

    if (actor.firstParent) {
        // getActors(actor.firstParent.ID);
    }
}

function checkNode(a) {

    if (a.offSpringList) {
        // checkNode(a.offSpringList)
    }
    a.traversed = true;
}

// getActors(4);
// getActors(42);
// getActors(480);

var centralActor = getCentralActor("490");

// traverseGraph(centralActor);


console.log(jsonConversion.nodeList);
drawGraph(jsonConversion.nodeList, jsonConversion.tieList);
//# sourceMappingURL=main.js.map