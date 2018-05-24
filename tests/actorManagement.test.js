var actorManagement, jsonConversion;


beforeEach(() => {
    jest.resetModules();
    actorManagement = require('../scripts/actorManagement.js');
    jsonConversion = require('../scripts/jsonConversion.js');

});

// TODO: Test relationship of spouse to kids - when a link is established and when it is guessed.

test('getCentralActor takes an ID and returns a JSON with the full tree of the actor data', () => {
    var jsonObject = [{
        "label": "Name",
        "type": "section",
        "data": [
            [{
                "clickable": false,
                "text": "Full Name"
            }]
        ],
        "value": null
    }];

    console.log(jsonObject);

    jsonConversion.getActorData = jest.fn();
    jsonConversion.getActorData.mockReturnValueOnce(jsonObject);
    expect(actorManagement.getCentralActor("4")).toEqual(jsonObject);
});


test('nodeList creation has format of original data', () => {

    var centralActorObject = [{
        "label": "Name",
        "type": "section",
        "data": [[{"clickable": false, "text": "Louis De Vadder"}]],
        "value": null
    }, {"label": "Parish Records", "type": "header", "data": null, "value": null}, {
        "label": "Baptism",
        "type": "collapsible",
        "data": {
            "place": {
                "label": "City \/ Parish",
                "data": [{"clickable": false, "text": "Brussels\/Onze-Lieve-Vrouw ter Kapelle"}]
            },
            "parents": {
                "label": "Parents",
                "data": [{
                    "clickable": true,
                    "text": "Gillis De Vadder",
                    "query-value": "6212",
                    "query-text": "Gillis De Vadder",
                    "query-type": "actor"
                }, {"clickable": false, "text": " and "}, {
                    "clickable": true,
                    "text": "Margriet Cockx",
                    "query-value": "7001",
                    "query-text": "Margriet Cockx",
                    "query-type": "actor"
                }]
            },
            "godparents": {
                "label": "Godparents",
                "data": [{
                    "clickable": true,
                    "text": "Louis De Villaet",
                    "query-value": "7005",
                    "query-text": "Louis De Villaet",
                    "query-type": "actor"
                }, {"clickable": false, "text": " and "}, {
                    "clickable": true,
                    "text": "Catharina De Vadder",
                    "query-value": "7006",
                    "query-text": "Catharina De Vadder",
                    "query-type": "actor"
                }]
            },
            "substitute-godparents": {"label": "Substitute Godparents", "data": []},
            "source": {"label": "Source", "data": [{"clickable": false, "text": "BSPR330-08041605"}]}
        },
        "value": "8 April 1605"
    }, {
        "label": "Marriage",
        "type": "list",
        "data": [{
            "collapsible": true,
            "value": "1 September 1626",
            "data": {
                "place": {
                    "label": "City \/ Parish",
                    "data": [{"clickable": false, "text": "Brussels\/Sint-Michiel en Sint-Goedele"}]
                },
                "spouse": {
                    "label": "Spouse",
                    "data": [{
                        "clickable": true,
                        "text": "Susanna Tack",
                        "query-value": "10756",
                        "query-text": "Susanna Tack",
                        "query-type": "actor"
                    }]
                },
                "witnesses": {"label": "Witnesses", "data": []},
                "source": {"label": "Source", "data": [{"clickable": false, "text": "BSPR132-01091626"}]}
            }
        }, {
            "collapsible": true,
            "value": "12 February 1627",
            "data": {
                "place": {
                    "label": "City \/ Parish",
                    "data": [{"clickable": false, "text": "Brussels\/Onze-Lieve-Vrouw ter Kapelle"}]
                },
                "spouse": {
                    "label": "Spouse",
                    "data": [{
                        "clickable": true,
                        "text": "Susanna Tack",
                        "query-value": "10756",
                        "query-text": "Susanna Tack",
                        "query-type": "actor"
                    }]
                },
                "witnesses": {"label": "Witnesses", "data": []},
                "source": {"label": "Source", "data": [{"clickable": false, "text": "BSPR387-12021627"}]}
            }
        }],
        "value": null
    }, {
        "label": "Funeral",
        "type": "collapsible",
        "data": {
            "place": {"label": "City \/ Parish", "data": [{"clickable": false, "text": "Brussels\/Sint-Niklaas"}]},
            "source": {"label": "Source", "data": [{"clickable": false, "text": "BSPR155-10081655"}]}
        },
        "value": "10 August 1655"
    }, {"label": "Offspring", "type": "collapsible", "data": null, "value": null}, {
        "label": "Godchildren",
        "type": "collapsible",
        "data": null,
        "value": null
    }, {
        "label": "",
        "type": "timeline",
        "data": [{"date": "1605", "name": "Baptised"}, {"date": "1626", "name": "Married"}, {
            "date": "1627",
            "name": "Married"
        }, {"date": "1655", "name": "Buried"}],
        "value": null
    }, {"label": "Brussels (BRGA818)", "type": "header", "data": null, "value": null}, {
        "label": "Apprentice",
        "type": "section",
        "data": [],
        "value": null
    }, {
        "label": "Master",
        "type": "section",
        "data": [[{"clickable": false, "text": "15 May "}, {
            "clickable": true,
            "text": "1628",
            "query-value": "1628",
            "query-text": "1628",
            "query-type": "year"
        }, {"clickable": false, "text": " (master)"}]],
        "value": null
    }, {"label": "Dean", "type": "section", "data": [], "value": null}, {
        "label": "Teacher(s)",
        "type": "section",
        "data": [],
        "value": null
    }, {
        "label": "Student(s)",
        "type": "section",
        "data": [[{
            "clickable": true,
            "text": "Jan Claessens",
            "query-value": "511",
            "query-text": "Jan Claessens",
            "query-type": "actor"
        }, {"clickable": false, "text": " ("}, {
            "clickable": true,
            "text": "1643",
            "query-value": "1643",
            "query-text": "1643",
            "query-type": "year"
        }, {"clickable": false, "text": ")"}], [{
            "clickable": true,
            "text": "Ignatius Van den Stock",
            "query-value": "3227",
            "query-text": "Ignatius Van den Stock",
            "query-type": "actor"
        }, {"clickable": false, "text": " ("}, {
            "clickable": true,
            "text": "1653",
            "query-value": "1653",
            "query-text": "1653",
            "query-type": "year"
        }, {"clickable": false, "text": ")"}]],
        "value": null
    }, {
        "label": "Occupation(s)",
        "type": "section",
        "data": [[{"clickable": false, "text": "Painter"}]],
        "value": null
    }, {
        "label": "Father",
        "type": "section",
        "data": [[{
            "clickable": true,
            "text": "Gillis De Vadder",
            "query-value": "6212",
            "query-text": "Gillis De Vadder",
            "query-type": "actor"
        }]],
        "value": null
    }, {"label": "Children", "type": "section", "data": [], "value": null}, {
        "label": "Birthplace",
        "type": "section",
        "data": [[{"clickable": false, "text": "Brussels"}]],
        "value": null
    }, {
        "label": "",
        "type": "timeline",
        "data": [{"date": "1628", "name": "Became a master"}, {
            "date": "1643",
            "name": "Became a teacher of Jan Claessens"
        }, {"date": "1653", "name": "Became a teacher of Ignatius Van den Stock"}],
        "value": null
    }, {"label": "Antwerp (AASL201)", "type": "header", "data": null, "value": null}, {
        "label": null,
        "type": "one-liner",
        "data": "This actor is not mentioned in this source.",
        "value": null
    }];

    var expectedArray = [
            {
                ID: "6212",
                fullName: "Gillis De Vadder",
                index: 0,
                firstParent: undefined,
                isActor: true,
                spouse: undefined,
                vx: -0.0011080540545159786,
                vy: 0.00003967043399123217,
                x: 550.32462176775,
                y: 345.9710456311676
            },
            {
                ID: "7001",
                fullName: "Margriet Cockx",
                index: 1,
                isActor: true,
                firstParent: undefined,
                offSpringList: undefined,
                secondParent: undefined,
                spouse: undefined,
                vx: -0.0019232240692778108,
                vy: -0.0006226392510067764,
                x: 504.96600146553584,
                y: 388.87066512396837,
            },
            {
                ID: "10756",
                fullName: "Susanna Tack",
                index: 2,
                isActor: true,
                firstParent: undefined,
                offSpringList: undefined,
                secondParent: undefined,
                spouse: undefined,
                vx: -0.0008162872841842875,
                vy: -0.0011917184939574442,
                x: 412.54595695918186,
                y: 197.8747971043376,
            },
            {
                ID: "6212+7001",
                fullName: undefined,
                index: 3,
                isActor: false,
                firstParent: undefined,
                offSpringList: undefined,
                secondParent: undefined,
                spouse: undefined,
                vx: -0.001036816301355307,
                vy: -0.0006286921334803304,
                x: 503.7450984907762,
                y: 341.9051057655682,
            },
            {
                ID: "480+10756",
                fullName: undefined,
                index: 4,
                isActor: false,
                firstParent: undefined,
                offSpringList: undefined,
                secondParent: undefined,
                spouse: undefined,
                vx: -0.0007756274594878859,
                vy: -0.0010570971460722234,
                x: 437.45576798402107,
                y: 236.50622676234468,
            }, {
                ID: "480",
                fullName: "Louis De Vadder",
                index: 5,
                isActor: true,
                firstParent: {

                    ID: "6212",
                    fullName: "Gillis De Vadder",
                    index: 0,
                    firstParent: undefined,
                    isActor: true,
                    spouse: undefined,
                    secondParent: undefined,
                    offSpringList: undefined,
                    vx: -0.0011080540545159786,
                    vy: 0.00003967043399123217,
                    x: 550.32462176775,
                    y: 345.9710456311676

                },
                offSpringList: undefined,
                secondParent: {
                    ID: "7001",
                    fullName: "Margriet Cockx",
                    index: 1,
                    isActor: true,
                    firstParent: undefined,
                    offSpringList: undefined,
                    secondParent: undefined,
                    spouse: undefined,
                    vx: -0.0019232240692778108,
                    vy: -0.0006226392510067764,
                    x: 504.96600146553584,
                    y: 388.87066512396837,
                },
                spouse: {
                    ID: "10756",
                    fullName: "Susanna Tack",
                    index: 2,
                    isActor: true,
                    firstParent: undefined,
                    offSpringList: undefined,
                    secondParent: undefined,
                    spouse: undefined,
                    vx: -0.0008162872841842875,
                    vy: -0.0011917184939574442,
                    x: 412.54595695918186,
                    y: 197.8747971043376,
                },
                vx: -0.0008252294737181375,
                vy: -0.0008634566297184002,
                x: 470.9560680940928,
                y: 288.8678356793933,
            }
        ]
    ;
    jsonConversion.getCentralActor = jest.fn();
    jsonConversion.getCentralActor.mockReturnValueOnce(centralActorObject);

    // expect(jsonConversion.nodeList).toBe(expectedArray)
    expect(actorManagement.buildNodeList(centralActorObject)).toBe(expectedArray)


    // var sortedExpectedArray = expectedArray.sort(actorManagement.arraySort);
    // var sortedOutputArray = actorManagement.buildNodeList(inputObject).sort(actorManagement.arraySort);


});

