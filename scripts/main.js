const jsonConversion = require('./jsonConversion.js');
const actorManagement = require('./actorManagement.js');


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


var simulation;
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);


function drawGraph(data) {

    var graph = {};
    graph["nodes"] = data.actors;
    graph["links"] = data.ties;

    // ORIGINAL -- GO BACK TO

    // simulation = d3.forceSimulation()
    //     .force("link", d3.forceLink().id(function (d) {
    //         return "" + d.ID;
    //     }))
    //     .force("charge", d3.forceManyBody().strength(-400))
    //     .force("center", d3.forceCenter(width / 2, height / 2))
    //     .force("distanceMin", 100);


    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.ID;
        }).distance(60).strength(1))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));


    // graph.nodes.filter(function (d) {
    //     if (d.ID === 0) {
    //         d.fy = height / 2;
    //     }
    // });

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("height", 300)
        .attr("fx", function (d) {
            // if (d.isActor) {
            d.fx = 500 + d.treeDepth * 200;
            // }
        })
    ;


    var rectangle = node.append("rect")
        .attr("width", function (d) {
            if (d.isActor) {
                return 60;
            }
            else return 0;
        })
        .attr("height", 6)
        .attr("x", -15)
        .attr("y", -3)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var labels = node.append("text")
        .text(function (d) {
            if (d.isActor) {
                var actorData = data.objects.filter(x => x.ID === d.ID);

                return (actorData[0].fullName);
            }
            // else return d.ID;
        })
        .attr('x', -10)
        .attr('y', -5);


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}


// getActors(4);
// getActors(42);
// getActors(480);

var centralActor = actorManagement.getCentralActor("490");

console.log(actorManagement.buildNodeList(centralActor));
drawGraph(actorManagement.data);

