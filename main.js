$(document).ready(function() {


//	--------------------------------------------------------------- PAPER TOOL BAR ------------------------------------------------------------------------------------------------------
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
    	attrs : { image : { "xlink:href" : "thalie_9843R1w1.jpg", width : 50, height : 50 }
    			}
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


	// ------------------------------------------------------------------ CREATION D'UN ITEM AVEC PORTS (A RENDRE GENERIQUE) ---------------------------------------------

	joint.shapes.devs.CircleModel = joint.shapes.devs.Model.extend({

  		markup: '<g class="rotatable"><g class="scalable"><image class="body" href="LOL.jpg"/><button>ok</button></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
  		portMarkup: '<g class="port port<%= id %>"><rect class="port-body"/><text class="port-label"/></g>',

  		defaults: joint.util.deepSupplement({
    
    		type: 'devs.CircleModel',
    		attrs: {
    			'.body': { width: 50, height: 50, stroke: 'blue', fill: 'lightblue' },
      			'.port-body': { width: 10, height: 10, x: -5, stroke: 'gray', fill: 'lightgray', magnet: 'active' } }
  			},
  			joint.shapes.devs.Model.prototype.defaults)
	});

	joint.shapes.devs.CircleModelView = joint.shapes.devs.ModelView;

	var m1 = new joint.shapes.devs.CircleModel({
  		position: { x: 100, y: 370},
  		size: { width: 50, height: 50 },
	  	inPorts: ['', ''],
  		outPorts: [''],
	});

	graph_tools.addCells([image, image2, image3, image4, image5, m1]);




	//          --------------------------------------------------------- PAPER GRAPH PRINCIPAL --------------------------------------------------------------------------
	var graph = new joint.dia.Graph;

	var paper = new joint.dia.Paper({
		el: $('#myholder'),
		width: $('#myholder').width(),
		height: $('#myholder').height(),
		model: graph
	});


	// ------------------------------------------------------------------- DEPLACEMENT ITEM TOOLBAR GRAPH ------------------------------------------------------------------
	// CREATION DE NOUVEL ITEM A PARTIR DE LA TOOLBAR
	paper_tools.on('cell:pointerdown', function(cellView, e, x, y) {
		
		// CREATION D'UNE DIVISION "VOLANTE" SE DEPLACANT SUR LA PAGE
		$('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
		
		// CREATION D'UN PAPER ET D'UN GRAPH DANS LA DIV
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
		
		// DEPLACEMENT DE LA DIV 
		$('body').on('mousemove.fly', function(e) {
			$("#flyPaper").offset({ 
				left: e.pageX - offset.x, top: e.pageY - offset.y 
			});
		}); 
		
		// DEPOS DE LA DIV SUR LE GRAPH DE DESTINATION
		$('body').on('mouseup.fly', function(e) {
			var x = e.pageX, y = e.pageY, target = paper.$el.offset();
		
			// VERIFICATION SI DEPOS SUR LE GRAPH OU NON
			if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
		
				// CLONAGE DE L'ELEMENT DE LA DIV TMP
				var s = flyShape.clone();
				s.position(x - target.left - offset.x, y - target.top - offset.y);
		
				// AJOUT DE L'ELEMENT SUR LE GRAPH DE DESTINATION
				graph.addCell(s);
			} 
			$('body').off('mousemove.fly').off('mouseup.fly');
		
			// DESTRUCTION DE LA DIV TEMPORAIRE
			flyShape.remove();
			$('#flyPaper').remove();
		});
	});

	// ------------------------------------------------------------------------ BOX AUTOUR DES ITEMS AVEC BOUTONS (MARCHE PAS) -------------------------------------------------------

	/*joint.shapes.html = {};
	joint.shapes.html.Element = joint.shapes.basic.Rect.extend({
  		defaults: joint.util.deepSupplement({
    	type: 'html.Element',
    	attrs: {rect: { stroke: 'none', 'fill-opacity': 0 } }
  		},	
  		joint.shapes.basic.Rect.prototype.defaults)
	});

	// Create a custom view for that element that displays an HTML div above it.
	// -------------------------------------------------------------------------

	joint.shapes.html.ElementView = joint.dia.ElementView.extend({

  		template: [
    		'<div class="html-element">',
    		'<button class="delete">x</button>',
    		'</div>'
  		].join(''),

  		initialize: function() {
    		_.bindAll(this, 'updateBox');
    		joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    		this.$box = $(_.template(this.template)());

    		this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
    		// Update the box position whenever the underlying model changes.
    		this.model.on('change', this.updateBox, this);
    		// Remove the box when the model gets removed from the graph.
    		this.model.on('remove', this.removeBox, this);

    		this.updateBox();
  		},
  		render: function() {
    		joint.dia.ElementView.prototype.render.apply(this, arguments);
    		this.paper.$el.prepend(this.$box);
    		this.updateBox();
    		return this;
  		},
  		updateBox: function() {
    		// Set the position and dimension of the box so that it covers the JointJS element.
    		var bbox = this.model.getBBox();
    		// Example of updating the HTML with a data stored in the cell model.
    		this.$box.find('label').text(this.model.get('label'));

    		this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)', background: this.model.get('color')}); // I've tried to add it like a background
  		},
  		removeBox: function(evt) {
   	 	this.$box.remove();
  		}
	});

	var lol = new joint.shapes.html.Element({
    	position: { x: 80, y: 80 },
    	size: { width: 50, height: 50 },
    	label: 'label',
    	color: '#444444'
  	});
	graph.addCell(lol);*/
});