test('buildNodeList creates a list out of an object with max degree of 1', () => {

    var expectedArray = [
        {
            ID: "0",
            fullName: "Central Object",
            depth: 0,
            firstParent: {
                ID: "1",
                fullName: "Parent One",
                depth: 1
            },
            spouse: {
                ID: "2",
                fullName: "The Spouse",
                depth: 1
            },

        }, {
            ID: "2",
            fullName: "The Spouse",
            depth: 1
        }, {
            ID: "1",
            fullName: "Parent One",
            depth: 1
        }];

    var inputObject = {
        ID: "0",
        fullName: "Central Object",
        firstParent: {
            ID: "1",
            fullName: "Parent One"
        },
        spouse: {
            ID: "2",
            fullName: "The Spouse"
        }
    }
    expect(actorManagement.buildNodeList(inputObject)).toEqual(expectedArray);


});

test('buildNodeList creates a list out of an object with max degree of 2', () => {

    var expectedArray = [
        {
            ID: "0",
            fullName: "Central Object",
            depth: 0,
            firstParent: {
                ID: "1",
                fullName: "Parent One",
                depth: 1,
                firstParent: {
                    ID: "3",
                    fullName: "GrandMa One",
                    depth: 2
                },
                secondParent: {
                    ID: "4",
                    fullName: "GrandPa One",
                    depth: 2
                }
                // offSpringList: [{
                //     ID: "0",
                //     fullName: "Central Object",
                //     depth: 0
                // }]
            },
            spouse: {
                ID: "2",
                fullName: "The Spouse",
                depth: 1
            },

        }, {
            ID: "2",
            fullName: "The Spouse",
            depth: 1
        }, {
            ID: "1",
            fullName: "Parent One",
            depth: 1,
            firstParent: {
                ID: "3",
                fullName: "GrandMa One",
                depth: 2
            },
            secondParent: {
                ID: "4",
                fullName: "GrandPa One",
                depth: 2
            }

        }, {
            ID: "3",
            fullName: "GrandMa One",
            depth: 2
        }, {
            ID: "4",
            fullName: "GrandPa One",
            depth: 2
        }];

    var inputObject = {
        ID: "0",
        fullName: "Central Object",
        firstParent: {
            ID: "1",
            fullName: "Parent One",
            firstParent: {
                ID: "3",
                fullName: "GrandMa One"
            },
            secondParent: {
                ID: "4",
                fullName: "GrandPa One",
            }
        },
        spouse: {
            ID: "2",
            fullName: "The Spouse"
        }
    };


    var sortedExpectedArray = expectedArray.sort(actorManagement.arraySort);
    var sortedOutputArray = actorManagement.buildNodeList(inputObject).sort(actorManagement.arraySort);


    expect(sortedOutputArray).toEqual(sortedExpectedArray);


});

