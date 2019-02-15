var moment = require('../../node_modules/moment/moment.js');
const _ = require("underscore");


var exports = module.exports = {};

var NAME_LABEL = "Name";
var MARRIAGE_LABEL = "Marriage";
var BAPTISM_LABEL = "Baptism";
var FUNERAL_LABEL = "Funeral";
var OFFSPRING_LABEL = "Offspring";
var BIRTH_LABEL = "Baptism";
var DEATH_LABEL = "Funeral";
var GODPARENTHOOD_LABEL = "Godparent";

var DATE_FORMAT = "D MMMM YYYY";

var Node = function (id, fullName, firstParent, secondParent, spouse, firstGodParent, secondGodParent, offSpringList, baptismDate, funeralDate, eventList, jsonOrigin) {
    this.ID = "" + id;
    this.fullName = fullName;
    this.firstParent = firstParent;
    this.secondParent = secondParent;
    this.offSpringList = offSpringList;
    this.spouse = spouse;

    this.firstGodParent = firstGodParent;
    this.secondGodParent = secondGodParent;

    this.baptismDate = baptismDate;
    this.funeralDate = funeralDate;

    if (this.ID.includes("+")) {
        this.isActor = false;
    }
    else this.isActor = true;
    if (this.funeralDate && this.baptismDate)
        this.lifeSpan = this.funeralDate.diff(this.baptismDate, 'years');

    if (eventList)
        this.eventList = eventList;
    else
        this.eventList = [];
    if (!jsonOrigin)
        this.jsonOrigin = false;
    else
        this.jsonOrigin = jsonOrigin
};

var Tie = function (source, target, tieType, tieStartYear, tieEndYear) {
    this.source = source;
    this.target = target;
    this.tieType = tieType;
    this.tieStartYear = tieStartYear;
    this.tieEndYear = tieEndYear;
};

var lifeEvent = function (source, eventTime, label, target) {
    this.source = source;
    this.eventTime = eventTime;
    this.label = label;
    this.target = target;
}


var nodeList = [];
var tieList = [];


function getJSON(id) {
    var myActorData;
    var http = new XMLHttpRequest();
    var url = "https://projectcornelia.be/source_browser/public/router.php";
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
    var actorEventList = [];

    var actorFullName = getFullNameFromJSON(actorJSON, id);
    if (!actorFullName) {
        return null;
    }

    var firstParent = getFirstParentFromJSON(actorJSON, id);
    var secondParent = getSecondParentFromJSON(actorJSON, id);

    // I m not sure this case ever happens, but making sure the data is consistent in case it does
    if (!firstParent && secondParent) {
        firstParent = secondParent;
        secondParent = null;
    }

    var firstGodParent = getFirstGodParentFromJSON(actorJSON, id);
    var secondGodParent = getSecondGodParentFromJSON(actorJSON, id);

    // I m not sure this case ever happens, but making sure the data is consistent in case it does
    if (!firstGodParent && secondGodParent) {
        firstGodParent = secondGodParent;
        secondGodParent = null;
    }

    var actorBaptismDate = getBaptismDate(actorJSON, id);
    // var actorBaptismPlace = getBaptismPlace(actorJSON);
    // var actorBaptismSource = getBaptismSource(actorJSON);
    //
    var actorFuneralDate = getFuneralDate(actorJSON, id);

    var actorSpouse = getSpouseID(actorJSON, id);

    var offSpringList = getOffspringList(actorJSON, id);


    if (actorBaptismDate)
        pushEventToList(new lifeEvent(id, actorBaptismDate, BIRTH_LABEL, id), actorEventList);
    if (actorFuneralDate)
        pushEventToList(new lifeEvent(id, actorFuneralDate, DEATH_LABEL, id), actorEventList);

    var centralActor = new Node(id, actorFullName, firstParent, secondParent, actorSpouse, firstGodParent, secondGodParent, offSpringList, actorBaptismDate, actorFuneralDate, actorEventList, true);

    // reciprocateRelationships(centralActor);

    // if (firstParent || secondParent) {
    //     createParentsUnionNode(centralActor, nodeList, tieList);
    // }
    //
    // if (offSpringList || actorSpouse) {
    //     createCentralActorUnionNode(centralActor, nodeList, tieList);
    // }

    pushActorToList(centralActor, nodeList);


    return centralActor;

}

