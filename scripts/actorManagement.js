var exports = module.exports = {};

const jsonConversion = require('./jsonConversion.js');



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



exports.getCentralActor = getCentralActor;
