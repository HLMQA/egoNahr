var exports = module.exports = {};

import * as d3Collection from 'd3-collection';


const jsonConversion = require('./jsonConversion.js');
const util = require('./util.js');
const _ = require("underscore");

var data = {
    actors: [],
    ties: [],
    objects: []
};
var maxRecursiveDepth;


var Labels = {
    MARRIAGE_LABEL: "Marriage",
    OFFSPRING_LABEL: "Offspring",
    GODPARENTHOOD_LABEL: "Godparenthood",
    SIBLINGHOOD_LABEL: "Sibling"
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
            centralActor.offSpringList[i] = jsonConversion.getActorData(centralActor.offSpringList[i].ID);
            thisChild = centralActor.offSpringList[i];

            assignOriginParentNodeToChild(thisChild, centralActor);
            assignSpouseToSpouse(thisChild);

            if (thisChild.offSpringList) {
                for (var j = 0; j < thisChild.offSpringList.length; j++) {
                    thisGrandChild = jsonConversion.getActorData(thisChild.offSpringList[j].ID);
                    assignOriginParentNodeToChild(thisGrandChild, thisChild);
                    thisChild.offSpringList[j] = thisGrandChild;
                }
            }
            centralActor.offSpringList[i] = thisChild;
        }
    }
    return (centralActor);
}

function assignOriginParentNodeToChild(actor, originParent) {

    var actorFirstParent = actor.firstParent;
    var actorSecondParent = actor.secondParent;

    if (actorFirstParent && (actor.firstParent.ID === originParent.ID)) {
        actor.firstParent = originParent;
    }
    else if (actorSecondParent && (actor.secondParent.ID === originParent.ID)) {
        actor.secondParent = originParent;
    }

    else if (!actorFirstParent && !actorSecondParent) {
        actor.firstParent = originParent;
    }

    else if (actorFirstParent && !actorSecondParent) {
        actor.secondParent = originParent;
    }

    else {
        console.log("Unexpected parent assignment");
    }

}

function assignSpouseToSpouse(actor) {
    if (actor.spouse && (!actor.spouse.spouse)) {
        actor.spouse.spouse = actor;
    }
}


function buildNodeList(actor) {
    data = {
        actors: [],
        ties: [],
        objects: []
    };

    var recursiveDepth = 0;
    maxRecursiveDepth = 2;

    var treeDepth = 0;

    var centralNode = new ActorNode(actor.ID, recursiveDepth, treeDepth);

    var finalActorList = traverseGraph(actor, data, recursiveDepth, treeDepth);
    centralNode = pushActorToList(centralNode, data.actors, recursiveDepth);
    actor = pushActorToList(actor, data.objects, recursiveDepth);

    data.actors = assignTreeDepthsToUnionNodes(data.actors);
    correctCoupleTies(data);
    completeNonFamilyLevels(data);
    correctTieOrders(data);
    addSiblingLinks(data)
    console.log(data);
    return (finalActorList);
}

function findUnionNode(actor) {

    var results = data.actors.filter(function (el) {
        return (el.ID.includes("+") && el.ID.split("+").includes(actor.ID))
    });
    return results;
}

