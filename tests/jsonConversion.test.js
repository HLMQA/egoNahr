var jsonConversion;

beforeEach(() => {
    jest.resetModules();
    jsonConversion = require('../scripts/jsonConversion.js');

})

test('search in an empty array doesnt return anything', () => {
        expect(jsonConversion.search("foo", [])).toBe(null);
    }
);

test('search in an array returns expected object', () => {
    var expectedObject = {label: "foo"};
    var testArray = [{label: "Name"}, {}, expectedObject];
    expect(jsonConversion.search(expectedObject.label, testArray)).toBe(expectedObject);
});


test('search for empty label doesnt return anything', () => {
    var testArray = [{label: "Name"}, {}];
    expect(jsonConversion.search("", testArray)).toBe(null);
});


test('when search returns null, checklabelexistence also returns null', () => {
        jsonConversion.search = jest.fn();
        jsonConversion.search.mockReturnValueOnce(null);
        expect(jsonConversion.checkLabelExistence("foo", [])).toBe(null);
    }
);


test('when search returns object with empty data field, checklabelexistence returns null', () => {
        var returnedObject = {label: "Marriage", type: "list", data: null, value: null};
        jsonConversion.search = jest.fn();
        jsonConversion.search.mockReturnValueOnce(returnedObject);
        expect(jsonConversion.checkLabelExistence("Marriage", [returnedObject])).toBe(null);
    }
);


test('checkLabelExistence finds label and returns expected object', () => {
    var returnedObject = {label: "Marriage", type: "list", data: "data-value", value: null};
    var testArray = [{label: "Name"}, {}, returnedObject];
    jsonConversion.search = jest.fn();
    jsonConversion.search.mockReturnValueOnce(returnedObject);
    expect(jsonConversion.checkLabelExistence("Marriage", testArray)).toBe(returnedObject);
});


