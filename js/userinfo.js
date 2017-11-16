var userInfo = {
	"courses": [
		{
			"name": "Example 1101",
			"credits": 3,
			"assignments": [
				{
					"title": "Assignment 1",
					"weight": "",
					"grade": "",
					"percent": "",
				}
			]	
		}
	]
}

// ---------- FUNCTIONS ---------- //

function decToPct(n) {
// Turn a decimal (float) into a percentage (string)
	return String((n*100).toFixed(2))+"%";
}

function pctToDec(p) {
// Turn a percentage (string) into a decimal (float)
	return parseFloat(p.replace('%', ''))/100;
}

function fracToDec(f) {
// Turn a fraction into a decimal
	var parts = f.split("/");
	return (parts[0]/parts[1]).toFixed(2);
}

function makeTable(id, name, credits) {
// Make a new table for a given id
// Containing div has id: #course[id]
// Table has id: #table[id]
	$code = "<div class='coursetable' id='course"+id+"'>" +
	"<h2>Grades for: <input class='name' placeholder='Course Name' value='"+name+"'>" +
	" &nbsp;&nbsp;Credits: <input class='credits' placeholder='3 or 4' value='"+credits+"'></h2>" +
	"<table id='table"+id+"'><thead><tr><td>Assignment</td><td>Weight</td><td>My Grade</td>" +
	"<td>My %</td><td>Weighted %</td><td>Actions</td></tr></thead>" +
	"<tfoot><tr><td colspan=4>Total</td><td class='total'>Weighted %</td></tr></tfoot>" +
	"<tbody></tbody></table><a href='#' class='add'>+ Add Assignment</a></div>";
	$("#courseinfo").append($code);
}

function listAssignments(userinfo, id) {
// List all of a course's assignments and related data in the table
// Rows have id #row[id][j] where id is the given id and j is the row number - 1
	numA = userinfo['courses'][id]['assignments'].length;
	weightedTotal = 0;
	for (j=0; j<numA; j++) {
		A = userinfo['courses'][id]['assignments'][j];
		var title = A['title'];
		var weight = A['weight'];
		var grade = A['grade'];
		var percent = A['percent'];
		$newRow = "<tr class='aRow' id='row"+id+j+"'>" +
			"<td><input type='text' class='title' placeholder='Title'></td>" +
			"<td><input type='text' class='weight'  placeholder='0.00'></td>" +
			"<td><input type='text' class='grade' placeholder='00/00'></td>" +
			"<td><input type='text' class='percent' placeholder='0.00'></td>" +
			"<td class='weighted'>0.00%</td>" +
			"<td><a href='#' class='delete'>delete</a></td>" +
			"</tr>";
		$("#table"+id).append($newRow);
		$("#table"+id+" #row"+id+j+" .title").val(title);
		$("#table"+id+" #row"+id+j+" .weight").val(weight);
		$("#table"+id+" #row"+id+j+" .grade").val(grade);
		$("#table"+id+" #row"+id+j+" .percent").val(percent);
		$("#table"+id+" #row"+id+j+" .weighted").text(decToPct(weight*percent));
		weightedTotal += (weight * percent);
	}
	$("#table"+id+" tfoot .total").text(decToPct(weightedTotal));
}

function updateTotal(id) {
// Update the total displayed in the footer
	weightedTotal = 0;
	$("#"+id+" .weighted").each(function() {
		$w = $(this).text();
		$w = pctToDec($w);
		weightedTotal += $w;
	});
	$("#"+id+" tfoot .total").text(decToPct(weightedTotal));
}

function incrementRowId(row) {
// Return a row id that is one more than the one specified
	$rowId = row.attr("id").slice(3);
	$tableId = row.parent().parent().attr("id").slice(5);
	$oldRowNum = $rowId.replace($tableId, "");
	$newRowNum = parseInt($oldRowNum) + 1;
	$newRowId = "row" + $tableId + String($newRowNum);
	return $newRowId;
}

function setJSONCookie(cname, cvalue, exdays) {
    var d = new Date();
    cvalue = JSON.stringify(cvalue);
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getJSONCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
        	cvalue = c.substring(name.length,c.length);
        	return JSON.parse(cvalue);
        }
    }
    return "";
}

function checkCookie(cname) {
    var x=getJSONCookie(cname);
    if (x!="") {
        return x;
    } 
    return false;
}

// ---------- CODE THAT RUNS WHEN PAGE IS LOADED ---------- //

