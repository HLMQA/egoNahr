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




var Actor = function (id, fullName, firstParent, secondParent, spouse, offSpringList) {
    this.ID = id;
    this.fullName = fullName;
    this.firstParent = firstParent;
    this.secondParent = secondParent;
    this.offSpringList = offSpringList;

    this.spouse = spouse;
};

var Tie = function (actorID1, tieType, actorID2, tieStartYear, tieEndYear) {
    this.actorID1 = actorID1;
    this.actorID2 = actorID2;
    this.tieType = tieType;
    this.tieStartYear = tieStartYear;
    this.tieEndYear = tieEndYear;
};

var actorList = [];


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

    var centralActor = new Actor(id, actorFullName, firstParent, secondParent, actorSpouse, offSpringList)

    if (firstParent || secondParent) {
        createParentTies(centralActor);
    }

    actorList.push(centralActor);

    console.log(actorList);

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
    var firstParentID = parseInt(element.data.parents.data[0]["query-value"]);
    var firstParentName = element.data.parents.data[0]["query-text"];
    if (firstParentID) {
        var thisFirstParent = new Actor(firstParentID, firstParentName);
        actorList.push(thisFirstParent);
        return (thisFirstParent);
    }
}
function getSecondParentFromJSON(json) {
    var element = checkLabelExistence(BAPTISM_LABEL, json);
    if (!element) return null;
    var secondParentID = parseInt(element.data.parents.data[2]["query-value"]);
    var secondParentName = element.data.parents.data[2]["query-text"];
    if (secondParentID) {
        var thisSecondParent = new Actor(secondParentID, secondParentName);
        actorList.push(thisSecondParent);
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
    var spouseID = parseInt(element.data[0].data.spouse.data[0]["query-value"]);
    var spouseName = element.data[0].data.spouse.data[0]["query-text"];

    if (spouseID) {
        var thisSpouse = new Actor(spouseID, spouseName);
        actorList.push(thisSpouse);
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
                var thisChildID = parseInt(rawOffspringArray[i]["query-value"]);
                var thisChild = new Actor(thisChildID);
                if (rawOffspringArray[i + 2]["query-type"] === "year") {
                    var thisChildName = rawOffspringArray[i]["query-text"];
                    thisChild.fullName = thisChildName
                }
                offSpringList.push(thisChild);
                actorList.push(thisChild);
            }
        }
        return (offSpringList);
    }
}

function createParentTies(actor) {
    console.log(actor)
    return null;
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


// var result = post_to_url('//projectcornelia.be/source_browser/public/router.php', {q: '490', s: "ALL-SOURCES", w: "search-by-option"});
// console.log(result);

// getActors(4);
// getActors(2);
// getActors(42);
getActors(490);
// getActors(480);


// function drawGraph(){}

