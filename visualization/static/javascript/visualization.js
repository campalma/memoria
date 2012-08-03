var svg, axisSvg, info;
var width = 800;
var height = 600;
var axisHeight = 100;
var maxRelevancy = 100;
var x = d3.time.scale().range([0, width]);
var xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true);
var colors = new Array("#B52C38","#EBD1B0","#536682","#D9964B","#DE6846", "#DCEBDD")
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

		var article = svg.append("circle")
		   				 .attr("id", key)
		   				 .attr("cx", x(new Date(event.fields.date)))
		   				 .attr("cy", Math.random()*height)
		   				 .attr("r", 10*event.fields.relevancy)
		   				 .attr("class", localAttribute)
						 .style("fill", getColor(event.fields.continent_location))
						 .style("stroke-width", 2)
						 .style("stroke", strokeColor(event));

						console.log(x(new Date(event.fields.date)), event.pk);

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
									$("#info")[0].innerHTML = "</br>";
									$.each(data, function(key, article){
										$("#info").append(article.fields.published_date+" <a href='"+article.fields.url+"'>"+article.fields.title +" ["+article.fields.publisher+"]"+"</a><br/>");
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
function getColor(continent){
	/*
	switch(continent){
		case("Europe"):
			return colors[0];
			break;

		case("America"):
			return colors[1];
			break;

		case("Asia"):
			return colors[2];
			break;

		case("Africa"):
			return colors[3];
			break;

		case("Antartica"):
			return colors[4];
			break;

		case("Oceania"):
			return colors[5];
			break;
	}
	return colors[0];
	*/
	return colors[Math.floor(Math.random() * 6)];
}
