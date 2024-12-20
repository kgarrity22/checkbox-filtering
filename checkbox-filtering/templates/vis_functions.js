


        var newData;
        var pie_clicked = [];
        var data;

        
        var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        // tooltip div
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        // Begin reading data from CSV
        d3.csv('https://raw.githubusercontent.com/kgarrity22/lupus-csv/main/lupus.csv', function (data) {
            
            data = data;
            
            // create the tabl
            var table = d3.select('.place').append("table");


            table = d3.selectAll("table");
            table.attr("id", "main-table");

            // when check is clicked - update all charts
            d3.selectAll(".checks").on("change", runall);
            
            // initial table creation
            updateTable(data);

            // initial pie creation
            var pie_data = createPieDataSets(data);
            drawPie(pie_data[0], "#pie_chart_1 .chart", 10, 100, 0, 0)
            drawPie(pie_data[1], "#pie_chart_2 .chart", 10, 100, 0, 0);
            drawPie(pie_data[2], "#pie_chart_3 .chart", 10, 100, 0, 0)



            // Returns data formatted and filtered for the table
            function filterData() {
                var selected = [];
                var industry_select = [];
                var status_select = [];
                var intervention_select = [];
                var oldData = data;


                d3.selectAll(".checks").each(function (d) {
                    check = d3.select(this);
                    if (check.property("checked")) {
                        if (check.property("value") == "Sponsor_Type") {
                            if (check.property("name") == "Industry") {
                                industry_select.push(check.property("name"));
                            } else {
                                industry_select.push("Other");
                                industry_select.push("U.S. Gov");
                            };
                        } else if (check.property("value") == "Status") {
                            status_select.push(check.property("name"));
                        } else if (check.property("value") == "Intervention_Types") {
                            intervention_select.push(check.property("name"));
                        };
                        selected.push(check.property("name"));
                    }


                });

                // console.log("industries:", industry_select);
                // console.log("statuses:", status_select);
                // console.log("interventions:", intervention_select);
                // console.log("selected: ", selected)

                var newlist = [];


                if (selected.length > 0) {
                    
                    newData = data.filter(function (d, i) {
                        var multi = [];

                        if (d.Intervention_Types !== undefined) {
                            // console.log("Intervention: ", d.Intervention_Types, typeof(d.Intervention_Types))
                            var multi = d.Intervention_Types.split(",");
                            //console.log("MULTI: ", multi);
                        }


                        if ((industry_select.indexOf(d.Sponsor_Type) !== -1 || industry_select.length == 0)
                            && (status_select.indexOf(d.Status) !== -1 || status_select.length == 0)) {
                            if (multi.length !== 0) {
                                if (intervention_select.some(item => (multi.indexOf(item) >= 0)) || intervention_select.length == 0) {
                                    // console.log(multi.some(item => (intervention_select.includes(item))));
                                    // console.log("Intervention and multi compare: ", intervention_select, ",", multi)
                                    newlist.push(d)
                                    return newlist
                                }
                            } else if ((intervention_select.indexOf(d.Intervention_Types) !== -1 || intervention_select.length == 0)) {
                                newlist.push(d)
                                return newlist
                            }
                        } else {
                            return
                        }
                    });

                } else {
                    newData = data;
                }

                if (newData.length==0){
                    window.alert("Nope data");
                    
                    return oldData;
                }
                else {
                    console.log("NEW data for the end :", newData)
                    return newData;
                }

                
                
            }// end of filter data


            // Displays newData in the table
            function updateTable(newData) {

                    // empty row is added because the top row kept sticking to the table and not disappearing on refresh
                    newData.unshift({ "Status": "", "Sponsor_Type": "", "Intervention_Types": "" })


                    var columns = ["Sponsor", "Sponsor Type", "Interventions", "Intervention Types", "Status", "NCT", "Start Year", "Title", "Phase", "Primary Outcome"]
                    
                    // create the table headers
                    thead = table.selectAll("th")
                        .data(columns).enter()
                        .append("th")
                        .text(function (d) {
                            //console.log(d);
                            return d;
                        })
                        .append("i")
                        .attr("class", "fas fa-sort")

                    // when a header is clicked, sort by that column
                    thead.on("click", function (d, i) {
                        return sortTable(i);
                    })

                    newRows = table.selectAll("tr")
                        .data(newData, function (d) {
                            return d;
                        })

                    
                    newRows.enter()
                        .append("tr")
                        .attr("class", function (d) {
                            // this adds a class attribute to the empty row so we can hide it in the css
                            if (d.Sponsor_Type=="" && d.Intervention_Types == "" && d.Status=="") {
                                return "empty-row";
                            } else {
                                return;
                            }
                        })
                        .selectAll("td")
                        .data(function (row) {
                            return data.columns.map(function (column) {
                                return {
                                    column: column,
                                    value: row[column]
                                };
                            })
                        })
                        .enter()
                        .append("td")
                        .append("div")
                        .attr("class", "scrollable")
                        .text(function (d) {
                           
                            return d.value;
                        });


                    newRows.exit()
                        .remove();

            }; // end of create table


            // takes an integer to tell us which column to look at and sorts the table on that column
            // ** this could be improved with a faster sorting algorithm
            function sortTable(n) {
                
                var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;

                table = document.getElementById("main-table");
                console.log("Table: ", table)
                switching = true;
                // Set the sorting direction to ascending:
                dir = "asc";
                

                while (switching) {
                    
                    switching = false;
                    rows = table.rows;
                    
                    // loop through all rows except headers
                    for (i = 1; i < (rows.length - 1); i++) {
                        
                        shouldSwitch = false;
                        
                        x = rows[i].getElementsByTagName("TD")[n];
                        y = rows[i + 1].getElementsByTagName("TD")[n];
                        

                        if (dir == "asc") {
                            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                                // If so, mark as a switch and break the loop:
                                shouldSwitch = true;
                                break;
                            }
                        } else if (dir == "desc") {
                            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                                // If so, mark as a switch and break the loop:
                                shouldSwitch = true;
                                break;
                            }
                        }
                    }
                    if (shouldSwitch) {
                        
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        switching = true;
                        switchcount++;

                    } else {
        
                        if (switchcount == 0 && dir == "asc") {
                            dir = "desc";
                            switching = true;
                        }
                    }
                }
            } // end of sort table



            // Returns list containing data set formatted for each pie
            function createPieDataSets(data) {
                var status = {};
                console.log("DATA in pie data: ", data)
                for (i = 0; i < data.length; i++) {
                    if (data[i].Status in status) {
                        status[data[i].Status] += 1;
                    } else {
                        status[data[i].Status] = 1;
                    }
                }

                var sponsors = {};
                for (i = 0; i < data.length; i++) {
                    if (data[i].Sponsor_Type in sponsors) {
                        sponsors[data[i].Sponsor_Type] += 1;
                    } else {
                        sponsors[data[i].Sponsor_Type] = 1;
                    }
                }

                var interventions = {}
                for (i = 0; i < data.length; i++) {
                    if (data[i].Intervention_Types.indexOf(',') > -1) {

                        var multi = data[i].Intervention_Types.split(", ");

                        for (var item of multi) {
                            if (item in interventions) {
                                interventions[item] += 1;
                            } else {
                                interventions[item] = 1;
                            }
                        }
                    } else if (data[i].Intervention_Types in interventions) {
                        interventions[data[i].Intervention_Types] += 1;
                    } else {
                        interventions[data[i].Intervention_Types] = 1;
                    }
                }
                
                sponsor_set = []
                intervention_set = []
                status_set = []


                
                for (var p = 0; p < Object.keys(sponsors).length; p++) {
                    var sponsor = {}
                    sponsor[Object.keys(sponsors)[p]] = Object.values(sponsors)[p];
                    sponsor_set.push(sponsor);
                }
               

                for (var j = 0; j < Object.keys(status).length; j++) {

                    var stats = {}
                    stats[Object.keys(status)[j]] = Object.values(status)[j];
                    status_set.push(stats);
                }
                

                for (var k = 0; k < Object.keys(interventions).length; k++) {
                    var intervention = {}
                    intervention[Object.keys(interventions)[k]] = Object.values(interventions)[k];
                    intervention_set.push(intervention);
                    
                }
               

                //console.log("filter pie: sponsors", sponsor_set,  " statuses ", status_set, "interventions ", intervention_set)
                
                return ([sponsor_set, status_set, intervention_set]);
            } // end of create pie data
            

            // takes a dataset and draws the pies
            function drawPie(dataSet, selectString, margin, outerRadius, innerRadius) {
                if (dataSet.length==0) {
                    dataSet=newData;
                    console.log("dataset: ", dataSet)
                    return;
                } else {


                    var color = d3.scaleOrdinal(d3.schemeCategory20c);

                    // if the data has any empty rows in it, remove it
                    if (Object.keys(dataSet[0]) == "") {
                        dataSet.shift(0);
                    }


                    var canvasWidth = 700;
                    var pieWidthTotal = outerRadius * 2;;
                    var pieCenterX = outerRadius + margin / 2;
                    var pieCenterY = outerRadius + margin / 2;

                    var legendBulletOffset = 30;
                    var legendVerticalOffset = outerRadius - margin;
                    var legendTextOffset = 20;
                    var textVerticalSpace = 20;

                    var canvasHeight = 0;
                    var pieDrivenHeight = outerRadius * 2 + margin * 2;
                    var legendTextDrivenHeight = (dataSet.length * textVerticalSpace) + margin * 2;

                    if (pieDrivenHeight >= legendTextDrivenHeight) {
                        canvasHeight = pieDrivenHeight;
                    }
                    else {
                        canvasHeight = legendTextDrivenHeight;
                    }
                    

                    var x = d3.scale.linear().domain([0, d3.max(dataSet, function (d) { return Object.values(d)[0]; })]).rangeRound([0, pieWidthTotal]);
                    var y = d3.scale.linear().domain([0, Object.keys(dataSet).length]).range([0, (Object.keys(dataSet).length * 20)]);


                    var tweenPie = function (b) {
                        b.innerRadius = 0;
                        var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
                        return function (t) {
                            return arc(i(t));
                        };
                    }

                    
                    var canvas = d3.select(selectString)
                        .append("svg:svg") 
                        .data([dataSet]) 
                        .attr("width", canvasWidth) 
                        .attr("height", canvasHeight) 
                        .append("svg:g") 
                        .attr("transform", "translate(" + pieCenterX + "," + pieCenterY + ")") 

                    // Define an arc generator
                    var arc = d3.svg.arc()
                         
                        .outerRadius(outerRadius);

                    
                    var pie = d3.layout.pie()
                        .value(function (d) { return Object.values(d)[0]; })

                    
                    var arcs = canvas.selectAll("g.slice")
                        .data(pie)
                        .enter().append("svg:a")
                        
                        .append("svg:g")
                        .attr("class", "slice")   
                        .style("stroke", "White")
                        .attr("d", arc);



                    arcs.append("svg:path")

                        // This creates the actual SVG path using the associated data (pie) with the arc drawing function
                        .attr("fill", function (d, i) { return color(i); })
                        .attr("color_value", function (d, i) { return color(i); }) // Bar fill color...
                        .attr("index_value", function (d, i) { return "index-" + i; })
                        .style("stroke", "White")
                        .attr("d", arc)
                        .on("mouseover", function (d) {
                            
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            
                            div.html("Type: " + Object.keys(d.data)[0] + "<br/> Total: " + Object.values(d.data)[0])
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                        })
                        .on("mouseout", function (d) {
                            
                            div.transition()
                                .duration(500)
                                .style("opacity", 0);
                        })
                        .transition()
                        .duration(1500)
                        .delay(function (d, i) { return i * 50; })
                        .attrTween("d", tweenPie);

                    function angle(d) {
                        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                        return a > 90 ? a - 180 : a;
                    }

                    var legend = canvas.selectAll(".legend")
                        .data(color.domain())
                        .enter()
                        .append("g")
                        .attr("class", "legend")

                    legend.selectAll("rect")
                        .data(dataSet)
                        .enter()
                        .append("rect")
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("x", function (d, i) {
                            return 110;
                        })
                        .attr("y", function (d, i) {
                            return (i * 20) - 60;
                        })
                        .attr("class", function (d, i) {

                            if (Object.keys(d)[0] == "") {

                                return "legend0";
                            } else {
                                return "non-legend";
                            }
                        })
                        .style("fill", function (d, i) {
                            return color(i)
                        });
                    

                    legend.selectAll("text")
                        .data(dataSet)
                        .enter()
                        .append("text")
                        .attr("x", function (d, i) {
                            return 120;
                        })
                        .attr("y", function (d, i) {
                            return (i * 20) - 50;
                        })
                        .text(function (d) {
                            
                            return Object.keys(d)[0];
                        })
                        .style("font-size", 12)

                    // executes when a pie section is clicked
                    arcs.on("click", function (d, i) {
                       
                        var input = Object.keys(d.data)[0];
                        
                        if (pie_clicked.length > 1) {
                            pie_clicked = [];
                        }

                        if (pie_clicked.indexOf(input) == -1) {
                            pie_clicked.push(input);
                        } else {
                            pie_clicked = pie_clicked.filter(function (d) {
                                return d !== input;
                            })
                        }
                        
                        var newdata = filterPie(pie_clicked)
                        var new_pie = createPieDataSets(newdata);

                        d3.selectAll(".chart").remove();
                        d3.selectAll(".div_RootBody").append("div").attr("class", "chart");


                        drawPie(new_pie[0], "#pie_chart_1 .chart", 10, 100, 0, 0)
                        drawPie(new_pie[1], "#pie_chart_2 .chart", 10, 100, 0, 0)
                        drawPie(new_pie[2], "#pie_chart_3 .chart", 10, 100, 0, 0)

                        updateTable(newData);


                    })
                }
            }; // end of drawPie


                
            // Takes a list of what pie sections have been clicked
            // Returns a filtered dataset based on those sections
            function filterPie(filterOn) {
                
                console.log("Filter on: ", filterOn)
                if (filterOn.length==0){
                    newData = data;
                }
                else if (filterOn.length > 1) {
                    newData = data.filter(function (d, i) {
                        if ((d.Status == filterOn[0] || d.Intervention_Types == filterOn[0] || d.Sponsor_Type == filterOn[0]) && (d.Status == filterOn[1] || d.Intervention_Types == filterOn[1] || d.Sponsor_Type == filterOn[1])) {
                            return d;
                        } else {
                            return;
                        }
                    })
                } else {
                    newData = data.filter(function (d, i) {
                        if (d.Status == filterOn || d.Intervention_Types == filterOn || d.Sponsor_Type == filterOn) {
                            return d;
                        } else {
                            return;
                        }
                    });
                }
                
                return newData;

            } // end of filter Pie


            // the function that runs when a checkbox is clicked 
            function runall() {

                d3.selectAll(".chart").remove();
                d3.selectAll(".div_RootBody").append("div").attr("class", "chart");

                updated = filterData();
                if (updated.length == 0){
                    window.alert("There are no trials matching your selection")
                    return;
                } else {
                    updateTable(updated);
                    updated.shift()
                    console.log("UPDATED NEW removed: ", updated)
                    var pie_data = createPieDataSets(updated);
                    drawPie(pie_data[0], "#pie_chart_1 .chart", 10, 100, 0, 0)
                    drawPie(pie_data[1], "#pie_chart_2 .chart", 10, 100, 0, 0);
                    drawPie(pie_data[2], "#pie_chart_3 .chart", 10, 100, 0, 0)
                }
                
            }

            
        });

