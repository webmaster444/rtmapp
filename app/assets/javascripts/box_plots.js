(function() {
d3.box = function() {
  var width = 1,
      height = 1,
      duration = 0,
      domain = null,
      value = Number,
      whiskers = boxWhiskers,
      quartiles = boxQuartiles,
	  showLabels = true, // whether or not to show text labels
	  numBars = 4,
	  curBar = 1,
      tickFormat = null;

  // For each small multiple…
  function box(g) {
    g.each(function(data, i) {
      //d = d.map(value).sort(d3.ascending);
	  //var boxIndex = data[0];
	  //var boxIndex = 1;
	  var d = data[1].sort(d3.ascending);	  
	  
      var g = d3.select(this),
          n = d.length,
          min = d[0],
          max = d[n - 1];

      // Compute quartiles. Must return exactly 3 elements.
      var quartileData = d.quartiles = quartiles(d);

      // Compute whiskers. Must return exactly 2 elements, or null.
      var whiskerIndices = whiskers && whiskers.call(this, d, i),
          whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });

      // Compute outliers. If no whiskers are specified, all data are "outliers".
      // We compute the outliers as indices, so that we can join across transitions!
      var outlierIndices = whiskerIndices
          ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
          : d3.range(n);

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain(domain && domain.call(this, d, i) || [min, max])
          .range([height, 0]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
		 // .domain([0, max])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Note: the box, median, and box tick elements are fixed in number,
      // so we only have to handle enter and update. In contrast, the outliers
      // and other elements are variable, so we need to exit them! Variable
      // elements also fade in and out.

      // Update center line: the vertical line spanning the whiskers.
      var center = g.selectAll("line.center")
          .data(whiskerData ? [whiskerData] : []);

	 //vertical line
      center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("x1", width / 2)
          .attr("y1", function(d) { return x0(d[0]); })
          .attr("x2", width / 2)
          .attr("y2", function(d) { return x0(d[1]); })
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      center.transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      center.exit().transition()
          .duration(duration)
          .style("opacity", 1e-6)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); })
          .remove();

      // Update innerquartile box.
      var box = g.selectAll("rect.box")
          .data([quartileData]);

      box.enter().append("rect")
          .attr("class", "box")
          .attr("x", 0)
          .attr("y", function(d) { return x0(d[2]); })
          .attr("width", width)
          .attr("height", function(d) { return x0(d[0]) - x0(d[2]); })
        .transition()
          .duration(duration)
          .attr("y", function(d) { return x1(d[2]); })
          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

      box.transition()
          .duration(duration)
          .attr("y", function(d) { return x1(d[2]); })
          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

      // Update median line.
      var medianLine = g.selectAll("line.median")
          .data([quartileData[1]]);

      medianLine.enter().append("line")
          .attr("class", "median")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", width)
          .attr("y2", x0)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      medianLine.transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      // Update whiskers.
      var whisker = g.selectAll("line.whisker")
          .data(whiskerData || []);

      whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", 0 + width)
          .attr("y2", x0)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.exit().transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1e-6)
          .remove();

      // Update outliers.
      var outlier = g.selectAll("circle.outlier")
          .data(outlierIndices, Number);

      outlier.enter().insert("circle", "text")
          .attr("class", "outlier")
          .attr("r", 5)
          .attr("cx", width / 2)
          .attr("cy", function(i) { return x0(d[i]); })
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 1);

      outlier.transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 1);

      outlier.exit().transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 1e-6)
          .remove();

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(8);

      // Update box ticks.
      var boxTick = g.selectAll("text.box")
          .data(quartileData);
	 if(showLabels == true) {
      boxTick.enter().append("text")
          .attr("class", "box")
          .attr("dy", ".3em")
          .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
          .attr("x", function(d, i) { return i & 1 ?  + width : 0 })
          .attr("y", x0)
          .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
          .text(format)
        .transition()
          .duration(duration)
          .attr("y", x1);
	}
		 
      boxTick.transition()
          .duration(duration)
          .text(format)
          .attr("y", x1);

      // Update whisker ticks. These are handled separately from the box
      // ticks because they may or may not exist, and we want don't want
      // to join box ticks pre-transition with whisker ticks post-.
      var whiskerTick = g.selectAll("text.whisker")
          .data(whiskerData || []);
	if(showLabels == true) {
      whiskerTick.enter().append("text")
          .attr("class", "whisker")
          .attr("dy", ".3em")
          .attr("dx", 6)
          .attr("x", width)
          .attr("y", x0)
          .text(format)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y", x1)
          .style("opacity", 1);
	}
      whiskerTick.transition()
          .duration(duration)
          .text(format)
          .attr("y", x1)
          .style("opacity", 1);

      whiskerTick.exit().transition()
          .duration(duration)
          .attr("y", x1)
          .style("opacity", 1e-6)
          .remove();
    });
    d3.timer.flush();
  }

  box.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return box;
  };

  box.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return box;
  };

  box.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return box;
  };

  box.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return box;
  };

  box.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x == null ? x : d3.functor(x);
    return box;
  };

  box.value = function(x) {
    if (!arguments.length) return value;
    value = x;
    return box;
  };

  box.whiskers = function(x) {
    if (!arguments.length) return whiskers;
    whiskers = x;
    return box;
  };
  
  box.showLabels = function(x) {
    if (!arguments.length) return showLabels;
    showLabels = x;
    return box;
  };

  box.quartiles = function(x) {
    if (!arguments.length) return quartiles;
    quartiles = x;
    return box;
  };

  return box;
};