test('buildNodeList creates a list out of an object with max degree of 3', () => {
    var expectedArray = [
        {
            ID: "0",
            fullName: "Central Object",
            depth: 0,
            firstParent: {
                ID: "1",
                fullName: "Parent One",
                depth: 1,
                firstParent: {
                    ID: "3",
                    fullName: "GrandMa One",
                    depth: 2
                },
                secondParent: {
                    ID: "4",
                    fullName: "GrandPa One",
                    depth: 2,
                    firstParent: {
                        ID: "5",
                        fullName: "GreatGrandMa One"
                    }
                }
            },
            spouse: {
                ID: "2",
                fullName: "The Spouse",
                depth: 1
            },
            offSpringList: [{
                ID: "6",
                fullName: "First Child",
                depth: 1,
                offSpringList: [{
                    ID: "8",
                    fullName: "First GrandChild",
                    depth: 2
                }]
            }, {
                ID: "7",
                fullName: "Second Child",
                depth: 1
            }]
        }, {
            ID: "2",
            fullName: "The Spouse",
            depth: 1
        }, {
            ID: "1",
            fullName: "Parent One",
            depth: 1,
            firstParent: {
                ID: "3",
                fullName: "GrandMa One",
                depth: 2,
            },
            secondParent: {
                ID: "4",
                fullName: "GrandPa One",
                depth: 2,
                firstParent: {
                    ID: "5",
                    fullName: "GreatGrandMa One"
                }
            }
        }, {
            ID: "3",
            fullName: "GrandMa One",
            depth: 2
        }, {
            ID: "4",
            fullName: "GrandPa One",
            depth: 2,
            firstParent: {
                ID: "5",
                fullName: "GreatGrandMa One"
            }
        }, {
            ID: "6",
            fullName: "First Child",
            depth: 1,
            offSpringList: [{
                ID: "8",
                fullName: "First GrandChild",
                depth: 2
            }]
        }, {
            ID: "7",
            fullName: "Second Child",
            depth: 1
        }, {
            ID: "8",
            fullName: "First GrandChild",
            depth: 2
        }];

    var inputObject = {
        ID: "0",
        fullName: "Central Object",
        firstParent: {
            ID: "1",
            fullName: "Parent One",
            firstParent: {
                ID: "3",
                fullName: "GrandMa One"
            },
            secondParent: {
                ID: "4",
                fullName: "GrandPa One",
                firstParent: {
                    ID: "5",
                    fullName: "GreatGrandMa One"
                }
            }
        },
        spouse: {
            ID: "2",
            fullName: "The Spouse"
        },
        offSpringList: [{
            ID: "6",
            fullName: "First Child",
            offSpringList: [{
                ID: "8",
                fullName: "First GrandChild",
            }]
        }, {
            ID: "7",
            fullName: "Second Child"
        }]
    };


    var sortedExpectedArray = expectedArray.sort(actorManagement.arraySort);
    var sortedOutputArray = actorManagement.buildNodeList(inputObject).actors.sort(actorManagement.arraySort);

    console.log(sortedOutputArray);

    expect(sortedOutputArray).toEqual(sortedExpectedArray);
});