function reciprocateRelationships(actor) {
    if (actor.spouse) {
        actor.spouse.spouse = actor;
    }
    if (actor.firstParent) {
        if (!actor.firstParent.offSpringList)
            actor.firstParent.offSpringList = [];
        actor.firstParent.offSpringList.push(actor);
    }
    if (actor.secondParent) {
        if (!actor.secondParent.offSpringList)
            actor.secondParent.offSpringList = [];
        actor.secondParent.offSpringList.push(actor);
    }

    // if (actor.offSpringList[0]) {
    //     for (var i = 0; i < offSpringList.length; i++) {
    //         if (!actor.offSpringList[i].firstParent) {
    //             actor.offSpringList[i].firstParent = actor;
    //         }
    //         else if (actor.offSpringList[i].firstParent && !actor.offSpringList[i].secondParent && (actor.offSpringList[i].firstParent.ID != actor.ID)) {
    //             actor.offSpringList[i].secondParent = actor;
    //         }
    //     }
    // }

}

function getFullNameFromJSON(json) {
    var element = checkLabelExistence(NAME_LABEL, json);
    if (!element || !element.data || !element.data[0] || !element.data[0][0]) {
        return null;
    }

    var fullName = element.data[0][0].text;
    if (fullName) {
        return (fullName);
    }
}

function getFirstParentFromJSON(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var firstParentID = element.data.parents.data[0]["query-value"];
    var firstParentName = element.data.parents.data[0]["query-text"];
    var firstParentEvent = moment(element.value, DATE_FORMAT, true);

    if (firstParentID) {
        var thisFirstParent = new Node(firstParentID, firstParentName);
        thisFirstParent = pushActorToList(thisFirstParent, nodeList);
        pushEventToList(new lifeEvent(thisFirstParent.ID, firstParentEvent, OFFSPRING_LABEL, id), thisFirstParent.eventList);
        return (thisFirstParent);
    }
}

function getSecondParentFromJSON(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var secondParentID = element.data.parents.data[2]["query-value"];
    var secondParentName = element.data.parents.data[2]["query-text"];
    var secondParentEvent = moment(element.value, DATE_FORMAT, true);
    if (secondParentID) {
        var thisSecondParent = new Node(secondParentID, secondParentName);
        thisSecondParent = pushActorToList(thisSecondParent, nodeList);
        pushEventToList(new lifeEvent(thisSecondParent.ID, secondParentEvent, OFFSPRING_LABEL, id), thisSecondParent.eventList);
        return (thisSecondParent);
    }
}

function getFirstGodParentFromJSON(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var firstGodParentID = element.data.godparents.data[0]["query-value"];
    var firstGodParentName = element.data.godparents.data[0]["query-text"];
    var firstGodParentEvent = moment(element.value, DATE_FORMAT, true);
    if (firstGodParentID) {
        var thisFirstGodParent = new Node(firstGodParentID, firstGodParentName);

        thisFirstGodParent = pushActorToList(thisFirstGodParent, nodeList);
        pushEventToList(new lifeEvent(thisFirstGodParent.ID, firstGodParentEvent, GODPARENTHOOD_LABEL, id), thisFirstGodParent.eventList);

        return (thisFirstGodParent);
    }
}

function getSecondGodParentFromJSON(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var secondGodParentID = element.data.godparents.data[2]["query-value"];
    var secondGodParentName = element.data.godparents.data[2]["query-text"];
    var secondGodParentEvent = moment(element.value, DATE_FORMAT, true);
    if (secondGodParentID) {
        var thisSecondGodParent = new Node(secondGodParentID, secondGodParentName);
        thisSecondGodParent = pushActorToList(thisSecondGodParent, nodeList);
        pushEventToList(new lifeEvent(thisSecondGodParent.ID, secondGodParentEvent, GODPARENTHOOD_LABEL, id), thisSecondGodParent.eventList);

        return (thisSecondGodParent);
    }
}

function getBaptismPlace(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;

    var baptismPlace = element.value;
    if (baptismPlace) {
        return (baptismPlace);
    }
}

function getBaptismDate(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;

    var baptismDate = element.value;
    if (baptismDate) {
        var dateObject = moment(baptismDate, DATE_FORMAT, true);
        // Date.parse(baptismDate);
        if (dateObject)
            return (dateObject);
    }
}

function getBaptismSource(json, id) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;

    var baptismSource = element.data.source.data[0].text;
    if (baptismSource) {
        return (baptismSource);
    }
}

function getSpouseID(json, id) {
    var element = checkLabelExistence(MARRIAGE_LABEL, json);
    if (!element) return null;
    var spouseID = element.data[0].data.spouse.data[0]["query-value"];
    var spouseName = element.data[0].data.spouse.data[0]["query-text"];

    if (spouseID) {
        var thisSpouse = new Node(spouseID, spouseName);
        pushActorToList(thisSpouse, nodeList);
        return (thisSpouse);
    }
}