function boxWhiskers(d) {
  return [0, d.length - 1];
}

function boxQuartiles(d) {
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}

var labels = true; // show the text labels beside individual boxplots?

var margin = {top: 30, right: 50, bottom: 70, left: 50};
var  width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
	
var min = Infinity,
    max = -Infinity;
	
// parse in the data	
// d3.csv("data.csv", function(error, csv) {	
	// using an array of arrays with
	// data[n][2] 
	// where n = number of columns in the csv file 
	// data[i][0] = name of the ith column
	// data[i][1] = array of values of ith column	
	csv= [
	{"Q1":20000,"Q2":15000,"Q3":8000,"Q4":20000},
	{"Q1":9879,"Q2":9323,"Q3":3294,"Q4":5629},
	{"Q1":5070,"Q2":9395,"Q3":17633,"Q4":5752},
	{"Q1":7343,"Q2":8675,"Q3":12121,"Q4":7557},
	{"Q1":10546,"Q2":10800,"Q3":17200,"Q4":5800},
	{"Q1":9380,"Q2":2850,"Q3":7220,"Q4":12800},
	{"Q1":4000,"Q2":1800,"Q3":1900,"Q4":6800}]
	var data = [];
	data[0] = [];
	data[1] = [];
	data[2] = [];
	data[3] = [];
	// add more rows if your csv file has more columns

	// add here the header of the csv file
	data[0][0] = "Q1";
	data[1][0] = "Q2";
	data[2][0] = "Q3";
	data[3][0] = "Q4";
	// add more rows if your csv file has more columns

	data[0][1] = [];
	data[1][1] = [];
	data[2][1] = [];
	data[3][1] = [];
  
	csv.forEach(function(x) {
		var v1 = Math.floor(x.Q1),
			v2 = Math.floor(x.Q2),
			v3 = Math.floor(x.Q3),
			v4 = Math.floor(x.Q4);
			// add more variables if your csv file has more columns
			
		var rowMax = Math.max(v1, Math.max(v2, Math.max(v3,v4)));
		var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,v4)));

		data[0][1].push(v1);
		data[1][1].push(v2);
		data[2][1].push(v3);
		data[3][1].push(v4);
		 // add more rows if your csv file has more columns
		 
		if (rowMax > max) max = rowMax;
		if (rowMin < min) min = rowMin;	
	});
  
	var chart = d3.box()
		.whiskers(iqr(1.5))
		.height(height)	
		.domain([min, max])
		.showLabels(labels);

	var svg = d3.select("#box_plots").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "box")    
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// the x-axis
	var x = d3.scale.ordinal()	   
		.domain( data.map(function(d) { return d[0] } ) )	    
		.rangeRoundBands([0 , width], 0.7, 0.3); 		

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	// the y-axis
	var y = d3.scale.linear()
		.domain([min, max])
		.range([height + margin.top, 0 + margin.top]);
	
	var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

	// draw the boxplots	
	svg.selectAll(".box")	   
      .data(data)
	  .enter().append("g")
		.attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
      .call(chart.width(x.rangeBand())); 
	
	      
	// add a title
	svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        //.style("text-decoration", "underline")  
        .text("Revenue 2012");
 
	 // draw y axis
	svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
		.append("text") // and text1
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .style("font-size", "16px") 
		  .text("Revenue in €");		
	
	// draw x axis	
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
      .call(xAxis)
	  .append("text")             // text label for the x axis
        .attr("x", (width / 2) )
        .attr("y",  10 )
		.attr("dy", ".71em")
        .style("text-anchor", "middle")
		.style("font-size", "16px") 
        .text("Quarter"); 
