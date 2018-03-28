var NAME_LABEL = "Name"
var MARRIAGE_LABEL = "Marriage"
var BAPTISM_LABEL = "Baptism"
var FUNERAL_LABEL = "Funeral"
var OFFSPRING_LABEL = "Offspring"

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


var Node = function (id, fullName, firstParent, secondParent, spouse, offSpringList) {
    this.ID = "" + id;
    this.fullName = fullName;
    this.firstParent = firstParent;
    this.secondParent = secondParent;
    this.offSpringList = offSpringList;
    this.spouse = spouse;
    console.log(this.ID)
    if (this.ID.includes("+")) {
        this.isActor = false;
    }
    else this.isActor = true;
};

var Tie = function (source, target, tieType, tieStartYear, tieEndYear) {
    this.source = source;
    this.target = target;
    this.tieType = tieType;
    this.tieStartYear = tieStartYear;
    this.tieEndYear = tieEndYear;
};

var nodeList = [];
var tieList = [];


var simulation;
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);


function getJSON(id) {
    var myActorData;
    var http = new XMLHttpRequest();
    var url = "//projectcornelia.be/source_browser/public/router.php";
    var params = "q=" + id + "&s=ALL-SOURCES&w=search-by-option";

    // TODO: now synchronous call. to be fixed
    http.open("POST", url, false);

//Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function () {//Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            myActorData = JSON.parse(http.responseText);
        }
    };
    http.send(params);
    return (myActorData);

}


function parseJSON(id, actorJSON) {
    var myActorData;
    console.log(actorJSON);

    // TODO: convert to date object

    var actorFullName = getFullNameFromJSON(actorJSON);

    var firstParent = getFirstParentFromJSON(actorJSON);
    var secondParent = getSecondParentFromJSON(actorJSON);

    // var firstGodParent = getFirstGodParentFromJSON(actorJSON);
    // var secondGodParent = getSecondGodParentFromJSON(actorJSON);
    //
    // var actorBaptismDate = getBaptismDate(actorJSON);
    // var actorBaptismPlace = getBaptismPlace(actorJSON);
    // var actorBaptismSource = getBaptismSource(actorJSON);
    //
    // var actorFuneralDate = getFuneralDate(actorJSON);

    var actorSpouse = getSpouseID(actorJSON);

    var offSpringList = getOffspringList(actorJSON);

    var centralActor = new Node(id, actorFullName, firstParent, secondParent, actorSpouse, offSpringList)

    if (firstParent || secondParent) {
        createParentsUnionNode(centralActor);
    }

    if (offSpringList || actorSpouse) {
        createCentralActorUnionNode(centralActor);
    }


    nodeList.push(centralActor);


    return myActorData;

}

function getFullNameFromJSON(json) {
    var element = checkLabelExistence(NAME_LABEL, json);
    if (!element) return null;
    var fullName = element.data[0][0].text;
    if (fullName) {
        return (fullName);
    }
}

function getFirstParentFromJSON(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var firstParentID = element.data.parents.data[0]["query-value"];
    var firstParentName = element.data.parents.data[0]["query-text"];
    if (firstParentID) {
        var thisFirstParent = new Node(firstParentID, firstParentName);
        nodeList.push(thisFirstParent);
        return (thisFirstParent);
    }
}

function getSecondParentFromJSON(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var secondParentID = element.data.parents.data[2]["query-value"];
    var secondParentName = element.data.parents.data[2]["query-text"];
    if (secondParentID) {
        var thisSecondParent = new Node(secondParentID, secondParentName);
        nodeList.push(thisSecondParent);
        return (thisSecondParent);
    }
}

function getFirstGodParentFromJSON(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var firstGodParentID = element.data.godparents.data[0]["query-text"];
    if (firstGodParentID) {
        return (firstGodParentID);
    }
}

function getSecondGodParentFromJSON(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var secondGodParentID = element.data.godparents.data[2]["query-text"];
    if (secondGodParentID) {
        return (secondGodParentID);
    }
}

function getBaptismPlace(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;

    var baptismPlace = element.value;
    if (baptismPlace) {
        return (baptismPlace);
    }
}

function getBaptismDate(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;

    var baptismDate = element.data.place.data[0].text;
    if (baptismDate) {
        return (baptismDate);
    }
}

function getBaptismSource(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;

    var baptismSource = element.data.source.data[0].text;
    if (baptismSource) {
        return (baptismSource);
    }
}

function getSpouseID(json) {
    var element = checkLabelExistence(MARRIAGE_LABEL, json);
    if (!element) return null;
    var spouseID = element.data[0].data.spouse.data[0]["query-value"];
    var spouseName = element.data[0].data.spouse.data[0]["query-text"];

    if (spouseID) {
        var thisSpouse = new Node(spouseID, spouseName);
        nodeList.push(thisSpouse);
        return (thisSpouse);
    }
}

