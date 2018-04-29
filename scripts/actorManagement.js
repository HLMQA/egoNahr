var exports = module.exports = {};

const jsonConversion = require('./jsonConversion.js');

var CENTRAL_DEPTH_LEVEL = 0;


var TieObject = jsonConversion.Tie;



function getCentralActor(id) {
    var thisChild = {},
        thisGrandChild = {};
    var centralActor = jsonConversion.getActorData(id);
    if (centralActor.offSpringList) {
        for (var i = 0; i < centralActor.offSpringList.length; i++) {
            thisChild = jsonConversion.getActorData(centralActor.offSpringList[i].ID);
            // var childTie = new TieObject(centralActor, thisChild, )

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
    // console.log(centralActor);
    return (centralActor);
}

function assignOriginParentNodeToChild(actor, originParent) {
    if (actor.firstParent.ID = originParent.ID) {
        actor.firstParent = originParent;
    }
    else if (actor.secondParent.ID = originParent.ID) {
        actor.secondParent = originParent;
    }

}

var listOfActors = [];
var listOfTies = [];
var maxRecursiveDepth;

function buildNodeList(actor) {

    listOfTies = [];
    var recursiveDepth = 0;
    maxRecursiveDepth = 2;
    console.log(actor);
    console.log(recursiveDepth);

    pushActorToList(actor, listOfActors, recursiveDepth);
    return (traverseGraph(actor, recursiveDepth));
}

function traverseGraph(actor, recursiveDepth) {
    console.log(actor);
    console.log(recursiveDepth);
    if (recursiveDepth > maxRecursiveDepth) {
        console.log(actor);
        return;
    }

    if (recursiveDepth === maxRecursiveDepth) {
        pushActorToList(actor, listOfActors, recursiveDepth);
        return;
    }

    if (recursiveDepth < maxRecursiveDepth) {
        if (actor.offSpringList) {
            for (var i = 0; i < actor.offSpringList.length; i++) {
                var thisChild = actor.offSpringList[i];
                recursiveDepth++;
                traverseGraph(thisChild, recursiveDepth);
                thisChild.depth = recursiveDepth;
                pushActorToList(thisChild, listOfActors, recursiveDepth);
                // listOfActors.push(thisChild);
                recursiveDepth--;
            }
        }

        if (actor.spouse) {
            var thisSpouse = actor.spouse;
            recursiveDepth++;
            traverseGraph(thisSpouse, recursiveDepth);
            thisSpouse.depth = recursiveDepth;
            pushActorToList(thisSpouse, listOfActors, recursiveDepth);
            // listOfActors.push(thisSpouse);
            recursiveDepth--;
        }

        if (actor.firstParent) {
            var thisFirstParent = actor.firstParent;
            recursiveDepth++;
            traverseGraph(thisFirstParent, recursiveDepth);
            thisFirstParent.depth = recursiveDepth;
            pushActorToList(thisFirstParent, listOfActors, recursiveDepth);
            // listOfActors.push(thisFirstParent);
            recursiveDepth--;
        }

        if (actor.secondParent) {
            var thisSecondParent = actor.secondParent;
            recursiveDepth++;
            traverseGraph(thisSecondParent, recursiveDepth);
            thisSecondParent.depth = recursiveDepth;
            pushActorToList(thisSecondParent, listOfActors, recursiveDepth);
            // listOfActors.push(thisSecondParent);
            recursiveDepth--;
        }
    }
    return (listOfActors);
}


function pushActorToList(actor, list, newDepth) {
    var index = list.findIndex(x => x.ID == actor.ID);

    if (index < 0) {
        actor.depth = newDepth;
        list.push(actor);
    }
    else {
        if (list[index].depth > newDepth) {
            list[index].depth = newDepth;
        }
        else if (!list[index].depth)
            list[index].depth = newDepth;
    }
}


function pushTieToList(tie, list) {
    var index = list.findIndex(x => x.ID == tie.ID);

    if (index < 0) {
        list.push(tie);
    }
    else
        return;
}


function arraySort(a, b) {
    return (a.ID > b.ID) ? 1 : ((b.ID > a.ID) ? -1 : 0);
}

exports.getCentralActor = getCentralActor;
exports.buildNodeList = buildNodeList;
exports.arraySort = arraySort;
