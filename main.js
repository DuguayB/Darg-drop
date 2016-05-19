

$(document).ready(function() {

	var graph_tools = new joint.dia.Graph;

	var paper_tools = new joint.dia.Paper({
		el: $('#tools'),
		width: $('#tools').width(),
        height: $('#tools').height(),
        model: graph_tools,
        gridSize: 1,
        interactive: false
	})

	var image = new joint.shapes.basic.Image({
    	position : {x : 100, y : 20 },
    	size : { width : 50, height : 50 },
    	attrs : { image : { "xlink:href" : "thalie_9843R1w1.jpg", width : 50, height : 50 } }
	});

	var image2 = new joint.shapes.basic.Image({
    	position : {x : 100, y : 90 },
    	size : { width : 50, height : 50 },
    	attrs : { image : { "xlink:href" : "5655c3ff.jpg", width : 50, height : 50 } }
	});
	
	var image3 = new joint.shapes.basic.Image({
    	position : {x : 100, y : 160 },
    	size : { width : 50, height : 50 },
    	attrs : { image : { "xlink:href" : "Buttocksurgery.jpg", width : 50, height : 50 } }
	});
	
	var image4 = new joint.shapes.basic.Image({
    	position : {x : 100, y : 230 },
    	size : { width : 50, height : 50 },
    	attrs : { image : { "xlink:href" : "d5302569.jpg", width : 50, height : 50 } }
	});

	var image5 = new joint.shapes.basic.Image({
    	position : {x : 100, y : 300 },
    	size : { width : 50, height : 50 },
    	attrs : { image : { "xlink:href" : "LOL.jpg", width : 50, height : 50 } }
	});

	graph_tools.addCells([image, image2, image3, image4, image5]);

	var graph_tools = new joint.dia.Graph;

	var paper = new joint.dia.paper({
		el: $('#myholder'),
		width: $('#myholder').width(),
		height: ($('#myholder').height() - 50),
		model: graph
	})
});