test('TieList is created has list of ties for object with max degree of 3', () => {
    var expectedArray = [];
    expectedArray.push(
        new jsonConversion.Tie('0', '6', 'Offspring'),
        new jsonConversion.Tie('6', '8', 'Offspring'),
        new jsonConversion.Tie('0', '7', 'Offspring'),
        new jsonConversion.Tie('2', '7', 'Offspring'),
        new jsonConversion.Tie('2', '6', 'Offspring'),
        new jsonConversion.Tie('0', '2', 'Marriage'),
        new jsonConversion.Tie('1', '0', 'Offspring'),
        new jsonConversion.Tie('3', '1', 'Offspring'),
        new jsonConversion.Tie('4', '1', 'Offspring')
    );

    // {
    //     source: '6',
    //     target: '8',
    //     tieType: 'Offspring',
    //     tieStartYear: undefined,
    //     tieEndYear: undefined
    // },
    // {
    //     source: '0',
    //     target: '7',
    //     tieType: 'Offspring',
    //     tieStartYear: undefined,
    //     tieEndYear: undefined
    // },
    // {
    //     source: '0',
    //     target: '2',
    //     tieType: 'Marriage',
    //     tieStartYear: undefined,
    //     tieEndYear: undefined
    // },
    // {
    //     source: '1',
    //     target: '0',
    //     tieType: 'Offspring',
    //     tieStartYear: undefined,
    //     tieEndYear: undefined
    // },
    // {
    //     source: '3',
    //     target: '1',
    //     tieType: 'Offspring',
    //     tieStartYear: undefined,
    //     tieEndYear: undefined
    // },
    // {
    //     source: '4',
    //     target: '1',
    //     tieType: 'Offspring',
    //     tieStartYear: undefined,
    //     tieEndYear: undefined
    // }];

    var inputObject = {
        ID: "0",
        fullName: "Central Object",
        firstParent: {
            ID: "1",
            fullName: "Parent One",
            firstParent: {
                ID: "3",
                fullName: "GrandMa One"
            },
            secondParent: {
                ID: "4",
                fullName: "GrandPa One",
                firstParent: {
                    ID: "5",
                    fullName: "GreatGrandMa One"
                }
            }
        },
        spouse: {
            ID: "2",
            fullName: "The Spouse"
        },
        offSpringList: [{
            ID: "6",
            fullName: "First Child",
            offSpringList: [{
                ID: "8",
                fullName: "First GrandChild",
            }],
            firstParent: {
                ID: "0",
                fullName: "Central Object",
            },
            secondParent: {
                ID: "2",
                fullName: "The Spouse",
            }
        }, {
            ID: "7",
            fullName: "Second Child",
            firstParent: {
                ID: "0",
                fullName: "Central Object",
            },
            secondParent: {
                ID: "2",
                fullName: "The Spouse",
            }
        }]
    };


    var sortedExpectedArray = expectedArray.sort(actorManagement.arraySortByTwoColumns);
    var sortedOutputArray = actorManagement.buildNodeList(inputObject).ties.sort(actorManagement.arraySortByTwoColumns);

    console.log(sortedOutputArray);

    expect(sortedOutputArray).toEqual(sortedExpectedArray);
});