function getFuneralDate(json) {
    var element = checkLabelExistence(FUNERAL_LABEL, json);
    if (!element) return null;

    var funeralDate = element.value;
    if (funeralDate) {
        return (funeralDate);
    }
}

function getOffspringList(json) {
    var element = checkLabelExistence(OFFSPRING_LABEL, json);
    if (!element) return null;

    var rawOffspringArray = element.data.offsprings.data;

    if (rawOffspringArray) {
        var offSpringNameList = [];
        var offSpringList = [];
        for (var i = 0; i < rawOffspringArray.length; i++) {
            if (rawOffspringArray[i]["query-type"] === "actor") {
                var thisChildID = rawOffspringArray[i]["query-value"];
                var thisChild = new Node(thisChildID);
                if (rawOffspringArray[i + 2]["query-type"] === "year") {
                    var thisChildName = rawOffspringArray[i]["query-text"];
                    thisChild.fullName = thisChildName
                }
                offSpringList.push(thisChild);
                nodeList.push(thisChild);
            }
        }
        return (offSpringList);
    }
}

function createParentsUnionNode(actor) {
    var firstParentToMarriageTie, secondParentToMarriageTie;

    var firstParentID = relativeIDToString(actor.firstParent);
    var secondParentID = relativeIDToString(actor.secondParent);

    var parentsMarriageNode = new Node(firstParentID + "+" + secondParentID);
    nodeList.push(parentsMarriageNode);

    if (firstParentID.length > 0) {
        firstParentToMarriageTie = new Tie(firstParentID, parentsMarriageNode.ID);
    }
    if (secondParentID.length > 0) {
        secondParentToMarriageTie = new Tie(secondParentID, parentsMarriageNode.ID);
    }

    var marriageToCentralActorTie = new Tie(parentsMarriageNode.ID, actor.ID);

    tieList.push(firstParentToMarriageTie, secondParentToMarriageTie, marriageToCentralActorTie);

}

function createCentralActorUnionNode(actor) {

    var actorSpouseID = relativeIDToString(actor.spouse);
    var actorMarriageNode = new Node(actor.ID + "+" + actorSpouseID);
    console.log(actorMarriageNode);
    nodeList.push(actorMarriageNode);
    var actorToMarriageTie = new Tie(actor.ID, actorMarriageNode.ID);
    tieList.push(actorToMarriageTie);

    if (actor.spouse) {
        var spouseToMarriageTie = new Tie(actor.spouse.ID, actorMarriageNode.ID);
        tieList.push(spouseToMarriageTie);
    }

    if (actor.offSpringList) {
        for (var i = 0; i < actor.offSpringList.length; i++) {
            var marriageToOffspringTie = new Tie(actorMarriageNode.ID, actor.offSpringList[i].ID);
            tieList.push(marriageToOffspringTie);
        }


    }
}

function relativeIDToString(relative) {
    if (relative)
        relativeID = relative.ID;
    else relativeID = "";
    return relativeID;

}

function checkLabelExistence(label, json) {
    var element = search(label, json);
    if (!element || !element.data) {
        return null;
    } else {
        return element;
    }
}

function search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].label === nameKey) {
            return myArray[i];
        }
    }
}

function getActors(id) {
    var myActorJSON = getJSON(id);
    var myActorObject = parseJSON(id, myActorJSON);

}

function drawGraph(nodes, links) {

    var graph = {};
    graph["nodes"] = nodes;
    graph["links"] = links;

    console.log(graph);

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            console.log(d);
            return "" + d.ID;
        }))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(width / 2, height / 2));



    // graph.nodes.filter(function (d) {
    //     if (d.type === "root") {
    //         d.fx = 100;
    //     }
    //     else if (d.type === "leaf") {
    //         d.fx = 500;
    //     }
    //
    // });

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g");

    console.log(node);


    var rectangle = node.append("rect")
        .attr("width", function (d) {
            if (d.isActor) {
                return 30;
            }
            else return 0;
        })
        .attr("height", 6)
        .attr("x", -15)
        .attr("y", -3)
        .attr("fill", function (d) {

            return color(d.group);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var labels = node.append("text")
        .text(function (d) {
            if (d.isActor)
                return d.fullName;
        })
        .attr('x', 6)
        .attr('y', 3);


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
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
            });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    // d.fx = d.x;
    // d.fy = d.y;

}

function dragged(d) {
    // d.fx = d3.event.x;
    // d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
}


// var result = post_to_url('//projectcornelia.be/source_browser/public/router.php', {q: '490', s: "ALL-SOURCES", w: "search-by-option"});
// console.log(result);

// getActors(4);
// getActors(42);
getActors(480);
// getActors("490");
drawGraph(nodeList, tieList);