// });

// Returns a function to compute the interquartile range.
function iqr(k) {
  return function(d, i) {
    var q1 = d.quartiles[0],
        q3 = d.quartiles[2],
        iqr = (q3 - q1) * k,
        i = -1,
        j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
}

/* Mean and Standard Deviation Chart */
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var svg = d3.select("#mean_standard_deviation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// d3.tsv("data.tsv", function(error, data) {

data = [
	{'letter':'A','frequency':.081},
	{'letter':'B','frequency':.29},
	{'letter':'C','frequency':.039},
	{'letter':'D','frequency':.281},
	{'letter':'E','frequency':.71},
	{'letter':'F','frequency':.191},
	{'letter':'G','frequency':.031}
	];

  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });

  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });

  d3.select("input").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(data.sort(this.checked
        ? function(a, b) { return b.frequency - a.frequency; }
        : function(a, b) { return d3.ascending(a.letter, b.letter); })
        .map(function(d) { return d.letter; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.letter) - x0(b.letter); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.letter); });

    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }

d = [
     [
           {axis: "strength", value: 13}, 
           {axis: "intelligence", value: 1}, 
           {axis: "charisma", value: 8},  
           {axis: "dexterity", value: 4},  
           {axis: "luck", value: 9}
          ],[
           {axis: "strength", value: 3}, 
           {axis: "intelligence", value: 15}, 
           {axis: "charisma", value: 4}, 
           {axis: "dexterity", value: 1},  
           {axis: "luck", value: 15}
          ],[
           {axis: "strength", value: 5}, 
           {axis: "intelligence", value: 1}, 
           {axis: "charisma", value: 16}, 
           {axis: "dexterity", value: 10},  
           {axis: "luck", value: 5}
     ]
];

