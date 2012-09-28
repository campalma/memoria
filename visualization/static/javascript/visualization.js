var svg, time_axis, location_axis, legend, info;
var continent_selected = false;
var width;
var height = 600;
var legendHeight = 30;
var location_axis_width = 50;
var axisHeight = 20;
var x;
var xAxis;
var events, topics, continents;
var lastClicked = null;
var continents_position = {};
var id;

// Object extension to know keys size
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function init(){
	// Set window onresize
	$(window).resize(function(){
		clearTimeout(id);
		id = setTimeout(update_dimensions, 500);
	});
	
	width = get_best_canvas_width();
	// Set topics from database
	set_topics_bar();

	height = get_best_canvas_height();

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
				.attr("width", location_axis_width)
				.attr("height", height);

	// Get continents from database
	get_continents();

	// Get clusters
	remove_clusters("fade");
	refresh_clusters();
	update_dimensions();
}

function update_dimensions(){
	var new_width = get_best_canvas_width();
	var new_height = get_best_canvas_height();
	$("#canvas").width(new_width);
	$("#canvas").height(new_height);
	$("#time_axis").width(new_width);
	$("#location_axis").height(new_height);
	$("#info").height(new_height+axisHeight);
	width = new_width;
	height = new_height;
	set_continent_axis();
	draw_location_separations();
	refresh_clusters_without_querying();
}

function get_best_canvas_width(){
	return $(window).width()/3*1.9-location_axis_width*2;
}

function get_best_canvas_height(){
	return $(window).height()-$("#topics-row").height()*3-axisHeight*2;
}

function displayEvents(){

	lastClicked = null;

	if(events.length == 0)
		return;

	minDate = to_utc(new Date(events[0].fields.date));
	maxDate = to_utc(new Date(events[0].fields.date));
	
	$.each(events, function(key, event){
		var d = to_utc(new Date(event.fields.date));
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
		   				 .attr("cx", x(to_utc(event.fields.date)))
		   				 .attr("cy", getLocationPosition(event.fields.continent_location))
		   				 .attr("r", Math.log(event.fields.relevancy)*5)
		   				 .attr("class", localAttribute)
		   				 .on("click", function(){
		   				 	if(lastClicked!=null){
		   				 		$(lastClicked).css("stroke", strokeColor(events[$(lastClicked).attr("id")]))
		   				 	}
		   				 	$(this).css("stroke", "red");
		   				 	lastClicked = this;

		   				 	get_cluster_locations(events[this.id].pk);
		   				 	get_cluster_info(events[this.id].pk);
						 })
						 .attr("onmouseover", "cluster_focus(this)")
						 .attr("onmouseout", "cluster_unfocus(this)")
						 .style("fill", article_color)
						 .style("stroke-width", 2)
						 .style("stroke", strokeColor(event))
						 .style("opacity", "0")
						 .transition()
						 .style("opacity", 100)
						 .duration(1500);
	});
}

function draw_time_triangles(){
	var hover_interval;
	var left_arrow = time_axis.append("polygon")
	   .attr("class", "time-triangle")
	   .attr("points", 0+","+axisHeight/2+" 10,0 10,"+axisHeight)

	right_arrow = time_axis.append("polygon")
	   .attr("class", "time-triangle")
	   .attr("points", width+","+axisHeight/2+" "+(width-10)+",0 "+(width-10)+","+axisHeight)

	right_arrow.on("mouseover", function(){
		arrow_animation(this);
	});
	right_arrow.on("click", function(){
		$("#min_date")[0].value = maxDate.format("isoDateTime");
		$("#max_date")[0].value = "";
		minDate = maxDate;
		remove_clusters("left");
		refresh_clusters();			
	});

	right_arrow.on("mouseout", function(){
		arrow_animation_out(this);
	});

	left_arrow.on("mouseover", function(){
		arrow_animation(this);
	});

	left_arrow.on("mouseout", function(){
		arrow_animation_out(this);
	});

	left_arrow.on("click", function(){
		$("#max_date")[0].value = minDate.format("isoDateTime");
		$("#min_date")[0].value = "";
		d3.selectAll("circle").transition().duration(2000).attr("cx", width*2);
			maxDate = minDate;
			remove_clusters("right");
			refresh_clusters();			
	});

}

function cluster_focus(element){
	var el = d3.select(element);
	el.transition().style("stroke-width", "3")
}

function cluster_unfocus(element){
	var el = d3.select(element);
	el.transition().style("stroke-width", "2")
}

function displayAxis(minDate, maxDate){
	x = d3.time.scale().range([0, width]);
	xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true);
	x.domain([minDate, maxDate]);	
	
	time_axis.append("svg:g")
	   .attr("id", "time_svg")
	   .attr("transform", "translate(0," + 0 + ")")
	   .call(xAxis);

	var labels = d3.selectAll("#time_svg > g")[0]

	// Remove first and last labels of time
	d3.select(labels[0]).remove();
	d3.select(labels[labels.length - 1]).remove();

	draw_time_triangles();
}

function arrow_animation(arrow){
	d3.select(arrow).transition()
	  .style("stroke", "black");
}

function arrow_animation_out(arrow){
	d3.select(arrow).transition()
	  .style("stroke", "grey");
}

