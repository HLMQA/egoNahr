var exports = module.exports = {};

const jsonConversion = require('./jsonConversion.js');

var data = {
    actors: [],
    ties: [],
    objects: []
};
var maxRecursiveDepth;
var listOfActors = [];
var MARRIAGE_LABEL = "Marriage";
var OFFSPRING_LABEL = "Offspring";

var ActorNode = function (id, depth, treeDepth) {
    this.ID = "" + id;
    this.recursiveDepth = depth;
    this.treeDepth = treeDepth;
    if (this.ID.includes("+")) {
        this.isActor = false;
    }
    else this.isActor = true;
};


function getCentralActor(id) {
    var thisChild = {},
        thisGrandChild = {};
    var centralActor = jsonConversion.getActorData(id);
    if (centralActor.offSpringList) {
        for (var i = 0; i < centralActor.offSpringList.length; i++) {
            thisChild = jsonConversion.getActorData(centralActor.offSpringList[i].ID);
            assignOriginParentNodeToChild(thisChild, centralActor);
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

function buildNodeList(actor) {

    var recursiveDepth = 0;
    maxRecursiveDepth = 2;

    var treeDepth = 0;

    var centralNode = new ActorNode(actor.ID, recursiveDepth, treeDepth);

    var finalActorList = traverseGraph(actor, data, recursiveDepth, treeDepth);
    pushActorToList(centralNode, data.actors, recursiveDepth);
    pushActorToList(actor, data.objects, recursiveDepth);

    data.actors = assignTreeDepthsToUnionNodes(data.actors);
    correctCoupleTies(data);
    return (finalActorList);

}

function traverseGraph(actor, data, recursiveDepth, treeDepth) {
    if (recursiveDepth >= maxRecursiveDepth) {
        return data;
    }
    if (recursiveDepth < maxRecursiveDepth) {
        if (actor.offSpringList) {
            treeDepth++;
            var parentUnionNode = buildUnionNode(actor, recursiveDepth);
            for (var i = 0; i < actor.offSpringList.length; i++) {
                var thisChild = actor.offSpringList[i];
                var toUnionTie = new jsonConversion.Tie(actor.ID, parentUnionNode.ID, OFFSPRING_LABEL);
                var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, thisChild.ID, OFFSPRING_LABEL);

                toUnionTie = pushTieToList(toUnionTie, data.ties);
                fromUnionTie = pushTieToList(fromUnionTie, data.ties);
                recursiveDepth++;
                data = traverseGraph(thisChild, data, recursiveDepth, treeDepth);

                var thisNode = new ActorNode(thisChild.ID);
                thisNode.recursiveDepth = recursiveDepth;
                thisNode.treeDepth = treeDepth;

                thisNode = pushActorToList(thisNode, data.actors, recursiveDepth);
                thisChild = pushActorToList(thisChild, data.objects, recursiveDepth);

                // listOfActors.push(thisChild);
                recursiveDepth--;
            }
            treeDepth--;

        }
    }

    if (actor.spouse) {
        // no change to treeDepth because spouse is on same level
        var thisSpouse = actor.spouse;
        var thisTie = new jsonConversion.Tie(actor.ID, thisSpouse.ID, MARRIAGE_LABEL);
        thisTie = pushTieToList(thisTie, data.ties);
        recursiveDepth++;
        data = traverseGraph(thisSpouse, data, recursiveDepth, treeDepth);
        var thisNode = new ActorNode(thisSpouse.ID, recursiveDepth, treeDepth);
        thisNode.treeDepth = treeDepth;
        thisNode = pushActorToList(thisNode, data.actors, recursiveDepth);
        thisSpouse = pushActorToList(thisSpouse, data.objects, recursiveDepth);

        recursiveDepth--;
    }

    if (actor.firstParent) {
        treeDepth--;
        var parentUnionNode = buildUnionNode(actor.firstParent, recursiveDepth);
        var thisFirstParent = actor.firstParent;
        var toUnionTie = new jsonConversion.Tie(thisFirstParent.ID, parentUnionNode.ID, OFFSPRING_LABEL);
        var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, actor.ID, OFFSPRING_LABEL);
        toUnionTie = pushTieToList(toUnionTie, data.ties);
        fromUnionTie = pushTieToList(fromUnionTie, data.ties);
        recursiveDepth++;
        data = traverseGraph(thisFirstParent, data, recursiveDepth, treeDepth);
        var thisNode = new ActorNode(thisFirstParent.ID, recursiveDepth, treeDepth);
        thisNode = pushActorToList(thisNode, data.actors, recursiveDepth);
        thisFirstParent = pushActorToList(thisFirstParent, data.objects, recursiveDepth);
        treeDepth++;

        recursiveDepth--;
    }

    if (actor.secondParent) {
        treeDepth--;
        var parentUnionNode = buildUnionNode(actor.secondParent, recursiveDepth);
        var thisSecondParent = actor.secondParent;
        var toUnionTie = new jsonConversion.Tie(thisSecondParent.ID, parentUnionNode.ID, OFFSPRING_LABEL);
        var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, actor.ID, OFFSPRING_LABEL);
        toUnionTie = pushTieToList(toUnionTie, data.ties);
        fromUnionTie = pushTieToList(fromUnionTie, data.ties);
        recursiveDepth++;
        data = traverseGraph(thisSecondParent, data, recursiveDepth, treeDepth);
        var thisNode = new ActorNode(thisSecondParent.ID, recursiveDepth, treeDepth);
        thisNode.treeDepth = treeDepth;
        thisNode = pushActorToList(thisNode, data.actors, recursiveDepth);
        thisSecondParent = pushActorToList(thisSecondParent, data.objects, recursiveDepth);
        treeDepth++;
        recursiveDepth--;
    }

    return (data);
}


