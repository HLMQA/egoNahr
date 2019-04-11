var moment = require('../../node_modules/moment/moment.js');
var exports = module.exports = {};

const _ = require("underscore");

function findActorNodeByID(id, list) {
    var index = list.map(function (x) {
        return x.ID;
    }).indexOf(id);
    return list[index];
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


function arraySort(a, b) {
    return (a.ID > b.ID) ? 1 : ((b.ID > a.ID) ? -1 : 0);
}

function concatenateWithNoDuplicate(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (_.isEqual(a[i], a[j])) {
                a.splice(j--, 1);
            }
        }
    }

    return a;
}

function findActorNodeByField(value, field, list) {

    var index = list.map(function (x) {
        return x[field];
    }).indexOf(value);

    return list[index];
}


function reverseStringID(string) {
    var res = string.split("+");
    var reverseID = res[1] + "+" + res[0];
    return (reverseID);
}


exports.findActorNodeByID = findActorNodeByID;
exports.arraySort = arraySort;
exports.arraySortByTwoColumns = arraySortByTwoColumns;
exports.concatenateWithNoDuplicate = concatenateWithNoDuplicate;
exports.findActorNodeByField = findActorNodeByField;
exports.reverseStringID = reverseStringID;