function traverseGraph(actor, data, recursiveDepth, treeDepth) {


    if (recursiveDepth > maxRecursiveDepth) {
        return data;
    }

    if (recursiveDepth === maxRecursiveDepth) {
        if (actor.offSpringList && actor.offSpringList[0].jsonOrigin) {
            treeDepth++;

            var existingParentUnionNode = findUnionNode(actor);

            if (existingParentUnionNode[0]) {
                var parentUnionNode = existingParentUnionNode[0];

                for (var i = 0; i < actor.offSpringList.length; i++) {
                    var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.offSpringList[i], data, recursiveDepth, treeDepth, "parenthood");

                    data = updatedLevels[0];
                    treeDepth = updatedLevels[1];
                    recursiveDepth = updatedLevels[2];
                }
            }
            treeDepth--;
        }

        if (actor.spouse) {
            var existingParentUnionNode = findUnionNode(actor);

            if (existingParentUnionNode[0]) {
                var parentUnionNode = existingParentUnionNode[0];

                var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.spouse, data, recursiveDepth, treeDepth, Labels.MARRIAGE_LABEL);
                data = updatedLevels[0];
                treeDepth = updatedLevels[1];
                recursiveDepth = updatedLevels[2];

            }
        }

        // if (actor.firstParent) {
        //
        //     var existingParentUnionNode = findUnionNode(actor);
        //
        //     if (existingParentUnionNode[0]) {
        //         var parentUnionNode = existingParentUnionNode[0];
        //         treeDepth--;
        //         var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.firstParent, data, recursiveDepth, treeDepth, Labels.OFFSPRING_LABEL);
        //         data = updatedLevels[0];
        //         treeDepth = updatedLevels[1];
        //         recursiveDepth = updatedLevels[2];
        //         treeDepth++;
        //
        //     }
        // }

        // if (actor.secondParent) {
        //     var secondParent = jsonConversion.getActorData(actor.secondParent.ID);
        //
        //     var parentUnionNode = buildUnionNode(secondParent, recursiveDepth);
        //     treeDepth--;
        //     var updatedLevels = buildActorSubgraph(parentUnionNode, actor, secondParent, data, recursiveDepth, treeDepth, Labels.OFFSPRING_LABEL);
        //     data = updatedLevels[0];
        //     treeDepth = updatedLevels[1];
        //     recursiveDepth = updatedLevels[2];
        //     treeDepth++;
        // }

        // if (actor.firstGodParent) {
        //     var firstGodParent = jsonConversion.getActorData(actor.firstGodParent.ID);
        //
        //     treeDepth--;
        //     var updatedLevels = buildActorSubgraph(parentUnionNode, actor, firstGodParent, data, recursiveDepth, treeDepth, Labels.GODPARENTHOOD_LABEL);
        //     data = updatedLevels[0];
        //     treeDepth = updatedLevels[1];
        //     recursiveDepth = updatedLevels[2];
        //     treeDepth++;
        // }
        //
        // if (actor.secondGodParent) {
        //     var secondGodParent = jsonConversion.getActorData(actor.secondGodParent.ID);
        //
        //     treeDepth--;
        //
        //     var tempTreeDepth = treeDepth;
        //     var undefinedDepth = null;
        //     var updatedLevels = buildActorSubgraph(parentUnionNode, actor, secondGodParent, data, recursiveDepth, treeDepth, Labels.GODPARENTHOOD_LABEL);
        //     data = updatedLevels[0];
        //     treeDepth = tempTreeDepth;
        //     recursiveDepth = updatedLevels[2];
        //     treeDepth++;
    }
    if (recursiveDepth < maxRecursiveDepth) {
        if (actor.offSpringList) {
            treeDepth++;
            var parentUnionNode = buildUnionNode(actor, recursiveDepth);
            for (var i = 0; i < actor.offSpringList.length; i++) {
                actor.offSpringList[i] = jsonConversion.getActorData(actor.offSpringList[i].ID);
                pushActorToList(actor.offSpringList[i], data.objects, recursiveDepth + 1);

                var updatedLevels = buildActorSubgraph(parentUnionNode, actor, actor.offSpringList[i], data, recursiveDepth, treeDepth, "parenthood");
                data = updatedLevels[0];
                treeDepth = updatedLevels[1];
                recursiveDepth = updatedLevels[2];
            }
            treeDepth--;

        }


        if (actor.firstParent) {

            var firstParent = jsonConversion.getActorData(actor.firstParent.ID);
            firstParent = pushActorToList(firstParent, data.objects, recursiveDepth);

            var parentUnionNode = buildUnionNode(firstParent, recursiveDepth);
            treeDepth--;
            var updatedLevels = buildActorSubgraph(parentUnionNode, actor, firstParent, data, recursiveDepth, treeDepth, Labels.OFFSPRING_LABEL);

            data = updatedLevels[0];
            treeDepth = updatedLevels[1];
            recursiveDepth = updatedLevels[2];
            treeDepth++;

        }

        if (actor.secondParent) {
            var secondParent = jsonConversion.getActorData(actor.secondParent.ID);
            secondParent = pushActorToList(secondParent, data.objects, recursiveDepth);

            var parentUnionNode = buildUnionNode(secondParent, recursiveDepth);
            treeDepth--;
            var updatedLevels = buildActorSubgraph(parentUnionNode, actor, secondParent, data, recursiveDepth, treeDepth, Labels.OFFSPRING_LABEL);
            data = updatedLevels[0];
            treeDepth = updatedLevels[1];
            recursiveDepth = updatedLevels[2];
            treeDepth++;
        }


        if (actor.spouse) {
            var spouse = jsonConversion.getActorData(actor.spouse.ID);
            spouse = pushActorToList(spouse, data.objects, recursiveDepth);
            var parentUnionNode = buildUnionNode(spouse, recursiveDepth);
            var updatedLevels = buildActorSubgraph(parentUnionNode, actor, spouse, data, recursiveDepth, treeDepth, Labels.MARRIAGE_LABEL);
            data = updatedLevels[0];
            treeDepth = updatedLevels[1];
            recursiveDepth = updatedLevels[2];

        }

        if (actor.firstGodParent) {
            var firstGodParent = jsonConversion.getActorData(actor.firstGodParent.ID);

            treeDepth--;
            var updatedLevels = buildActorSubgraph(parentUnionNode, actor, firstGodParent, data, recursiveDepth, treeDepth, Labels.GODPARENTHOOD_LABEL);
            data = updatedLevels[0];
            treeDepth = updatedLevels[1];
            recursiveDepth = updatedLevels[2];
            treeDepth++;
        }

        if (actor.secondGodParent) {
            var secondGodParent = jsonConversion.getActorData(actor.secondGodParent.ID);

            treeDepth--;

            var tempTreeDepth = treeDepth;
            var undefinedDepth = null;
            var updatedLevels = buildActorSubgraph(parentUnionNode, actor, secondGodParent, data, recursiveDepth, treeDepth, Labels.GODPARENTHOOD_LABEL);
            data = updatedLevels[0];
            treeDepth = tempTreeDepth;
            recursiveDepth = updatedLevels[2];
            treeDepth++;
        }
    }
    return (data);
}