function assignTreeDepthsToUnionNodes(nodeList) {

    for (var i = 0; i < nodeList.length; i++) {
        if (!nodeList[i].isActor) {
            var actorID = nodeList[i].ID;
            // treeDepth = average depth of before+ and +after
            var res = actorID.split("+");
            var firstParent = findActorNodeByID(res[0], nodeList);
            nodeList[i].treeDepth = firstParent.treeDepth + 0.5;
        }
    }
    return nodeList;

}

function correctCoupleTies(data) {
    for (var i = 0; i < data.actors.length; i++) {
        var currentActor = data.actors[i];
        if (currentActor.isActor) {

            var tiesToParentUnionNodes = data.ties.filter(function (el) {
                return el.target === currentActor.ID;
            });

            if (tiesToParentUnionNodes.length == 2) {
                console.log(currentActor);
                var mergedUnionNode = new ActorNode(tiesToParentUnionNodes[0].source + "" + tiesToParentUnionNodes[1].source.slice(0, -1), currentActor.recursiveDepth + 0.5, currentActor.treeDepth - 0.5);
                mergedUnionNode = pushActorToList(mergedUnionNode, data.actors, currentActor.recursiveDepth + 0.5);

                var newChildToUnionTie = new jsonConversion.Tie(mergedUnionNode.ID, currentActor.ID, OFFSPRING_LABEL);
                console.log(newChildToUnionTie);
                newChildToUnionTie = pushTieToList(newChildToUnionTie, data.ties);

                // removeChildToIncompleteUnionTies:

                for (var j = data.ties.length - 1; j >= 0; j--) {
                    if ((data.ties[j].target === currentActor.ID)
                        && (data.ties[j].tieType === OFFSPRING_LABEL)
                        && (
                            (data.ties[j].source === tiesToParentUnionNodes[0].source)
                            || (data.ties[j].source === tiesToParentUnionNodes[1].source)
                        )
                    ) {
                        data.ties.splice(j, 1);
                        // debugger;
                    }
                }

                // removeParentToIncompleteUnionTies:
                // for each union node that is linked to a Parent (0 or 1) and no children, remove
                // for each union node that's not a target in any of data.ties, remove

                var potentialTiesToChildren = data.ties.filter(function (el) {
                    return el.source === tiesToParentUnionNodes[0];
                });
                if (!potentialTiesToChildren.length > 0) {
                    console.log("no more kids");
                    // data.ties.splice(j, 1);

                    for (var j = data.ties.length - 1; j >= 0; j--) {
                        if (
                            ((data.ties[j].source === tiesToParentUnionNodes[0].source.slice(0, -1))
                                && (data.ties[j].target === tiesToParentUnionNodes[0].source))
                            ||
                            ((data.ties[j].source === tiesToParentUnionNodes[1].source.slice(0, -1))
                                && (data.ties[j].target === tiesToParentUnionNodes[1].source))

                            &&
                            (data.ties[j].tieType === OFFSPRING_LABEL)
                        ) {
                            data.ties.splice(j, 1);
                        }
                    }


                    // for (var j = data.actors.length - 1; j >= 0; j--) {
                    //     if (data.actors[j].ID === tiesToParentUnionNodes[0].source) {
                    //         data.actors.splice(j, 1);
                    //         debugger;
                    //     }
                    // }


                }


                var newFirstParentToUnionTie = new jsonConversion.Tie(tiesToParentUnionNodes[0].source.slice(0, -1), mergedUnionNode.ID, OFFSPRING_LABEL);
                newFirstParentToUnionTie = pushTieToList(newFirstParentToUnionTie, data.ties);

                var newSecondParentToUnionTie = new jsonConversion.Tie(tiesToParentUnionNodes[1].source.slice(0, -1), mergedUnionNode.ID, OFFSPRING_LABEL);
                newSecondParentToUnionTie = pushTieToList(newSecondParentToUnionTie, data.ties);

                console.log(data);

            }


            // if there exist TWO ties where target is currentActor.ID
            // new tie3 with ID (paernt1ID+paernt2ID), target = currentActor.ID
            // new tie between each parent and Tie3


        }
    }
}

