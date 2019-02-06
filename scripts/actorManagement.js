var exports = module.exports = {};

const jsonConversion = require('./jsonConversion.js');

var data = {
    actors: [],
    ties: [],
    objects: []
};
var maxRecursiveDepth;
var listOfActors = [];

var Labels = {
    MARRIAGE_LABEL: "Marriage",
    OFFSPRING_LABEL: "Offspring",
    GODPARENTHOOD_LABEL: "Godparenthood"
}


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
    assignSpouseToSpouse(centralActor);
    if (centralActor.offSpringList) {
        var childrenListLength = centralActor.offSpringList.length;
        for (var i = 0; i < childrenListLength; i++) {
            assignSpouseToSpouse(centralActor);
            thisChild = jsonConversion.getActorData(centralActor.offSpringList[i].ID);
            assignOriginParentNodeToChild(thisChild, centralActor);
            assignSpouseToSpouse(thisChild);

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

    var actorFirstParent = actor.firstParent;
    var actorSecondParent = actor.secondParent;

    if (!actorFirstParent && !actorSecondParent) {
        actor.firstParent = originParent;
    }
    else if (actorFirstParent && (actor.firstParent.ID === originParent.ID)) {
        actor.firstParent = originParent;
    }
    else if (actorSecondParent && (actor.secondParent.ID === originParent.ID)) {
        actor.secondParent = originParent;
    }
}

function assignSpouseToSpouse(actor, actorSpouse) {

    // var actorFirstParent = actor.firstParent;
    // var actorSecondParent = actor.secondParent;

    // if (!actor.spouse) {
    //     actor.firstParent = originParent;
    // }
    if (actor.spouse && (!actor.spouse.spouse)) {
        actor.spouse.spouse = actor;
    }
    // else if (actorSecondParent && (actor.secondParent.ID === originParent.ID)) {
    //     actor.secondParent = originParent;
    // }
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
    completeNonFamilyLevels(data);
    correctTieOrders(data);
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
                var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.offSpringList[i], data, recursiveDepth, treeDepth, "parenthood");
                // listOfActors.push(actor.offSpringList[i]);

                data = updatedLevels[0];
                treeDepth = updatedLevels[1];
                recursiveDepth = updatedLevels[2];
            }
            treeDepth--;

        }
    }

    if (actor.spouse) {
        var parentUnionNode = buildUnionNode(actor.spouse, recursiveDepth);
        var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.spouse, data, recursiveDepth, treeDepth, Labels.MARRIAGE_LABEL);
        data = updatedLevels[0];
        treeDepth = updatedLevels[1];
        recursiveDepth = updatedLevels[2];

    }

    if (actor.firstParent) {
        var parentUnionNode = buildUnionNode(actor.firstParent, recursiveDepth);
        treeDepth--;
        var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.firstParent, data, recursiveDepth, treeDepth, Labels.OFFSPRING_LABEL);
        data = updatedLevels[0];
        treeDepth = updatedLevels[1];
        recursiveDepth = updatedLevels[2];
        treeDepth++;

    }

    if (actor.secondParent) {
        var parentUnionNode = buildUnionNode(actor.secondParent, recursiveDepth);
        treeDepth--;
        var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.secondParent, data, recursiveDepth, treeDepth, Labels.OFFSPRING_LABEL);
        data = updatedLevels[0];
        treeDepth = updatedLevels[1];
        recursiveDepth = updatedLevels[2];
        treeDepth++;
    }

    if (actor.firstGodParent) {
        treeDepth--;
        var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.firstGodParent, data, recursiveDepth, treeDepth, Labels.GODPARENTHOOD_LABEL);
        data = updatedLevels[0];
        treeDepth = updatedLevels[1];
        recursiveDepth = updatedLevels[2];
        treeDepth++;
    }

    if (actor.secondGodParent) {
        treeDepth--;

        var tempTreeDepth = treeDepth;
        var undefinedDepth = null;
        var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.secondGodParent, data, recursiveDepth, treeDepth, Labels.GODPARENTHOOD_LABEL);
        data = updatedLevels[0];
        treeDepth = tempTreeDepth;
        recursiveDepth = updatedLevels[2];
        treeDepth++;
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
    for (var i = 0; i < data.objects.length; i++) {
        var currentActorObject = data.objects[i];
        var currentActor = findActorNodeByID(currentActorObject.ID, data.actors);
        var tiesToParentUnionNodes = data.ties.filter(function (el) {
            return (el.target === currentActor.ID
                && el.tieType === Labels.OFFSPRING_LABEL);
        });


        if (tiesToParentUnionNodes.length == 2) {
            var mergedUnionNode = new ActorNode(tiesToParentUnionNodes[0].source + "" + tiesToParentUnionNodes[1].source.slice(0, -1), currentActor.recursiveDepth + 0.5, currentActor.treeDepth - 0.5);
            mergedUnionNode = pushActorToList(mergedUnionNode, data.actors, currentActor.recursiveDepth + 0.5);

            var newChildToUnionTie = new jsonConversion.Tie(mergedUnionNode.ID, currentActor.ID, Labels.OFFSPRING_LABEL, currentActorObject.baptismDate);
            newChildToUnionTie = pushTieToList(newChildToUnionTie, data.ties);

            // removeChildToIncompleteUnionTies:

            for (var j = data.ties.length - 1; j >= 0; j--) {
                if ((data.ties[j].target === currentActor.ID)
                    && (data.ties[j].tieType === Labels.OFFSPRING_LABEL)
                    && (
                        (data.ties[j].source === tiesToParentUnionNodes[0].source)
                        || (data.ties[j].source === tiesToParentUnionNodes[1].source)
                    )
                ) {
                    data.ties.splice(j, 1);
                }
            }

            // removeParentToIncompleteUnionTies:
            // for each union node that is linked to a Parent (0 or 1) and no children, remove
            // for each union node that's not a target in any of data.ties, remove

            var potentialTiesToChildren = data.ties.filter(function (el) {
                return el.source === tiesToParentUnionNodes[0];
            });
            if (!potentialTiesToChildren.length > 0) {
                // data.ties.splice(j, 1);

                for (var j = data.ties.length - 1; j >= 0; j--) {
                    if (
                        ((data.ties[j].source === tiesToParentUnionNodes[0].source.slice(0, -1))
                            && (data.ties[j].target === tiesToParentUnionNodes[0].source))
                        ||
                        ((data.ties[j].source === tiesToParentUnionNodes[1].source.slice(0, -1))
                            && (data.ties[j].target === tiesToParentUnionNodes[1].source))
                        &&
                        (data.ties[j].tieType === Labels.OFFSPRING_LABEL)
                    ) {
                        data.ties.splice(j, 1);
                    }
                }

            }
            var newFirstParentToUnionTie = new jsonConversion.Tie(tiesToParentUnionNodes[0].source.slice(0, -1), mergedUnionNode.ID, Labels.OFFSPRING_LABEL);
            newFirstParentToUnionTie = pushTieToList(newFirstParentToUnionTie, data.ties);

            var newSecondParentToUnionTie = new jsonConversion.Tie(tiesToParentUnionNodes[1].source.slice(0, -1), mergedUnionNode.ID, Labels.OFFSPRING_LABEL);
            newSecondParentToUnionTie = pushTieToList(newSecondParentToUnionTie, data.ties);
        }

        // if there exist TWO ties where target is currentActor.ID
        // new tie3 with ID (paernt1ID+paernt2ID), target = currentActor.ID
        // new tie between each parent and Tie3

    }

    for (var i = 0; i < data.actors.length; i++) {
        if (data.actors[i].ID.includes("+")
            && (!findActorNodeByField(data.actors[i].ID, "source", data.ties))
            && (!findActorNodeByField(data.actors[i].ID, "target", data.ties))
        ) {
            data.actors.splice(i, 1);
            i--;
        }
    }
}