function assignTreeDepthsToUnionNodes(nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
        if (!nodeList[i].isActor) {
            var actorID = nodeList[i].ID;
            // treeDepth = average depth of before+ and +after
            var res = actorID.split("+");
            var firstParent = util.findActorNodeByID(res[0], nodeList);
            nodeList[i].treeDepth = firstParent.treeDepth + 0.5;
        }
    }
    return nodeList;

}

function correctCoupleTies(data) {
    for (var i = 0; i < data.objects.length; i++) {
        var currentActorObject = data.objects[i];
        var currentActor = util.findActorNodeByID(currentActorObject.ID, data.actors);
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
            && (!util.findActorNodeByField(data.actors[i].ID, "source", data.ties))
            && (!util.findActorNodeByField(data.actors[i].ID, "target", data.ties))
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
            var childrenTies = data.ties.filter(function (el) {
                return (el.target === currentActor.ID
                    && (el.tieType === Labels.GODPARENTHOOD_LABEL || el.tieType === Labels.OFFSPRING_LABEL));
            });

            var child = data.actors.find(o => o.ID === childrenTies[0].source);
            if (child)
                data.actors[i].treeDepth = child.treeDepth - 1;

            var parent = data.actors.find(o => o.ID === childrenTies[0].target);
            if (parent)
                data.actors[i].treeDepth = parent.treeDepth + 1;

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
            var reverseID = util.reverseStringID(tie.target);


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
            var reverseID = util.reverseStringID(tie.source);

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


function pushActorToList(actor, listToPushTo, newDepth) {


    var index, reverseID;

    if (actor.ID.includes("+")) {
        var res = actor.ID.split("+");
        reverseID = res[1] + "+" + res[0];
        index = listToPushTo.findIndex(x => (x.ID === actor.ID) || (x.ID === reverseID));
    }
    else {
        index = listToPushTo.findIndex(x => x.ID === (actor.ID));
    }

    if (actor.ID.includes("+")) {
        var res = actor.ID.split("+");
        reverseID = res[1] + "+" + res[0];
        if (parseFloat(res[1]) < parseFloat(res[0]))
            actor.ID = reverseID;
    }

    if (index < 0) {

        if (newDepth <= maxRecursiveDepth) {

            actor.recursiveDepth = newDepth;
            listToPushTo.push(actor);
            return (actor);
        }
    }

    else {


        // merge list of events from current and new actor object. Concatenates and removes duplicates
        if (!listToPushTo[index].eventList && actor.eventList) {
            listToPushTo[index].eventList = [];
            listToPushTo[index].eventList = util.concatenateWithNoDuplicate(listToPushTo[index].eventList.concat(actor.eventList));
        }
        else if (listToPushTo[index].eventList && !actor.eventList) {
            actor.eventList = [];
            listToPushTo[index].eventList = util.concatenateWithNoDuplicate(listToPushTo[index].eventList.concat(actor.eventList));
        }
        else if (listToPushTo[index].eventList && actor.eventList) {
            listToPushTo[index].eventList = util.concatenateWithNoDuplicate(listToPushTo[index].eventList.concat(actor.eventList));
        }

        // if one of the objects comes from the json, and not the other, replace by the one from the json
        if (!listToPushTo[index].jsonOrigin && actor.jsonOrigin) {
            listToPushTo[index] = actor;
        }


        // reajusts the treedepth position
        if (!(listToPushTo[index].treeDepth) && (actor.treeDepth)) {
            listToPushTo[index].treeDepth = actor.treeDepth;
        }

        // reajusts the recursiveDepth value
        if (listToPushTo[index].recursiveDepth > newDepth) {
            listToPushTo[index].recursiveDepth = newDepth;


        }
        else if (listToPushTo[index].recursiveDepth < newDepth) {
            actor.recursiveDepth = listToPushTo[index].recursiveDepth;
        }
        else if (!listToPushTo[index].recursiveDepth && newDepth <= maxRecursiveDepth) {
            listToPushTo[index].recursiveDepth = newDepth;
        }
    }


    return actor;
}


function buildActorSubgraph(parentUnionNode, parent, actor, graph, recursiveLevel, depthLevel, relationship) {

    var subActor = actor;


    if (relationship === "parenthood") {
        var toUnionTie = new jsonConversion.Tie(parent.ID, parentUnionNode.ID, Labels.OFFSPRING_LABEL);
        var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, subActor.ID, Labels.OFFSPRING_LABEL, subActor.baptismDate);


        if (subActor.baptismDate) {
            jsonConversion.pushEventToList(new jsonConversion.lifeEvent(parent.ID, subActor.baptismDate, Labels.OFFSPRING_LABEL, subActor.ID), parent.eventList);
        }
        toUnionTie = pushTieToList(toUnionTie, graph.ties);
        fromUnionTie = pushTieToList(fromUnionTie, graph.ties);
    }
    else if (relationship === Labels.GODPARENTHOOD_LABEL) {
        var tie = new jsonConversion.Tie(parent.ID, subActor.ID, Labels.GODPARENTHOOD_LABEL, subActor.baptismDate);
        tie = pushTieToList(tie, graph.ties);

        recursiveLevel++;
        graph = traverseGraph(subActor, graph, recursiveLevel, depthLevel);
        var thisNode = new ActorNode(subActor.ID, recursiveLevel, depthLevel);

        thisNode = pushActorToList(thisNode, graph.actors, recursiveLevel);
        subActor = pushActorToList(subActor, graph.objects, recursiveLevel);
        recursiveLevel--;


        return ([graph, depthLevel, recursiveLevel]);

    }


    else if (relationship === Labels.MARRIAGE_LABEL) {

        var tie = new jsonConversion.Tie(parent.ID, subActor.ID, Labels.MARRIAGE_LABEL, "marriageStartYear", "marriageEndYear");
        tie = pushTieToList(tie, graph.ties);

    }


    else if (relationship === Labels.OFFSPRING_LABEL) {
        var toUnionTie = new jsonConversion.Tie(subActor.ID, parentUnionNode.ID, Labels.OFFSPRING_LABEL, "testA");
        var fromUnionTie = new jsonConversion.Tie(parentUnionNode.ID, parent.ID, Labels.OFFSPRING_LABEL, "testB");

        if (parent.baptismDate) {
            jsonConversion.pushEventToList(new jsonConversion.lifeEvent(subActor.ID, parent.baptismDate, Labels.OFFSPRING_LABEL, parent.ID), subActor.eventList);
        }

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

    var actorSpouseID = "";
    if (actor.spouse)
        actorSpouseID = actor.spouse.ID;

    var parentUnionNode = new ActorNode(actor.ID + "+" + actorSpouseID);
    parentUnionNode = pushActorToList(parentUnionNode, data.actors, recursiveDepth + 0.5);


    var actorToUnionNodeTie = new jsonConversion.Tie(actor.ID, parentUnionNode.ID, Labels.OFFSPRING_LABEL, "marriageStartYear", "marriageEndYear");
    pushTieToList(actorToUnionNodeTie, data.ties);

    if (actorSpouseID != "") {
        var spouseToUnionNodeTie = new jsonConversion.Tie(actorSpouseID, parentUnionNode.ID, Labels.OFFSPRING_LABEL, "marriageStartYear", "marriageEndYear")
        pushTieToList(spouseToUnionNodeTie, data.ties);
    }


    return parentUnionNode;
}


function correctTieOrders(graph) {
    for (var i = 0; i < graph.ties.length; i++) {

        var elder = util.findActorNodeByID(graph.ties[i].source, graph.actors);
        var youngin = util.findActorNodeByID(graph.ties[i].target, graph.actors);

        // for cases where ID in source & target cannot be found in graph.ties
        if (!elder && !youngin) {
            continue;
        }
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


function addSiblingLinks(graph) {
    var filteredTieList = graph.ties.filter(function (d) {
        var parentID;
        if (d.source.ID)
            parentID = d.source.ID;
        else
            parentID = d.source;
        return parentID.includes("+");
    });

    var siblingGroups = d3Collection.nest()
        .key(function (d) {
            var parentID;
            if (d.source.ID)
                parentID = d.source.ID;
            else
                parentID = d.source;
            return parentID;
        })
        .entries(filteredTieList);

    for (var i = 0; i < siblingGroups.length; i++) {

        siblingGroups[i].values.sort(function (a, b) {
            var objectA, objectB;

            if (a.target.ID)
            objectA = util.findActorNodeByID(a.target.ID, graph.objects);
            else
                objectA = util.findActorNodeByID(a.target, graph.objects);

            if (b.target.ID)
                objectB = util.findActorNodeByID(b.target.ID, graph.objects);
            else
                objectB = util.findActorNodeByID(b.target, graph.objects);
            return objectA.baptismDate.format('YYYYMMDD') - objectB.baptismDate.format('YYYYMMDD');
        });

        for (var j = 0; j<siblingGroups[i].values.length-1; j++){

            var newTie = new jsonConversion.Tie(siblingGroups[i].values[j].target, siblingGroups[i].values[j+1].target, "Sibling");
            newTie = pushTieToList(newTie, graph.ties);
        }

    }
}


exports.getCentralActor = getCentralActor;
exports.buildNodeList = buildNodeList;
exports.data = data;
exports.Labels = Labels;