function pushTieToList(tie, listToPushTo) {

    var index = -1;
    for (var i = 0; i < listToPushTo.length; i++) {
        if (isEquivalent(tie, listToPushTo[i])) {
            index = i;
            break;
        }
    }

    if (index < 0) {
        listToPushTo.push(tie);
    }
    else
        return;
}

function pushActorToList(actor, listToPushTo, newDepth) {
    var index = listToPushTo.map(function (x) {
        return x.ID;
    }).indexOf(actor.ID);

    if (index < 0) {
        actor.recursiveDepth = newDepth;
        listToPushTo.push(actor);
    }
    else {

        if (listToPushTo[index].recursiveDepth > newDepth) {
            listToPushTo[index].recursiveDepth = newDepth;
            return actor;

        }
        else if (listToPushTo[index].recursiveDepth < newDepth) {
            actor.recursiveDepth = listToPushTo[index].recursiveDepth;
            return actor;
        }
        else if (!listToPushTo[index].recursiveDepth) {
            listToPushTo[index].recursiveDepth = newDepth;
            return actor;
        }
    }
    return actor;
}

// function buildUnionNode(parent, child) {
//     var thisUnionNode;
//     console.log(child)
//     // if (!actor.offSpringList[i].firstParent) {
//
//     // if parent
//     if (child.firstParent || child.secondParent) {
//         thisUnionNode = new ActorNode(child.firstParent.ID + "x" + child.secondParent.ID);
//     }
//     return thisUnionNode;
// }

function buildUnionNode(actor, recursiveDepth) {

    var actorSpouseID = "";
    if (actor.spouse)
        actorSpouseID = actor.spouse.ID;
    var parentUnionNode = new ActorNode(actor.ID + "+" + actorSpouseID);
    parentUnionNode = pushActorToList(parentUnionNode, data.actors, recursiveDepth + 0.5);

    return parentUnionNode;
}

function findActorNodeByID(id, list) {

    var index = list.map(function (x) {
        return x.ID;
    }).indexOf(id);

    return list[index];
}

function arraySort(a, b) {
    return (a.ID > b.ID) ? 1 : ((b.ID > a.ID) ? -1 : 0);
}

function arraySortByTwoColumns(a, b) {
    var aSource = a.source;
    var bSource = b.source;
    var aTarget = a.target;
    var bTarget = b.target;

    if (aSource == bSource) {
        return (aTarget < bTarget) ? -1 : (aTarget > bTarget) ? 1 : 0;
    }
    else {
        return (aSource < bSource) ? -1 : 1;
    }
};

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

exports.getCentralActor = getCentralActor;
exports.buildNodeList = buildNodeList;
exports.arraySort = arraySort;
exports.arraySortByTwoColumns = arraySortByTwoColumns;
exports.data = data;