var RadarChart={defaultConfig:{containerClass:"radar-chart",w:600,h:600,factor:.95,factorLegend:1,levels:3,levelTick:!1,TickLength:10,maxValue:0,minValue:0,radians:2*Math.PI,color:d3.scale.category10(),axisLine:!0,axisText:!0,circles:!0,radius:5,open:!1,backgroundTooltipColor:"#555",backgroundTooltipOpacity:"0.7",tooltipColor:"white",axisJoin:function(a,b){return a.className||b},tooltipFormatValue:function(a){return a},tooltipFormatClass:function(a){return a},transitionDuration:300},chart:function(){function b(b,c){if(c===!1||void 0==c)b.classed("visible",0),b.select("rect").classed("visible",0);else{b.classed("visible",1);var d=b.node().parentNode,e=d3.mouse(d);b.select("text").classed("visible",1).style("fill",a.tooltipColor);var f=5,g=b.select("text").text(c).node().getBBox();b.select("rect").classed("visible",1).attr("x",0).attr("x",g.x-f).attr("y",g.y-f).attr("width",g.width+2*f).attr("height",g.height+2*f).attr("rx","5").attr("ry","5").style("fill",a.backgroundTooltipColor).style("opacity",a.backgroundTooltipOpacity),b.attr("transform","translate("+(e[0]+10)+","+(e[1]-10)+")")}}function c(c){c.each(function(c){function l(b,c,d,e){return d="undefined"!=typeof d?d:1,c*(1-d*e(b*a.radians/i))}function m(a,b,c){return l(a,b,c,Math.sin)}function n(a,b,c){return l(a,b,c,Math.cos)}var d=d3.select(this),e=d.selectAll("g.tooltip").data([c[0]]),f=e.enter().append("g").classed("tooltip",!0);f.append("rect").classed("tooltip",!0),f.append("text").classed("tooltip",!0),c=c.map(function(a){return a instanceof Array&&(a={axes:a}),a});var g=Math.max(a.maxValue,d3.max(c,function(a){return d3.max(a.axes,function(a){return a.value})}));g-=a.minValue;var h=c[0].axes.map(function(a,b){return{name:a.axis,xOffset:a.xOffset?a.xOffset:0,yOffset:a.yOffset?a.yOffset:0}}),i=h.length,j=a.factor*Math.min(a.w/2,a.h/2),k=Math.min(a.w/2,a.h/2);d.classed(a.containerClass,1);var o=d3.range(0,a.levels).map(function(b){return j*((b+1)/a.levels)}),p=d.selectAll("g.level-group").data(o);p.enter().append("g"),p.exit().remove(),p.attr("class",function(a,b){return"level-group level-group-"+b});var q=p.selectAll(".level").data(function(a){return d3.range(0,i).map(function(){return a})});if(q.enter().append("line"),q.exit().remove(),a.levelTick?q.attr("class","level").attr("x1",function(b,c){return j==b?m(c,b):m(c,b)+a.TickLength/2*Math.cos(c*a.radians/i)}).attr("y1",function(b,c){return j==b?n(c,b):n(c,b)-a.TickLength/2*Math.sin(c*a.radians/i)}).attr("x2",function(b,c){return j==b?m(c+1,b):m(c,b)-a.TickLength/2*Math.cos(c*a.radians/i)}).attr("y2",function(b,c){return j==b?n(c+1,b):n(c,b)+a.TickLength/2*Math.sin(c*a.radians/i)}).attr("transform",function(b){return"translate("+(a.w/2-b)+", "+(a.h/2-b)+")"}):q.attr("class","level").attr("x1",function(a,b){return m(b,a)}).attr("y1",function(a,b){return n(b,a)}).attr("x2",function(a,b){return m(b+1,a)}).attr("y2",function(a,b){return n(b+1,a)}).attr("transform",function(b){return"translate("+(a.w/2-b)+", "+(a.h/2-b)+")"}),a.axisLine||a.axisText){var r=d.selectAll(".axis").data(h),s=r.enter().append("g");a.axisLine&&s.append("line"),a.axisText&&s.append("text"),r.exit().remove(),r.attr("class","axis"),a.axisLine&&r.select("line").attr("x1",a.w/2).attr("y1",a.h/2).attr("x2",function(b,c){return a.w/2-k+m(c,k,a.factor)}).attr("y2",function(b,c){return a.h/2-k+n(c,k,a.factor)}),a.axisText&&r.select("text").attr("class",function(a,b){var c=m(b,.5);return"legend "+(.4>c?"left":c>.6?"right":"middle")}).attr("dy",function(a,b){var c=n(b,.5);return.1>c?"1em":c>.9?"0":"0.5em"}).text(function(a){return a.name}).attr("x",function(b,c){return b.xOffset+(a.w/2-k)+m(c,k,a.factorLegend)}).attr("y",function(b,c){return b.yOffset+(a.h/2-k)+n(c,k,a.factorLegend)})}c.forEach(function(b){b.axes.forEach(function(b,c){b.x=a.w/2-k+m(c,k,parseFloat(Math.max(b.value-a.minValue,0))/g*a.factor),b.y=a.h/2-k+n(c,k,parseFloat(Math.max(b.value-a.minValue,0))/g*a.factor)})});var t=d.selectAll(".area").data(c,a.axisJoin),u="polygon";if(a.open&&(u="polyline"),t.enter().append(u).classed({area:1,"d3-enter":1}).on("mouseover",function(c){d3.event.stopPropagation(),d.classed("focus",1),d3.select(this).classed("focused",1),b(e,a.tooltipFormatClass(c.className))}).on("mouseout",function(){d3.event.stopPropagation(),d.classed("focus",0),d3.select(this).classed("focused",0),b(e,!1)}),t.exit().classed("d3-exit",1).transition().duration(a.transitionDuration).remove(),t.each(function(a,b){var c={"d3-exit":0};c["radar-chart-serie"+b]=1,a.className&&(c[a.className]=1),d3.select(this).classed(c)}).style("stroke",function(b,c){return a.color(c)}).style("fill",function(b,c){return a.color(c)}).transition().duration(a.transitionDuration).attr("points",function(a){return a.axes.map(function(a){return[a.x,a.y].join(",")}).join(" ")}).each("start",function(){d3.select(this).classed("d3-enter",0)}),a.circles&&a.radius){var v=d.selectAll("g.circle-group").data(c,a.axisJoin);v.enter().append("g").classed({"circle-group":1,"d3-enter":1}),v.exit().classed("d3-exit",1).transition().duration(a.transitionDuration).remove(),v.each(function(a){var b={"d3-exit":0};a.className&&(b[a.className]=1),d3.select(this).classed(b)}).transition().duration(a.transitionDuration).each("start",function(){d3.select(this).classed("d3-enter",0)});var w=v.selectAll(".circle").data(function(a,b){return a.axes.map(function(a){return[a,b]})});w.enter().append("circle").classed({circle:1,"d3-enter":1}).on("mouseover",function(c){d3.event.stopPropagation(),b(e,a.tooltipFormatValue(c[0].value))}).on("mouseout",function(a){d3.event.stopPropagation(),b(e,!1),d.classed("focus",0)}),w.exit().classed("d3-exit",1).transition().duration(a.transitionDuration).remove(),w.each(function(a){var b={"d3-exit":0};b["radar-chart-serie"+a[1]]=1,d3.select(this).classed(b)}).style("fill",function(b){return a.color(b[1])}).transition().duration(a.transitionDuration).attr("r",a.radius).attr("cx",function(a){return a[0].x}).attr("cy",function(a){return a[0].y}).each("start",function(){d3.select(this).classed("d3-enter",0)});var x=t.node();x.parentNode.appendChild(x);var y=v.node();y.parentNode.appendChild(y);var z=e.node();z.parentNode.appendChild(z)}})}var a=Object.create(RadarChart.defaultConfig);return c.config=function(b){return arguments.length?(arguments.length>1?a[arguments[0]]=arguments[1]:d3.entries(b||{}).forEach(function(b){a[b.key]=b.value}),c):a},c},draw:function(a,b,c){var d=RadarChart.chart().config(c),e=d.config();d3.select(a).select("svg").remove(),d3.select(a).append("svg").attr("width",e.w).attr("height",e.h).datum(b).call(d)}};