test('getActorData returns simple object with the input ID', () => {
    var expectedJSONObject = new jsonConversion.Node("id", "Full Name", null, null, null, null);
    var returnedJSONObject = [{
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
    jsonConversion.getJSON = jest.fn();
    jsonConversion.getJSON.mockReturnValueOnce(returnedJSONObject);
    expect(jsonConversion.getActorData("id")).toEqual(expectedJSONObject);
});

test('getActorData returns complex object with the input ID', () => {
    var expectedJSONObject = new jsonConversion.Node("id", "Antoon Sallaert",
        new jsonConversion.Node("6187", "Philips Sallaert"),
        new jsonConversion.Node("6973", "Anna Van den Berghen"),
        null,
        [new jsonConversion.Node("6976", "Philips Sallaert"),
            new jsonConversion.Node("6980", "Anna Sallaert"),
            new jsonConversion.Node("6983", "Carola Adriana Sallaert"),
            new jsonConversion.Node("6984", "Catharina Sallaert"),
            new jsonConversion.Node("6987", "Elisabeth Sallaert"),
            new jsonConversion.Node("6989", "Antoon Sallaert"),
            new jsonConversion.Node("6991", "Gaspar Sallaert"),
            new jsonConversion.Node("6994", "Maria Sallaert")]);

    var returnedJSONObject = [{
        "label": "Name",
        "type": "section",
        "data": [
            [{
                "clickable": false,
                "text": "Antoon Sallaert"
            }]
        ],
        "value": null
    }, {
        "label": "Parish Records",
        "type": "header",
        "data": null,
        "value": null
    }, {
        "label": "Baptism",
        "type": "collapsible",
        "data": {
            "place": {
                "label": "City \/ Parish",
                "data": [{
                    "clickable": false,
                    "text": "Brussels\/Onze-Lieve-Vrouw ter Kapelle"
                }]
            },
            "parents": {
                "label": "Parents",
                "data": [{
                    "clickable": true,
                    "text": "Philips Sallaert",
                    "query-value": "6187",
                    "query-text": "Philips Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " and "
                }, {
                    "clickable": true,
                    "text": "Anna Van den Berghen",
                    "query-value": "6973",
                    "query-text": "Anna Van den Berghen",
                    "query-type": "actor"
                }]
            },
            "godparents": {
                "label": "Godparents",
                "data": [{
                    "clickable": true,
                    "text": "Antoon Sallaert",
                    "query-value": "6974",
                    "query-text": "Antoon Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " and "
                }, {
                    "clickable": true,
                    "text": "Lynke Donckers",
                    "query-value": "6975",
                    "query-text": "Lynke Donckers",
                    "query-type": "actor"
                }]
            },
            "substitute-godparents": {
                "label": "Substitute Godparents",
                "data": []
            },
            "source": {
                "label": "Source",
                "data": [{
                    "clickable": false,
                    "text": "BSPR329-27111594"
                }]
            }
        },
        "value": "27 November 1594"
    }, {
        "label": "Marriage",
        "type": "list",
        "data": null,
        "value": null
    }, {
        "label": "Funeral",
        "type": "collapsible",
        "data": {
            "place": {
                "label": "City \/ Parish",
                "data": [{
                    "clickable": false,
                    "text": "Brussels\/Onze-Lieve-Vrouw ter Kapelle"
                }]
            },
            "source": {
                "label": "Source",
                "data": [{
                    "clickable": false,
                    "text": "BSPR428-12061650"
                }]
            }
        },
        "value": "12 June 1650"
    }, {
        "label": "Offspring",
        "type": "collapsible",
        "data": {
            "offsprings": {
                "label": "Names",
                "data": [{
                    "clickable": true,
                    "text": "Philips Sallaert",
                    "query-value": "6976",
                    "query-text": "Philips Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1626",
                    "query-value": "1626",
                    "query-text": "1626",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Anna Sallaert",
                    "query-value": "6980",
                    "query-text": "Anna Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1628",
                    "query-value": "1628",
                    "query-text": "1628",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Carola Adriana Sallaert",
                    "query-value": "6983",
                    "query-text": "Carola Adriana Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1630",
                    "query-value": "1630",
                    "query-text": "1630",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Catharina Sallaert",
                    "query-value": "6984",
                    "query-text": "Catharina Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1633",
                    "query-value": "1633",
                    "query-text": "1633",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Elisabeth Sallaert",
                    "query-value": "6987",
                    "query-text": "Elisabeth Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1635",
                    "query-value": "1635",
                    "query-text": "1635",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Antoon Sallaert",
                    "query-value": "6989",
                    "query-text": "Antoon Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1637",
                    "query-value": "1637",
                    "query-text": "1637",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Gaspar Sallaert",
                    "query-value": "6991",
                    "query-text": "Gaspar Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1640",
                    "query-value": "1640",
                    "query-text": "1640",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Maria Sallaert",
                    "query-value": "6994",
                    "query-text": "Maria Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1643",
                    "query-value": "1643",
                    "query-text": "1643",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }]
            }
        },
        "value": "8"
    }, {
        "label": "Godchildren",
        "type": "collapsible",
        "data": {
            "godchildren": {
                "label": "Name(s)",
                "data": [{
                    "clickable": true,
                    "text": "Barbara Sallaert",
                    "query-value": "9400",
                    "query-text": "Barbara Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1641",
                    "query-value": "1641",
                    "query-text": "1641",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }, {
                    "clickable": false,
                    "text": ", "
                }, {
                    "clickable": true,
                    "text": "Antoon Francois Sallaert",
                    "query-value": "9558",
                    "query-text": "Antoon Francois Sallaert",
                    "query-type": "actor"
                }, {
                    "clickable": false,
                    "text": " ("
                }, {
                    "clickable": true,
                    "text": "1648",
                    "query-value": "1648",
                    "query-text": "1648",
                    "query-type": "year"
                }, {
                    "clickable": false,
                    "text": ")"
                }]
            }
        },
        "value": 2
    }, {
        "label": "",
        "type": "timeline",
        "data": [{
            "date": "1594",
            "name": "Baptised"
        }, {
            "date": "1650",
            "name": "Buried"
        }, {
            "date": "1626",
            "name": "Parent of Philips Sallaert"
        }, {
            "date": "1628",
            "name": "Parent of Anna Sallaert"
        }, {
            "date": "1630",
            "name": "Parent of Carola Adriana Sallaert"
        }, {
            "date": "1633",
            "name": "Parent of Catharina Sallaert"
        }, {
            "date": "1635",
            "name": "Parent of Elisabeth Sallaert"
        }, {
            "date": "1637",
            "name": "Parent of Antoon Sallaert"
        }, {
            "date": "1640",
            "name": "Parent of Gaspar Sallaert"
        }, {
            "date": "1643",
            "name": "Parent of Maria Sallaert"
        }, {
            "date": "1641",
            "name": "Godparent of Barbara Sallaert"
        }, {
            "date": "1648",
            "name": "Godparent of Antoon Francois Sallaert"
        }],
        "value": null
    }, {
        "label": "Brussels (BRGA818)",
        "type": "header",
        "data": null,
        "value": null
    }, {
        "label": "Apprentice",
        "type": "section",
        "data": [
            [{
                "clickable": false,
                "text": "14 April "
            }, {
                "clickable": true,
                "text": "1606",
                "query-value": "1606",
                "query-text": "1606",
                "query-type": "year"
            }]
        ],
        "value": null
    }, {
        "label": "Master",
        "type": "section",
        "data": [
            [{
                "clickable": false,
                "text": "20 August "
            }, {
                "clickable": true,
                "text": "1613",
                "query-value": "1613",
                "query-text": "1613",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": " (master)"
            }]
        ],
        "value": null
    }, {
        "label": "Dean",
        "type": "section",
        "data": [
            [{
                "clickable": true,
                "text": "1633",
                "query-value": "1633",
                "query-text": "1633",
                "query-type": "year"
            }],
            [{
                "clickable": true,
                "text": "1646",
                "query-value": "1646",
                "query-text": "1646",
                "query-type": "year"
            }],
            [{
                "clickable": true,
                "text": "1647",
                "query-value": "1647",
                "query-text": "1647",
                "query-type": "year"
            }]
        ],
        "value": null
    }, {
        "label": "Teacher(s)",
        "type": "section",
        "data": [
            [{
                "clickable": true,
                "text": "Michiel De Bordeaux",
                "query-value": "6059",
                "query-text": "Michiel De Bordeaux",
                "query-type": "actor"
            }]
        ],
        "value": null
    }, {
        "label": "Student(s)",
        "type": "section",
        "data": [
            [{
                "clickable": true,
                "text": "Hans De Sanmore",
                "query-value": "6918",
                "query-text": "Hans De Sanmore",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1613",
                "query-value": "1613",
                "query-text": "1613",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Bartholomeus Dandelot",
                "query-value": "6739",
                "query-text": "Bartholomeus Dandelot",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1617",
                "query-value": "1617",
                "query-text": "1617",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Melchior Sallaert",
                "query-value": "5537",
                "query-text": "Melchior Sallaert",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1621",
                "query-value": "1621",
                "query-text": "1621",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Daniel De Duck",
                "query-value": "6382",
                "query-text": "Daniel De Duck",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1626",
                "query-value": "1626",
                "query-text": "1626",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Johan Baptist Sallaert",
                "query-value": "3038",
                "query-text": "Johan Baptist Sallaert",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1629",
                "query-value": "1629",
                "query-text": "1629",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Robert Dandelot",
                "query-value": "3089",
                "query-text": "Robert Dandelot",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1632",
                "query-value": "1632",
                "query-text": "1632",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Philips Jan Willeman",
                "query-value": "5888",
                "query-text": "Philips Jan Willeman",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1637",
                "query-value": "1637",
                "query-text": "1637",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Hendrick Van Leeuw",
                "query-value": "3012",
                "query-text": "Hendrick Van Leeuw",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1644",
                "query-value": "1644",
                "query-text": "1644",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Jan Van den Steen",
                "query-value": "3112",
                "query-text": "Jan Van den Steen",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1649",
                "query-value": "1649",
                "query-text": "1649",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }],
            [{
                "clickable": true,
                "text": "Gelaude Fige",
                "query-value": "3125",
                "query-text": "Gelaude Fige",
                "query-type": "actor"
            }, {
                "clickable": false,
                "text": " ("
            }, {
                "clickable": true,
                "text": "1650",
                "query-value": "1650",
                "query-text": "1650",
                "query-type": "year"
            }, {
                "clickable": false,
                "text": ")"
            }]
        ],
        "value": null
    }, {
        "label": "Occupation(s)",
        "type": "section",
        "data": [
            [{
                "clickable": false,
                "text": "Painter"
            }]
        ],
        "value": null
    }, {
        "label": "Father",
        "type": "section",
        "data": [
            [{
                "clickable": true,
                "text": "Philips Sallaert",
                "query-value": "6187",
                "query-text": "Philips Sallaert",
                "query-type": "actor"
            }]
        ],
        "value": null
    }, {
        "label": "Children",
        "type": "section",
        "data": [],
        "value": null
    }, {
        "label": "Birthplace",
        "type": "section",
        "data": [
            [{
                "clickable": false,
                "text": "Brussels"
            }]
        ],
        "value": null
    }, {
        "label": "",
        "type": "timeline",
        "data": [{
            "date": "1606",
            "name": "Became an apprentice"
        }, {
            "date": "1613",
            "name": "Became a teacher of Hans De Sanmore"
        }, {
            "date": "1633",
            "name": "Became a dean"
        }, {
            "date": "1646",
            "name": "Became a dean"
        }, {
            "date": "1647",
            "name": "Became a dean"
        }, {
            "date": "1617",
            "name": "Became a teacher of Bartholomeus Dandelot"
        }, {
            "date": "1621",
            "name": "Became a teacher of Melchior Sallaert"
        }, {
            "date": "1626",
            "name": "Became a teacher of Daniel De Duck"
        }, {
            "date": "1629",
            "name": "Became a teacher of Johan Baptist Sallaert"
        }, {
            "date": "1632",
            "name": "Became a teacher of Robert Dandelot"
        }, {
            "date": "1637",
            "name": "Became a teacher of Philips Jan Willeman"
        }, {
            "date": "1644",
            "name": "Became a teacher of Hendrick Van Leeuw"
        }, {
            "date": "1649",
            "name": "Became a teacher of Jan Van den Steen"
        }, {
            "date": "1650",
            "name": "Became a teacher of Gelaude Fige"
        }],
        "value": null
    }, {
        "label": "Antwerp (AASL201)",
        "type": "header",
        "data": null,
        "value": null
    }, {
        "label": null,
        "type": "one-liner",
        "data": "This actor is not mentioned in this source.",
        "value": null
    }];
    jsonConversion.getJSON = jest.fn();
    jsonConversion.getJSON.mockReturnValueOnce(returnedJSONObject);
    expect(jsonConversion.getActorData("id")).toEqual(expectedJSONObject);
})
;


//
// test('getActorData returns null the json object doesnt contain a name', ()=>{
//     var jsonObject = [{label: "Name", type: "section", data: null, value: null},
//         {label: "Parish Records", type: "header", data: null, value: null},
//         {label: "Baptism", type: "collapsible", data: null, value: "27 November 1594"}];
//
//     jsonConversion.getJSON = jest.fn();
//     jsonConversion.getJSON.mockReturnValueOnce(jsonObject);
//     expect(jsonConversion.getActorData("id").toBe(null);
// })



