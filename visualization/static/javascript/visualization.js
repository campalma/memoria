var svg, time_axis, location_axis, legend, info;
var width = 700;
var height = 600;
var legendHeight = 30;
var axisHeight = 20;
var x = d3.time.scale().range([0, width]);
var xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true);
var events, topics, continents;
var lastClicked = null;
var continents_position = {};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function init(){
	// Set canvas size
	svg = d3.select("#canvas")
			.attr("width", width)
	      	.attr("height", height);

	// Set time axis size
	time_axis = d3.select("#time_axis")
				.attr("width", width)
				.attr("height", axisHeight);

	// Set location size
	location_axis = d3.select("#location_axis")
				.attr("width", 50)
				.attr("height", height);

	// Get continents from database
	get_continents();

	// Set topics from database
	set_topics_bar();
}

function displayEvents(){

	lastClicked = null;

	var minDate = new Date(events[0].fields.date);
	var maxDate = new Date(events[0].fields.date);
	
	$.each(events, function(key, event){
		var d = new Date(event.fields.date);
		if(minDate > d){
			minDate = d;
		}
		if(maxDate < d){
			maxDate = d;
		}
	});
	
	displayAxis(minDate, maxDate);
	
	$.each(events, function(key, event){

		var localAttribute;
		if(event.fields.is_local){
			localAttribute = "local";
		}
		else{
			localAttribute = "global";
		}

		article_color = "#"+getTopicColor(event.fields.topic);

		var article = svg.append("circle")
		   				 .attr("id", key)
		   				 .attr("cx", x(new Date(event.fields.date)))
		   				 .attr("cy", getLocationPosition(event.fields.continent_location))
		   				 .attr("r", Math.log(event.fields.relevancy)*5)
		   				 .attr("class", localAttribute)
						 .style("fill", article_color)
						 .style("stroke-width", 2)
						 .style("stroke", strokeColor(event));

		   				 $("#"+key).click(function(){

		   				 	if(lastClicked!=null){
		   				 		$(lastClicked).css("stroke", strokeColor(events[$(lastClicked).attr("id")]))
		   				 	}
		   				 	$(this).css("stroke", "red");
		   				 	lastClicked = this;

		   				 	get_cluster_locations(events[this.id].pk);
		   				 	get_cluster_info(events[this.id].pk);
						 });
	});
}

function displayAxis(minDate, maxDate){
	x.domain([minDate, maxDate]);	
	
	time_axis.append("svg:g")
	   .attr("id", "time_svg")
	   .attr("transform", "translate(0," + 0 + ")")
	   .call(xAxis);
}

function strokeColor(event){
	if(event.fields.isLocal){
		return "";
	}
	else{
		return "black";
	}
}

function getLocationPosition(continents_array){
	if(continents_array.length == 0){
		continent = "Unknown";
	}
	else{
		continent = continents[continents_array[0]];
	}
	slotSize = height/Object.size(continents_position);
	return slotSize*continents_position[continent] + Math.random()*slotSize;
}

function draw_location_separations(){
	var slotSize = height/Object.size(continents_position);
	$.each(continents_position, function(key, value){
		svg.append("line")
		   .attr("x1", "0")
		   .attr("y1", slotSize*(value+1)+"")
		   .attr("x2", width+"")
		   .attr("y2", slotSize*(value+1)+"")
		   .style("stroke", "grey");
	});
}

function set_continent_axis(){
	var slotSize = height/Object.size(continents_position);
	$.each(continents_position, function(key, value){
		var lol = slotSize*(value+1)-30;
		location_axis.append("text")
					 .attr("x", "0")
					 .attr("y", lol)
					 .attr("fill", "black")
					 .attr("transform", "rotate(-90,25,"+lol+")")
					 .text(key);
	});
}

function getTopicColor(topic){
	var result;
	$.each(topics, function(key, value){
		if(value.pk == topic){
			result = value.fields.color;
		}
	});
	return result;
}

function topic_filter(topic_span){
	topic_id = $(topic_span)[0].id
	if($(topic_span).hasClass("not-selected")){
		$(topic_span).removeClass("not-selected");
		$("#"+topic_id+"_check")[0].checked = true;
	}
	else{
		$(topic_span).addClass("not-selected");
		$("#"+topic_id+"_check")[0].checked = false;
	}
	refresh_clusters();
}

function refresh_clusters(){
	remove_clusters();
	remove_time_axis();
	params = $("#topics-form").serializeArray();
	$.get("/api/clustersquery", params, 
		function(data){
			events = data;
			displayEvents();
		}
	);
}

function get_continents(){
	$.ajax({
		url: "/api/continents",
		dataType: "json",
		data: continents,
		success: function(data){
			continents = data;
			set_continents_position();
			draw_location_separations();
			set_continent_axis();
		}
	});
}

function set_topics_bar(){
	$.ajax({
		url: "/api/topics",
		dataType: "json",
		data: topics,
		success: function(data){
			topics = data;
			$.each(topics, function(key, value){
				$("#topics-row").append("<a href='#'><span id='"+value.fields.short_name+"' class='label topic' onclick='topic_filter(this)'>"+value.fields.name+"</span></a> ");
				$("#topics-row").append("<input type='checkbox' class='topic_check' checked='true' id='"+value.fields.short_name+"_check' name='"+value.fields.short_name+"'/>");
				$("#"+value.fields.short_name).css("background", "#"+value.fields.color);
			});
			refresh_clusters();
		}
	});
}

function get_cluster_info(id){
	$.ajax({
		url: "/api/clusternewsquery/"+id,
		dataType: "json",
		success: function(data){

			$("#news")[0].innerHTML = "</br>";
			$("#image")[0].innerHTML = "<img src='"+events[$(lastClicked).attr("id")].fields.image+"'/>";
			$.each(data, function(key, article){
				$("#news").append(article.fields.published_date+" <a href='"+article.fields.url+"'>"+article.fields.title +" ["+article.fields.publisher+"]"+"</a><br/>");
			});
		}
	});
}

function get_cluster_locations(id){
 	$.ajax({
		url: "/api/locationsquery/"+id,
		dataType: "json",
		success: function(data){

			$("#locations")[0].innerHTML = "";
			$.each(data, function(key, value){
				$("#locations").append("<span class='badge badge-info'>"+value.fields.name+"</span> ");
			});
		}
	});
}

function set_continents_position(){
	var position = 0;
	$.each(continents, function(key, value){
		continents_position[value] = position;
		position++;
	});
	continents_position["Unknown"] = position;
}

function remove_clusters(){
	d3.selectAll("circle").remove();
}

function remove_time_axis(){
	d3.select("#time_svg").remove();
}