RadarChart.draw("#radar_chart", d);

data = [{'date':'4/1854','total':8571,'U5':1,'U13':30,'U17':8,'U25':3},
{'date':'5/1854','total':1726,'U5':5,'U13':5,'U17':40,'U25':30},
{'date':'6/1854','total':1971,'U5':2,'U13':1,'U17':20,'U25':3},
{'date':'7/1854','total':5217,'U5':4,'U13':2,'U17':30,'U25':5},
{'date':'8/1854','total':3539,'U5':7,'U13':2,'U17':1,'U25':3},
{'date':'9/1854','total':1371,'U5':1,'U13':5,'U17':20,'U25':4},
{'date':'10/1854','total':5271,'U5':9,'U13':3,'U17':50,'U25':30}
]
/* Grouped Heat Map */
var causes = ["U5", "U13", "U17",'U25'];

var parseDate = d3.time.format("%m/%Y").parse;

var margin = {top: 20, right: 50, bottom: 30, left: 20},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width]);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var z = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%b"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");

var svg = d3.select("#group_heat_map").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	crimea = data;  

type(crimea);
  var layers = d3.layout.stack()(causes.map(function(c) {
    return crimea.map(function(d) {
      return {x: d.date, y: d[c]};
    });
  }));

  x.domain(layers[0].map(function(d) { return d.x; }));
  y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return z(i); });

  layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y + d.y0); })
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("width", x.rangeBand() - 1);

  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

function type(data) {
	data.forEach(function(d){
		d.date = parseDate(d.date);
		causes.forEach(function(c) { d[c] = +d[c]; });
	  	return d;
	})
}
})();


