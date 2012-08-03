var svg, axisSvg, info;
var width = 800;
var height = 600;
var axisHeight = 100;
var maxRelevancy = 100;
var x = d3.time.scale().range([0, width]);
var xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true);
var events;
var lastClicked = null;

function init(){
	svg = d3.select("#canvas")
			.attr("width", width)
	      	.attr("height", height);

	axisSvg = d3.select("#axis")
				.attr("width", width)
				.attr("height", axisHeight);

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
		   				 .attr("cy", Math.random()*height)
		   				 .attr("r", 10*event.fields.relevancy)
		   				 .attr("class", localAttribute)
						 .style("fill", getColor(event.fields.topic))
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
	
	axisSvg.append("svg:g")
	   .attr("transform", "translate(0," + 0 + ")")
	   .call(xAxis);
}

function strokeColor(event){
	if(event.fields.isLocal){
		return "black";
	}
	else{
		return "";
	}
}

/*
	TODO: Someday, i'll get continent location, now color is random. It must be changed.
*/
function getColor(topic){
	colors = {
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
	return colors[topic];
}