function getFuneralDate(json, id) {
    var element = checkLabelExistence(FUNERAL_LABEL, json);
    if (!element) return null;

    var funeralDate = element.value;
    if (funeralDate) {
        var dateObject = moment(funeralDate, DATE_FORMAT, true);
        if (dateObject)
            return (dateObject);
    }
}

function getOffspringList(json, id) {
    var element = checkLabelExistence(OFFSPRING_LABEL, json);
    if (!element) return null;
    var rawOffspringArray = element.data.offsprings.data;

    if (rawOffspringArray) {
        var offSpringList = [];
        for (var i = 0; i < rawOffspringArray.length; i++) {
            if (rawOffspringArray[i]["query-type"] === "actor") {
                var thisChildID = rawOffspringArray[i]["query-value"];
                var thisChild = new Node(thisChildID);

                if (rawOffspringArray[i + 2]["query-type"] === "year") {
                    var thisChildName = rawOffspringArray[i]["query-text"];
                    thisChild.fullName = thisChildName
                }
                // thisChild.eventList = pushEventToList(new lifeEvent("test", OFFSPRING_LABEL, id), thisChild.eventList);


                offSpringList.push(thisChild);

                thisChild = pushActorToList(thisChild, nodeList);

            }
        }
        return (offSpringList);
    }
}


function getActorData(id) {
    var myActorJSON = exports.getJSON(id);
    var myActorObject = parseJSON(id, myActorJSON);

    // console.log(myActorObject)
    return myActorObject;
}

function checkLabelExistence(label, json) {
    var element = exports.search(label, json);
    if (!element || !element.data) {
        return null;
    } else {
        return element;
    }
}

function search(nameKey, myArray) {
    if (!myArray)
        return null;
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].label === nameKey) {
            return myArray[i];
        }
    }
    return null;
}


function pushActorToList(actor, listToPushTo) {
    // var isActorInList = listToPushTo.filter(function (e) {
    //     return e.ID === actor.ID
    // });
    var index = -1;

    index = listToPushTo.map(function (e) {
        return e.ID;
    }).indexOf(actor.ID);


    if (index === -1) {
        listToPushTo.push(actor);
        return actor;
    }
    else {
        return listToPushTo[index];
    }
}

function pushEventToList(lifeEvent, listToPushTo) {
    var index = -1;

    for (var i = 0; i < listToPushTo.length; i++) {
        if (_.isEqual(lifeEvent, listToPushTo[i])) {
            index = i;
            break;
        }
    }

    if (index < 0) {
        listToPushTo.push(lifeEvent);
        return listToPushTo;
    }

    else {
        return listToPushTo;
    }
}


function relativeIDToString(relative) {
    var relativeID = null;
    if (relative)
        relativeID = relative.ID;
    else relativeID = "";
    return relativeID;
}


function createParentsUnionNode(actor, nodes, ties) {
    var firstParentToMarriageTie, secondParentToMarriageTie;

    if (actor.firstParent || actor.secondParent) {

        var firstParentID = relativeIDToString(actor.firstParent);
        var secondParentID = relativeIDToString(actor.secondParent);

        var parentsMarriageNode = new Node(firstParentID + "+" + secondParentID);
        pushActorToList(parentsMarriageNode, nodes);

        // if (firstParentID.length > 0) {
        //     firstParentToMarriageTie = new Tie(firstParentID, parentsMarriageNode.ID);
        // }
        // if (secondParentID.length > 0) {
        //     secondParentToMarriageTie = new Tie(secondParentID, parentsMarriageNode.ID);
        // }

        var marriageToCentralActorTie = new Tie(parentsMarriageNode.ID, actor.ID);
    }
    // ties.push(firstParentToMarriageTie, secondParentToMarriageTie, marriageToCentralActorTie);
}


function createCentralActorUnionNode(actor) {

    var actorSpouseID = relativeIDToString(actor.spouse);
    var actorMarriageNode = new Node(actor.ID + "+" + actorSpouseID);
    pushActorToList(actorMarriageNode, nodeList);
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


function isEquivalent(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
}

exports.search = search;
exports.checkLabelExistence = checkLabelExistence;
exports.getActorData = getActorData;
exports.createParentsUnionNode = createParentsUnionNode;
exports.pushEventToList = pushEventToList;
exports.getJSON = getJSON;
exports.Node = Node;
exports.Tie = Tie;
exports.lifeEvent = lifeEvent;
exports.nodeList = nodeList;
exports.tieList = tieList;
exports.isEquivalent = isEquivalent;

// export {exports};