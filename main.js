

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


	var graph = new joint.dia.Graph;

	var paper = new joint.dia.Paper({
		el: $('#myholder'),
		width: $('#myholder').width(),
		height: $('#myholder').height(),
		model: graph
	});

	paper_tools.on('cell:pointerdown', function(cellView, e, x, y) {
		$('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
		var flyGraph = new joint.dia.Graph,
			flyPaper = new joint.dia.Paper({ 
				el: $('#flyPaper'),
				model: flyGraph,
				interactive: false 
			}), 
			flyShape = cellView.model.clone(),
			pos = cellView.model.position(),
			offset = { x: x - pos.x, y: y - pos.y };
		flyShape.position(0, 0);
		flyGraph.addCell(flyShape);
		$("#flyPaper").offset({ left: e.pageX - offset.x, top: e.pageY - offset.y });
		$('body').on('mousemove.fly', function(e) {
			$("#flyPaper").offset({ 
				left: e.pageX - offset.x, top: e.pageY - offset.y 
			});
		}); 
		$('body').on('mouseup.fly', function(e) {
			var x = e.pageX, y = e.pageY, target = paper.$el.offset();
			// Dropped over paper ?
			if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
				var s = flyShape.clone();
				s.position(x - target.left - offset.x, y - target.top - offset.y);
				graph.addCell(s);
			} 
			$('body').off('mousemove.fly').off('mouseup.fly');
			flyShape.remove();
			$('#flyPaper').remove();
		});
	});
});

