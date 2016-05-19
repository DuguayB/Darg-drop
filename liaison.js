
$(document).ready(function() { 
   /*var graph = new joint.dia.Graph;

    /*CANEVAS
    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 1000,
        height: 500,
        model: graph,
        gridSize: 1
    });

    /* CREER UN ITEM
    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue',  }, text: { text: 'my box', fill: 'white' } }
    });

    var cercle = new joint.shapes.basic.Circle({
    	position : {x: 100, y: 250},
    	size: { width: 100, height: 100}
    });

    var rect2 = rect.clone();
    rect2.translate(300);

    /* CREER UN LIEN ENTRE DEUX ITEMS 
    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
    });

    /* CREER UNE COPIE D'UN ITEM 
    var rect3 = rect.clone();

    graph.addCells([rect]);
	var creadim = function ()
	{
		var rect = new joint.shapes.basic.Rect({
			position: { x: 100, y: 30 },
			size: { width: 100, height: 30 },
			attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    	});
		graph.addCells([rect]);
	}
	var crealink = function ()
	{
		var link = new joint.dia.Link({
        	source: { x: 300, y: 20 },
        	target: { x: 540, y: 20 },
        	attrs: {}
    	});

    	link.attr({
        	'.connection': { stroke: 'black', 'stroke-width': 1 },
			'.marker-source': { stroke: 'black', fill: 'black', d: 'M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z' },
        	'.marker-target': { stroke: 'black', fill: 'black', d: 'M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z' }
    	});
		graph.addCells([link])
	}
	$("#test_button").on("click", crealink);
	var graph = new joint.dia.Graph;
	var paper = new joint.dia.Paper({
		el: $('#paper'),
		width: 600,
		height: 200,
		model: graph,
		gridSize: 1 
	});
	var rect = new joint.shapes.basic.Rect({
		position: { x: 100, y: 30 }, size: { width: 100, height: 30 },
		attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } } 
	});
	graph.addCells([rect]); 
	var graph2 = new joint.dia.Graph;
	var paper2 = new joint.dia.Paper({ el: $('#paper2'), width: 600, height: 200, model: graph2, gridSize: 1 }); paper2.on('cell:pointerup',function (cellView, evt, x, y) { 
	var rect4 = new joint.shapes.basic.Rect({
			position: { x: 10, y: 50 },
			size: { width: 100, height: 30 },
			attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } } 
		});
		graph.addCells([rect4]); 
	});
	paper2.on('cell:pointerdown',function (cellView, evt, x, y) {
		$('body').append('<div id="flyPaper" class="box" style="position: fixed;z-index: 100;display:block;opacity:.7;"></div>');
		var graph3 = new joint.dia.Graph;
		var paper3 = new joint.dia.Paper({
				el: $('#flyPaper'),
				width: 600,
				height: 200,
				model: graph3,
				gridSize: 1 
			});
		var rect3 = new joint.shapes.basic.Rect({
				position: { x: 10, y: 50 }, size: { width: 100, height: 30 },
				attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } } 
			}); 
		graph3.addCells([rect3]);
		$('body').mousemove(function(e){ 
			var mouseX = e.pageX;
			var mouseY = e.pageY;
			$( "div.box" ).offset({ top: mouseY, left: mouseX });
			//$('div.box', this).css({'top': boxPositionY,'left': boxPositionX}) }); 
		});
	});
	var rect2 = new joint.shapes.basic.Rect({
		position: { x: 10, y: 50 },
		size: { width: 100, height: 30 },
		attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } } 
		});
	graph2.addCells([rect2]);*/
	// Canvas where sape are dropped
	var graph = new joint.dia.Graph;
	var paper = new joint.dia.Paper({
		width: 1000,
		height: 60,
		el: $('#paper'),
		model: graph
	});
	// Canvas from which you take shapes
	var stencilGraph = new joint.dia.Graph;
	var	stencilPaper = new joint.dia.Paper({ 
			el: $('#paper2'),
			width: 1000,
			height: 60,
			model: stencilGraph,
			interactive: false 
		});
	var r1 = new joint.shapes.basic.Rect({
		position: { x: 10, y: 10 },
		size: { width: 100, height: 40 },
		attrs: { rect: { fill: 'blue' },text: { text: 'Rect1' } } 
	}); 
	var r2 = new joint.shapes.basic.Rect({ 
		position: { x: 120, y: 10 }, 
		size: { width: 100, height: 40 },
		attrs: {rect: { fill: 'blue' }, text: { text: 'Rect2' } } 
	});
	stencilGraph.addCells([r1, r2]);
	stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
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