$(document).ready(function() {

	// Load course info
	loggedInfo = checkCookie("userdata");
	if (loggedInfo) {
		x = getJSONCookie("userdata");
	} else {
		x = userInfo;
	}
	
	numCourses = x['courses'].length;
	for (i=0; i<numCourses; i++) {
		makeTable(i, x['courses'][i]['name'], x['courses'][i]['credits']);
		listAssignments(x, i);
	}
	
	$(".coursetable:not(:first)").hide();
	
	// Populate the sidebar
	numCourses = x['courses'].length;
	for (i=0; i<numCourses; i++) {
		var name = x['courses'][i]['name'];
		
		$("#sidebar #courselist").append("<div class='course' name='"+i+"'>"+name+"</div>");
	}
	
	// Display course info on click
	$("#sidebar").delegate(".course", "click", function() {
		var cId = $(this).attr("name");
		$(".coursetable").each(function() {
			if ($(this).attr("id") == "course"+cId) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	});
	
	// Change course name 
	$("#courseinfo").delegate("input.name", "change", function() {
		$id = $(this).parent().parent().attr("id").slice(6);
		$newName = $(this).val();
		$("#courselist .course").each(function() {
			if ($(this).attr("name") === $id) {
				$(this).text($newName);
			}
		});
	});
	
	// Adjust weighted total on change
	$("#courseinfo").delegate("input.weight, input.percent", "change", function() {
		$row = $(this).parent().parent().attr("id");
		var weight = $("#"+$row+" .weight").val();
		var percent = $("#"+$row+" .percent").val();
		$("#"+$row+' .weighted').text(decToPct(weight*percent));
		$tableId= $(this).parent().parent().parent().parent().attr("id");
		updateTotal($tableId);
	});
	
	// Calculate My % based on My Grade if fraction format
	$("#courseinfo").delegate("input.grade", "change", function() {
		var fraction = /\d{1,4}[/]\d{1,4}/;
		$input = $(this).val();
		$isfraction = fraction.test($input);
		if ($isfraction) {
			if (fracToDec($input) == 'Infinity') {
				alert("Error: You just broke the universe.");
			} else {
				$row = $(this).parent().parent().attr("id");
				$("#"+$row+" .percent").val(fracToDec($input));
				var weight = $("#"+$row+" .weight").val();
				var percent = $("#"+$row+" .percent").val();
				$("#"+$row+' .weighted').text(decToPct(weight*percent));
				$tableId= $(this).parent().parent().parent().parent().attr("id");
				updateTotal($tableId);
			}
		}
	});
	
	// Add a new row
	$("#courseinfo").delegate(".add", "click", function() {
		$table = $(this).parent().children("table");
		$lastRow = $table.children("tbody").children(".aRow:last");
		$rowId = incrementRowId($lastRow);
		$newRow = "<tr class='aRow' id='"+$rowId+"'>" +
			"<td><input type='text' class='title' placeholder='Title'></td>" +
			"<td><input type='text' class='weight'  placeholder='0.00'></td>" +
			"<td><input type='text' class='grade' placeholder='00/00'></td>" +
			"<td><input type='text' class='percent'  placeholder='0.00'></td>" +
			"<td class='weighted'>0.00%</td><td><a href='#' class='delete'>delete</a></td></tr>";
		$(this).parent().children("table").append($newRow);
	});
	
	// Delete a row
	$("#courseinfo").delegate(".delete", "click", function() {
		$rowId = $(this).parent().parent().attr("id");
		$tableId= $(this).parent().parent().parent().parent().attr("id");
		if ($("#"+$tableId).children("tbody").children("tr").length < 2) {
			alert("Course must have at least one assignment.");
		} else {
			$("#"+$rowId).remove();
			updateTotal($tableId);
		}
	});
	
	// Add a course
	$("#sidebar .add").click(function() {
		$("#addcourse").css("display", "inline-block");
	});
	
	$("#addcourse .delete").click(function() {
		$("#addcourse .form input").val("");
		$("#addcourse").css("display", "none");
	});
	
	$("#addcourse .add").click(function() {
		// Get form values
		$courseName = $("#addcourse .form input[name=coursename]").val();
		$credits = $("#addcourse .form input[name=credits]").val();
		
		// Hide add form
		$("#addcourse").css("display", "none");
		
		// Make new table
		$tableId = $(".coursetable").length;
		makeTable($tableId, $courseName, $credits);
		
		// Hide other tables
		$(".coursetable").each(function() {
			if ($(this).attr("id") != "course"+$tableId) {
				$(this).hide();
			}
		});
		
		// Make starting table row
		$("#table"+$tableId+" h2").text("Grades for "+$courseName);
		$newRow = "<tr class='aRow' id='row"+$tableId+"0'>" +
			"<td><input type='text' class='title' placeholder='Title' value='Assignment 1'></td>" +
			"<td><input type='text' class='weight'  placeholder='0.00'></td>" +
			"<td><input type='text' class='grade' placeholder='00/00'></td>" +
			"<td><input type='text' class='percent'  placeholder='0.00'></td>" +
			"<td class='weighted'>0.00%</td><td><a href='#' class='delete'>delete</a></td></tr>";
		$("#table"+$tableId).append($newRow);
		updateTotal("table"+$tableId);
		
		// Add link in sidebar
		$("#sidebar #courselist").append("<div class='course' name='"+$tableId+"'>"+$courseName+"</div>");
	});
	
	// Save
	$("#save").click(function() {
		var userdata = {"courses":[]};

		$(".coursetable").each(function(i) {
			// Course name and credits
			$name = $(this).children('h2').children('.name').val();
			$credits = $(this).children('h2').children('.credits').val();
			
			// Make array of assignments from table
			$assignments = [];
			$table = $(this).children('table').children('tbody');
			
			$table.children('.aRow').each(function(i) {
				// Assignment information to add
				$title = $(this).children('td').children('.title').val();
				$weight = $(this).children('td').children('.weight').val();
				$grade = $(this).children('td').children('.grade').val();
				$percent = $(this).children('td').children('.percent').val();

				$assignments[i] = {"title": $title, "weight": $weight, "grade": $grade, "percent": $percent};
			});
			
			userdata['courses'][i] = {"name":$name, "credits":$credits, "assignments":$assignments};
			
		});
		setJSONCookie('userdata', userdata, 365);
	});
	
	// Forget
	$("#forget").click(function() {
		if (confirm("Really forget all course info? You'll never get it back.")) {
			setJSONCookie('userdata', '', -1);
			location.reload();
		}
	});
	
	// Export PDF
	$("#exportpdf").click(function() {
		// todo hide certain elements, make pdf download instead of opening print dialog
		window.print();
	});
	
	$("#exportjson").click(function() {
		
	});
	
});