function strokeColor(event){
	if(event.fields.isLocal){
		return "";
	}
	else{
		return "#333333";
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
	d3.selectAll(".separation").remove();
	var slotSize = height/Object.size(continents_position);
	$.each(continents_position, function(key,value){
		svg.append("rect")
		   .attr("id", "rect-"+value)
		   .attr("class", "separation")
		   .attr("fill", "white")
		   .attr("x", "0")
		   .attr("y", slotSize*(value)+"")
		   .attr("width", width+"")
		   .attr("height", slotSize)
		   .style("stroke", "grey");
	});
}

function set_continent_axis(){
	d3.selectAll("#location_axis > a").remove();
	var slotSize = height/Object.size(continents_position);
	$.each(continents_position, function(key, value){
		var lol = slotSize*(value+1)-30;
		location_axis.append("a")
					 .attr("xlink:href", "#")
					 .attr("class", "continent")
					 .append("text")
					 .attr("onmouseover","rect_highlight(this)")
					 .attr("onmouseout","undo_rect_highlight(this)")
					 .attr("fill", "#08C")
					 .attr("x", "0")
					 .attr("y", lol)
					 .attr("transform", "rotate(-90,25,"+lol+")")
					 .attr("onclick", "continent_filter(this)")
					 .text(key);
	});
}

function rect_highlight(continent_element){
	d3.select("#rect-"+continents_position[$(continent_element).text()])

	  .attr("fill", "#F0F0A8")
}

function undo_rect_highlight(continent_element){
	d3.select("#rect-"+continents_position[$(continent_element).text()])

	  .attr("fill", "white")	
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
	remove_clusters("fade");
	refresh_clusters();
}

function refresh_clusters(){
	remove_time_axis();
	params = $("#topics-form").serializeArray();
	$.ajax({
		url: "/api/clustersquery",
		async: false,
		type: "GET",
		data: params,
		success: function(data){
			events = data;
			displayEvents();
		}
	});
}

function refresh_clusters_without_querying(){
	remove_clusters("fade");
	remove_time_axis();
	displayEvents();	
}

function continent_filter(continent){
	continent_selected = true;
	selected = d3.select(continent);
	$("#display_continent").val(selected.text());
	continent_filter_animation(selected);
}

function continent_filter_animation(continent){

	text_position = parseInt(continent.attr("y"));
	remove_clusters("fade");
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
		var rect = d3.select(this);
		var rect_position = parseInt(rect.attr("y"));
		var first = true;
		if(text_position < rect_position){
			var new_position = height+100;
			rect.transition()
			    .attr("y", new_position)
			    .duration(1500);
		}
		else{
		rect.transition()
		    .attr("y", 0)
		    .attr("height", height)
		    .duration(1500);				
		}

	});

	continent.transition()
			 .attr("x", text_position-300)
			 .duration(1500).each("end", 
			 	function(){
			 		remove_clusters("fade");
				 	refresh_clusters(); 
				 	d3.select(this).transition().style("kerning", "10")
				 	d3.select("#location_axis").append("a")
				 							   .attr("xlink:href", "#")
				 							   .append("text")
				 							   .attr("fill", "#08C")
				 							   .attr("x", 0)
				 							   .attr("y", height-10)
				 							   .attr("onclick", "back_to_all_continents()")
				 							   .text("Back");
				 });
		
}

function back_to_all_continents(){
	continent_selected = false;
	draw_location_separations();
	set_continent_axis();
	d3.select("#display_continent").attr("value", "All");
	remove_clusters("fade");
	refresh_clusters();
}

function get_continents(){
	$.ajax({
		url: "/api/continents",
		dataType: "json",
		data: continents,
		async: false,
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
		async: false,
		success: function(data){
			topics = data;
			$.each(topics, function(key, value){
				$("#topics-row").append("<a href='#'><span id='"+value.fields.short_name+"' class='label topic' onclick='topic_filter(this)'>"+value.fields.name+"</span></a> ");
				$("#topics-row").append("<input type='checkbox' class='topic_check' checked='true' id='"+value.fields.short_name+"_check' name='"+value.fields.short_name+"'/>");
				$("#"+value.fields.short_name).css("background", "#"+value.fields.color);
			});
		}
	});
}

function get_cluster_info(id){
	$.ajax({
		url: "/api/clusternewsquery/"+id,
		dataType: "json",
		success: function(data){
			d3.select("#image > img").remove();
			d3.select("#image").append("img")
							   .attr("src", events[$(lastClicked).attr("id")].fields.image)
			$("#news").text("")
			$.each(data, function(key, article){
				$("#news").append(article.fields.published_date.replace("T", " ")+" <a target='blank' href='"+article.fields.url+"'>"+article.fields.title +" ["+article.fields.publisher+"]"+"</a><br/>");
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

function remove_clusters(transition){
	console.log(transition);
	switch(transition){
	case "fade":
		d3.selectAll("circle").transition().style("opacity", "0").remove();
		break;
	case "left":
		d3.selectAll("circle").transition().duration(2000).attr("cx", -width).remove();
		break;
	case "right":
		d3.selectAll("circle").transition().duration(2000).attr("cx", width*2).remove();
		break;
	default:	
		d3.selectAll("circle").transition().style("opacity", "0").remove();
	}

}

function remove_time_axis(){
	d3.select("#time_svg").remove();
}

function to_utc(date_str){
	var date = new Date(date_str);
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}