function completeNonFamilyLevels(data) {
    for (var i = 0; i < data.actors.length; i++) {
        var currentActor = data.actors[i];
        if (currentActor.treeDepth == null) {
            var godchildrenTies = data.ties.filter(function (el) {
                return (el.target === currentActor.ID
                    && el.tieType === Labels.GODPARENTHOOD_LABEL);
            });
            var godChild = data.actors.find(o => o.ID === godchildrenTies[0].source);
            data.actors[i].treeDepth = godChild.treeDepth - 1;
        }
    }
}

function pushTieToList(tie, listToPushTo) {

    var index = -1;

    if (tie.source.includes("+")) {
        var res = tie.source.split("+");
        if (parseInt(res[1]) < parseInt(res[0])) {
            tie.source = res[1] + "+" + res[0];
        }
    }

    if (tie.target.includes("+")) {
        var res = tie.target.split("+");
        if (parseInt(res[1]) < parseInt(res[0])) {
            tie.target = res[1] + "+" + res[0];
        }
    }

    for (var i = 0; i < listToPushTo.length; i++) {

        if (tie.target.includes("+")) {
            var reverseID = reverseStringID(tie.target);


            if ((jsonConversion.isEquivalent(tie.source, listToPushTo[i].source))
                && (jsonConversion.isEquivalent(tie.target, listToPushTo[i].target) ||
                    jsonConversion.isEquivalent(reverseID, listToPushTo[i].target)
                )
                && (jsonConversion.isEquivalent(tie.tieType, listToPushTo[i].tieType))
            ) {
                if (jsonConversion.isEquivalent(reverseID, listToPushTo[i].target)
                ) {
                    tie.target = reverseID;
                }
                index = i;
                break;
            }
        }
        else if (tie.source.includes("+")) {
            var reverseID = reverseStringID(tie.source);


            if ((jsonConversion.isEquivalent(tie.target, listToPushTo[i].target))
                && (jsonConversion.isEquivalent(tie.source, listToPushTo[i].source) ||
                    jsonConversion.isEquivalent(reverseID, listToPushTo[i].source)
                )
                && (jsonConversion.isEquivalent(tie.tieType, listToPushTo[i].tieType))
            ) {
                if (jsonConversion.isEquivalent(reverseID, listToPushTo[i].source)
                ) {
                    tie.source = reverseID;
                }

                index = i;
                break;
            }
        }

        else if (((jsonConversion.isEquivalent(tie.source, listToPushTo[i].source))
            && (jsonConversion.isEquivalent(tie.target, listToPushTo[i].target))
            && (jsonConversion.isEquivalent(tie.tieType, listToPushTo[i].tieType)))
        ) {
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

function reverseStringID(string) {
    var res = string.split("+");
    var reverseID = res[1] + "+" + res[0];
    return (reverseID);
}

function pushActorToList(actor, listToPushTo, newDepth) {

    var index, reverseID;

    if (actor.ID.includes("+")) {
        var res = actor.ID.split("+");
        reverseID = res[1] + "+" + res[0];
        index = listToPushTo.findIndex(x => (x.ID === actor.ID) || (x.ID === reverseID));
    }
    else
        index = listToPushTo.findIndex(x => x.ID === (actor.ID));


    if (index < 0) {

        actor.recursiveDepth = newDepth;
        listToPushTo.push(actor);
    }
    else {

        if (!(listToPushTo[index].treeDepth) && (actor.treeDepth)) {
            listToPushTo[index].treeDepth = actor.treeDepth;
        }

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

    var res = actor.ID.split("+");
    reverseID = res[1] + "+" + res[0];
    if (parseFloat(res[1]) < parseFloat(res[0]))
        actor.ID = reverseID;


    return actor;
}


function buildActorSubgraph(parentUnionNode, parent, actor, graph, recursiveLevel, depthLevel, relationship) {

    var subActor = actor;


    console.log(graph.ties);

    if (relationship === "parenthood") {
        // if (relationship === Labels.OFFSPRING_LABEL) {
        var toUnionTie = new jsonConversion.Tie(parent.ID, parentUnionNode.ID, Labels.OFFSPRING_LABEL);
        var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, subActor.ID, Labels.OFFSPRING_LABEL, subActor.baptismDate);

        toUnionTie = pushTieToList(toUnionTie, graph.ties);
        fromUnionTie = pushTieToList(fromUnionTie, graph.ties);
    }


    else if (relationship === Labels.GODPARENTHOOD_LABEL) {
        var tie = new jsonConversion.Tie(parent.ID, subActor.ID, Labels.GODPARENTHOOD_LABEL, subActor.baptismDate);
        tie = pushTieToList(tie, graph.ties);

        recursiveLevel++;
        graph = traverseGraph(subActor, graph, recursiveLevel, depthLevel);
        var thisNode = new ActorNode(subActor.ID, recursiveLevel, null);

        thisNode = pushActorToList(thisNode, graph.actors, recursiveLevel);
        subActor = pushActorToList(subActor, graph.objects, recursiveLevel);
        recursiveLevel--;


        return ([graph, depthLevel, recursiveLevel]);

    }


    else if (relationship === Labels.MARRIAGE_LABEL) {
        // var tie = new jsonConversion.Tie(parent.ID, subActor.ID, Labels.MARRIAGE_LABEL);
        // tie = pushTieToList(tie, graph.ties);

    }


    else {
        var toUnionTie = new jsonConversion.Tie(subActor.ID, parentUnionNode.ID, Labels.OFFSPRING_LABEL, "testA");
        var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, parent.ID, Labels.OFFSPRING_LABEL, "testB");

        toUnionTie = pushTieToList(toUnionTie, graph.ties);
        fromUnionTie = pushTieToList(fromUnionTie, graph.ties);
    }

    recursiveLevel++;
    graph = traverseGraph(subActor, graph, recursiveLevel, depthLevel);
    var thisNode = new ActorNode(subActor.ID, recursiveLevel, depthLevel);
    thisNode = pushActorToList(thisNode, graph.actors, recursiveLevel);
    subActor = pushActorToList(subActor, graph.objects, recursiveLevel);
    recursiveLevel--;


    return ([graph, depthLevel, recursiveLevel]);
}

function buildUnionNode(actor, recursiveDepth) {

    // debugger;

    var actorSpouseID = "";
    if (actor.spouse)
        actorSpouseID = actor.spouse.ID;
    var parentUnionNode = new ActorNode(actor.ID + "+" + actorSpouseID);
    parentUnionNode = pushActorToList(parentUnionNode, data.actors, recursiveDepth + 0.5);

    return parentUnionNode;
}

function findActorNodeByField(value, field, list) {

    var index = list.map(function (x) {
        return x[field];
    }).indexOf(value);

    return list[index];
}

function correctTieOrders(graph) {
    for (var i = 0; i < graph.ties.length; i++) {

        var elder = findActorNodeByID(graph.ties[i].source, graph.actors);
        var youngin = findActorNodeByID(graph.ties[i].target, graph.actors);

        if (!elder) {
            if (graph.ties[i].source.includes("+") && !graph.ties[i].source.includes(youngin.ID)) {
                var temp = graph.ties[i].source;
                graph.ties[i].source = graph.ties[i].target;
                graph.ties[i].target = temp;
            }
        }

        else if (!youngin) {
            if (graph.ties[i].target.includes("+") && !graph.ties[i].target.includes(elder.ID)) {

                var temp = graph.ties[i].source;
                graph.ties[i].source = graph.ties[i].target;
                graph.ties[i].target = temp;

            }
        }


        else if (elder.treeDepth > youngin.treeDepth) {
            var temp = youngin;
            youngin = elder;
            elder = temp;

            graph.ties[i].source = elder;
            graph.ties[i].target = youngin;
        }
    }
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

exports.getCentralActor = getCentralActor;
exports.buildNodeList = buildNodeList;
exports.arraySort = arraySort;
exports.findActorNodeByID = findActorNodeByID;
exports.arraySortByTwoColumns = arraySortByTwoColumns;
exports.data = data;
exports.Labels = Labels;


// ||
// (jsonConversion.isEquivalent(tie.source, listToPushTo[i].target)
//     && (jsonConversion.isEquivalent(tie.target, listToPushTo[i].source))
//     && (jsonConversion.isEquivalent(tie.tieType, listToPushTo[i].tieType))