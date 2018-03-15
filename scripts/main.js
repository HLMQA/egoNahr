var actor = function (id, fullName, baptismDate, birthYear, birthPlace, deathYear, gender, occupation, firstAppearance, firstParentID, secondParentID, spouseID, firstGodParentID, secondGodParentID) {
    this.ID = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = fullName;
    this.baptismDate = baptismDate;
    this.birthYear = birthYear;
    this.birthPlace = birthPlace;
    this.deathYear = deathYear;
    this.gender = gender;
    this.occupation = occupation;
    this.firstAppearance = firstAppearance;
    this.firstParentID = firstParentID;
    this.secondParentID = secondParentID;
    this.firstGodParentID = firstGodParentID;
    this.secondGodParentID = secondGodParentID;

    this.spouseID = spouseID;
};


var tie = function (actorID1, tieType, actorID2, tieStartYear, tieEndYear) {
    this.actorID1 = actorID1;
    this.actorID2 = actorID2;
    this.tieType = tieType;
    this.tieStartYear = tieStartYear;
    this.tieEndYear = tieEndYear;
};


function getJSON(id) {
    var myActorData;
    var http = new XMLHttpRequest();
    var url = "//projectcornelia.be/source_browser/public/router.php";
    var params = "q=" + id + "&s=ALL-SOURCES&w=search-by-option";

    // TODO: now synchronous call. to be changed to async
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
    // TODO: Functions for JSON parsing


    var actorFullName = getFullNameFromJSON(actorJSON);

    var firstParentID = getFirstParentFromJSON(actorJSON);
    var secondParentID = getSecondParentFromJSON(actorJSON);

    var firstGodParentID = getFirstGodParentFromJSON(actorJSON);
    var secondGodParentID = getSecondGodParentFromJSON(actorJSON);

    var actorBaptismDate = getBaptismDate(actorJSON);
    var actorBaptismPlace = getBaptismPlace(actorJSON);
    var actorBaptismSource = getBaptismSource(actorJSON);

    var actorSpouseID = getSpouseID(actorJSON);
    // var offspringList = getOffspringList(actorJSON);

    console.log(actorFullName, actorBaptismDate, firstParentID, secondParentID,
        firstGodParentID, secondGodParentID,
        actorBaptismPlace, actorBaptismSource,actorSpouseID)

    // myActorData = new actor(id, )


    return myActorData;

}

function getFullNameFromJSON(json) {
    var fullName = json[0].data[0][0].text;
    if (fullName) {
        return (fullName);
    }
}

function getFirstParentFromJSON(json) {
    var firstParentID = json[2].data.parents.data[0]["query-value"];
    if (firstParentID) {
        return (firstParentID);
    }
}

function getSecondParentFromJSON(json) {
    var secondParentID = json[2].data.parents.data[2]["query-value"];
    if (secondParentID) {
        return (secondParentID);
    }
}


function getFirstGodParentFromJSON(json) {
    var firstGodParentID = json[2].data.godparents.data[0]["query-value"];
    if (firstGodParentID) {
        return (firstGodParentID);
    }
}

function getSecondGodParentFromJSON(json) {
    var secondGodParentID = json[2].data.godparents.data[2]["query-value"];
    if (secondGodParentID) {
        return (secondGodParentID);
    }
}

function getBaptismPlace(json){
    var baptismPlace = json[2].value;
    if (baptismPlace) {
        return (baptismPlace);
    }
}
function getBaptismDate(json){
    var baptismDate = json[2].data.place.data[0].text;
    if (baptismDate) {
        return (baptismDate);
    }
}
function getBaptismSource(json){
    var baptismSource = json[2].data.source.data[0].text;
    if (baptismSource) {
        return (baptismSource);
    }
}

function getSpouseID(json){
    var spouseID = json[3].data[0].data.spouse.data[0]["query-value"];
    if (spouseID) {
        return (spouseID);
    }
}


function getActors(id) {
    var myActorJSON = getJSON(id);
    var myActorObject = parseJSON(id, myActorJSON);

}




// var result = post_to_url('//projectcornelia.be/source_browser/public/router.php', {q: '490', s: "ALL-SOURCES", w: "search-by-option"});
// console.log(result);

getActors(4);


// function drawGraph(){}

