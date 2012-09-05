var svg, time_axis, location_axis, legend, info;
var continent_selected = false;
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
						 .style("stroke", strokeColor(event))
						 .style("opacity", "0")
						 .transition()
						 .style("opacity", 100)
						 .duration(1500)
						 .each("end", function(){		   				 
						 	$("#"+key).click(function(){
		   				 	if(lastClicked!=null){
		   				 		$(lastClicked).css("stroke", strokeColor(events[$(lastClicked).attr("id")]))
		   				 	}
		   				 	$(this).css("stroke", "red");
		   				 	lastClicked = this;

		   				 	get_cluster_locations(events[this.id].pk);
		   				 	get_cluster_info(events[this.id].pk);
						 });});

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
	if(continent_selected)
		return Math.random()*height;
	else if(continents_array.length == 0){
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
		   .attr("class", "separation")
		   .attr("x1", "0")
		   .attr("y1", slotSize*(value+1)+"")
		   .attr("x2", width+"")
		   .attr("y2", slotSize*(value+1)+"")
		   .style("stroke", "grey");
	});
}

function set_continent_axis(){
	d3.selectAll("#location_axis > text").remove();
	var slotSize = height/Object.size(continents_position);
	$.each(continents_position, function(key, value){
		var lol = slotSize*(value+1)-30;
		location_axis.append("text")
					 .attr("class", "continent")	
					 .attr("x", "0")
					 .attr("y", lol)
					 .attr("fill", "black")
					 .attr("transform", "rotate(-90,25,"+lol+")")
					 .attr("onclick", "continent_filter(this)")
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

function continent_filter(continent){
	continent_selected = true;
	selected = d3.select(continent);
	$("#display_continent").val(selected.text());
	continent_filter_animation(selected);
}

function continent_filter_animation(continent){

	text_position = parseInt(continent.attr("y"));
	remove_clusters();
	// Hide another continents
	d3.selectAll(".continent").each(function(){
		continent_text = d3.select(this);
		if(continent_text.text() != continent.text()){
			continent_text.transition()
				.style("opacity","0")
				.duration(1500)
				.remove();	
			}
		});

	// Move lines into its respective side
	d3.selectAll(".separation").each(function(){
		var line = d3.select(this);
		var line_position = parseInt(line.attr("y2"));
		if(text_position < line_position){
			var new_position = height+5;
		}
		else{
			var new_position = -5;
		}
			line.transition()
			    .attr("y1", new_position)
			    .attr("y2", new_position)
			    .duration(1500);
	});

	continent.transition()
			 .attr("x", text_position-300)
			 .duration(1500).each("end", 
			 	function(){
				 	refresh_clusters(); 
				 	d3.select(this).transition().style("kerning", "10")
				 	d3.select("#location_axis").append("text")
				 							   .attr("x", 0)
				 							   .attr("y", height-10)
				 							   .attr("onclick", "back_to_all_continents()")
				 							   .text("All");
				 });
		
}

function back_to_all_continents(){
	continent_selected = false;
	draw_location_separations();
	set_continent_axis();
	d3.select("#display_continent").attr("value", "All");
	refresh_clusters();
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
				$("#news").append(article.fields.published_date.replace("T", " ")+" <a href='"+article.fields.url+"'>"+article.fields.title +" ["+article.fields.publisher+"]"+"</a><br/>");
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
	events = null
	d3.selectAll("circle").transition().style("opacity", "0").remove();
}

function remove_time_axis(){
	d3.select("#time_svg").remove();
}