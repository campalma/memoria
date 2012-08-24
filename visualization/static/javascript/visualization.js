var svg, time_axis, location_axis, legend, info;
var width = 700;
var height = 600;
var legendHeight = 30;
var axisHeight = 100;
var maxRelevancy = 100;
var x = d3.time.scale().range([0, width]);
var xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true);
var events;
var lastClicked = null;

topicColors = {
	"Top Headlines": "#90AEC6",
	"World": "#FF8F00",
	"Business": "#E7E4D3",
	"Nation": "#D72729",
	"Science and Technology": "#471605",
	"Elections": "#E3A6EC",
	"Politics": "#DDC0B2",
	"Entertainment": "#3D4C53",
	"Sports": "#669966",
	"Health": "#D13D94"
}

continentsPosition = {
		"Africa": 0,
		"Asia": 1,
		"Europe": 2,
		"North America": 3,
		"Oceania": 4,
		"South America": 5,
//		"Antarctica": 6,
		"": 6,
		"Unknown": 6,
} 
continentsCount = 7

function init(){
	svg = d3.select("#canvas")
			.attr("width", width)
	      	.attr("height", height);

	time_axis = d3.select("#time_axis")
				.attr("width", width)
				.attr("height", axisHeight);

	location_axis = d3.select("#location_axis")
				.attr("width", 50)
				.attr("height", height);

	drawLocationSeparations();

	$.ajax({
		url: "/api/clustersquery",
		dataType: "json",
		data: events,
		success: function(data){
			events = data;
			displayEvents();
		}
	});
}

function displayEvents(){
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

		console.log(event.fields.topic)

		var article = svg.append("circle")
		   				 .attr("id", key)
		   				 .attr("cx", x(new Date(event.fields.date)))
		   				 .attr("cy", getLocationPosition(event.fields.continent_location))
		   				 .attr("r", event.fields.relevancy*5)
		   				 .attr("class", localAttribute)
						 .style("fill", getTopicColor(event.fields.topic))
						 .style("stroke-width", 2)
						 .style("stroke", strokeColor(event));

		   				 $("#"+key).click(function(){

		   				 	if(lastClicked!=null){
		   				 		$(lastClicked).css("stroke", strokeColor(events[$(lastClicked).attr("id")]))
		   				 	}
		   				 	$(this).css("stroke", "red");
		   				 	lastClicked = this;

							$.ajax({
								url: "/api/clusternewsquery/"+events[this.id].pk,
								dataType: "json",
								success: function(data){

									$("#news")[0].innerHTML = "</br>";
									$("#image")[0].innerHTML = "<img src='"+events[$(lastClicked).attr("id")].fields.image+"'/>";
									$.each(data, function(key, article){
										$("#news").append(article.fields.published_date+" <a href='"+article.fields.url+"'>"+article.fields.title +" ["+article.fields.publisher+"]"+"</a><br/>");
									});
								}
							});
						 });
	});
}

function displayAxis(minDate, maxDate){
	x.domain([minDate, maxDate]);	
	
	time_axis.append("svg:g")
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

function getLocationPosition(continent){
	slotSize = height/continentsCount;
	return slotSize*continentsPosition[continent] + Math.random()*slotSize;
}

function drawLocationSeparations(){
	var slotSize = height/continentsCount
	$.each(continentsPosition, function(key, value){
		svg.append("line")
		   .attr("x1", "0")
		   .attr("y1", slotSize*(value+1)+"")
		   .attr("x2", width+"")
		   .attr("y2", slotSize*(value+1)+"")
		   .style("stroke", "grey");
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
	return topicColors[topic];
}

function topic_filter(topic_span){
	if($(topic_span).hasClass("not-selected")){
		$(topic_span).removeClass("not-selected");
	}
	else{
		$(topic_span).addClass("not-selected");
	}
}