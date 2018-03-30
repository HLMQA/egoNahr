var NAME_LABEL = "Name";
var MARRIAGE_LABEL = "Marriage";
var BAPTISM_LABEL = "Baptism";
var FUNERAL_LABEL = "Funeral";
var OFFSPRING_LABEL = "Offspring";

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


var Node = function (id, fullName, firstParent, secondParent, spouse, offSpringList) {
    this.ID = "" + id;
    this.fullName = fullName;
    this.firstParent = firstParent;
    this.secondParent = secondParent;
    this.offSpringList = offSpringList;
    this.spouse = spouse;
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


    pushActorToList(centralActor);


    return centralActor;

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
        pushActorToList(thisFirstParent);
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
        pushActorToList(thisSecondParent);
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
        pushActorToList(thisSpouse);
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
                pushActorToList(thisChild);
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
    pushActorToList(parentsMarriageNode);

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
    pushActorToList(actorMarriageNode);
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

function pushActorToList(actor) {
    var isActorInList = nodeList.filter(function (e) {
        return e.ID === actor.ID
    });
    if (isActorInList.length === 0) {

        nodeList.push(actor);
    }
    else {
        return;
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

function getCentralActor(id) {
    var thisChild = {},
        thisGrandChild = {};
    var centralActor = getActorData(id);
    if (centralActor.offSpringList) {
        for (var i = 0; i < centralActor.offSpringList.length; i++) {
            thisChild = getActorData(centralActor.offSpringList[i].ID);

            if (thisChild.offSpringList) {
                for (var j = 0; j < thisChild.offSpringList.length; j++) {
                    thisGrandChild = getActorData(thisChild.offSpringList[j].ID);
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
    }
    else if (actor.secondParent.ID = originParent.ID) {
        actor.secondParent = originParent;
    }

}


function getActorData(id) {
    var myActorJSON = getJSON(id);
    var myActorObject = parseJSON(id, myActorJSON);

    return myActorObject;
}

function drawGraph(nodes, links) {

    var graph = {};
    graph["nodes"] = nodes;
    graph["links"] = links;

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
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


    var rectangle = node.append("rect")
        .attr("width", function (d) {
            if (d.isActor) {
                return 60;
            }
            else return 0;
        })
        .attr("height", 6)
        .attr("x", -15)
        .attr("y", -3)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var labels = node.append("text")
        .text(function (d) {
            if (d.isActor)
                return d.fullName;
        })
        .attr('x', -10)
        .attr('y', -10);


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
                for (var j = 0; j < actor.offSpringList[i].offSpringList[j]; j++)
                    (actor.offSpringList[i].offSpringList[j].depth = CENTRAL_DEPTH_LEVEL - 2);
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


console.log(nodeList);
drawGraph(nodeList, tieList);

