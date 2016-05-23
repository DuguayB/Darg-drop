var App = 
{
	$svg: null,

	$canvas: null,

	config: {
		step: 1
	},

	selected: null,
	graph: null,
	paper: null,

	linking: null,
	
	linkingDestination: null,

	constraint: function (cell, e, x, y)
	{
		var boundings = cell.getBBox();
		var needConstraint = false;


		if (boundings.x <= 0)
		{
			x += App.config.step;
			needConstraint = true;
		}
		else if (boundings.x + boundings.width >= App.$svg.width())
		{
			x -= App.config.step;
			needConstraint = true;
		}

		if (boundings.y <= 0)
		{
			y += App.config.step;
			needConstraint = true;
		}
		else if (boundings.y + boundings.height >= App.$svg.height())
		{
			y -= App.config.step;
			needConstraint = true;
		}

		if (needConstraint)
			cell.pointermove(e, x, y);
	},

	selectCell: function (cell, event, x, y)
	{
		if (cell.model.attributes.type === 'link')
			return false;

		App.unselect();

		App.selected = cell;


		cell.model.toFront();

		var $sel = $('<div class="selection"><i class="action icon-delete"></i><i class="action icon-copy"></i><i class="action icon-link"></i></div>')
		.appendTo(App.$canvas) //ajouter à notre canvas
		.width(cell.model.get('size').width + 4)
		.height(cell.model.get('size').height + 4)
		.css('left', cell.model.get('position').x - 4)
		.css('top', cell.model.get('position').y - 4);


		$sel.resizable({
			handles: "se, sw, nw, ne", //quatre angles
			containment: App.$canvas,
			grid: [App.config.step, App.config.step], //redimensionner 1px par 1px
			minWidth: Math.max(App.config.step, 20), 
			minHeight: Math.max(App.config.step, 20),
			resize: function(event, ui)
			{
				var pos = $sel.position();
				App.selected.model.set({
					position: {x: pos.left + 4, y: pos.top + 4},
					size: {width: $sel.width() - 4, height: $sel.height() - 4}
				});
			}

		});

		$('.icon-delete', $sel).click(App.delSelectedCell);

		$('.icon-copy', $sel).click(App.cloneSelectedCell);
		// on a crée le lien quand on appuie sur le bouton de la souris, puis on déplace le lien lors du drag,
		//              et on finalise lorsqu'on relâche le bouton (si on est au-dessus d'une cellule)
		$('.icon-link', $sel).on('mousedown', App.startLink);

	},

	unselect: function()
	{
		if (!App.selected)
			return;

		$('.selection', App.$canvas).remove();
		App.selected = null;
	},

	onPositionChanged: function(cell, position, translation)
	{
		if (!App.selected)
			return;

		if (cell.id != App.selected.model.id)
			return;

		$('.selection', App.$canvas).css('left', position.x - 4).css('top', position.y - 4);
	},

	delSelectedCell: function()
	{
		if (!App.selected)
			return;

		App.selected.model.remove();
		App.clearSelection();
	},

	cloneSelectedCell: function()
	{
		var newCell = App.selected.model.clone();
		newCell.translate(20, 20);
		App.graph.addCell(newCell);
		newCell.toBack();
	},

	clearSelection: function()
	{
		if (App.selected)
			$('#myholder').find('.selection').remove();

		App.selected = null;
	},

//----new
/**
	 * On regroupe toutes les fonctions qui sont liées à la gestion de la création du lien
	 *
	 */
	 handleCreateLink: function()
	 {
		//
		// Quand on déplace la souris sur le canvas (et qu'on est en mode "création de lien"),
		// on met à jour la "destination" du lien
		//
		App.$canvas.on('mousemove', function(e)
		{
			// Pas en mode création de lien ? On sort.
			if (!App.linking)
				return;

			// On définit la position d'arrivée du lien
			App.linking.set({target: App.globalToLocal(e.pageX, e.pageY)});

			// On récupère les cellules sous le pointeur de la souris
			var cells = App.graph.findModelsFromPoint(App.globalToLocal(e.pageX, e.pageY));

			// S'il y en a, on définit la cellule de destination (on prend la première cellule trouvée dans la liste)
			if (cells.length)
				App.setLinkingDestination(cells[0]);
			else // Sinon, on supprime l'éventuelle cellule de destination actuelle
				App.setLinkingDestination(null);

			// On "mange" l'événement de mousemove
			e.stopPropagation();
			return false;
		});


		//
		// Quand on quitte la zone du canvas, on annule la création du lien
		//
		App.$canvas.on('mouseleave', function(e)
		{
			// Pas en mode création de lien ? On sort.
			if (!App.linking)
				return;

			// On annule la création du lien
			App.cancelLink();

			// On "mange" l'événement de mouseleave
			e.stopPropagation();
			return false;
		});


		//
		// Quand on relâche le bouton de la souris (et qu'on est en mode "création de lien"),
		// on vérifie s'il y a des cellules sous la souris, si oui on crée définitivement le lien
		//
		App.$canvas.on('mouseup', function(e)
		{
			// Pas en mode création de lien ? On sort.
			if (!App.linking)
				return;

			// Est-on actuellement au-dessus d'une cellule ?
			if (App.linkingDestination)
			{
				// Si oui, on définit la cible du lien
				App.linking.set({target: {id: App.linkingDestination.id}});

				// On supprime le highlight de la cellule de destination
				App.setLinkingDestination(null);

				// On sort du mode "création de lien", pour permettre une nouvelle création
				App.linking = null;

				// On annule la sélection de cellule
				App.clearSelection();
			}
			else
			{
				// On a relâché le bouton de la souris sans être au-dessus d'une cellule,
				// donc on annule la création du lien
				App.cancelLink();
			}

			// On "mange" l'événement mouseup
			e.stopPropagation();
			return false;
		});
	},

	/**
	 * Définir la cellule de destination du lien en cours de création (peut tout à fait être "null")
	 *
	 */
	 setLinkingDestination: function(cell)
	 {
		// Pas en mode création de lien ? On sort.
		if (!App.linking)
			return;

		// S'il y avait une cellule précédemment highlightée, on la "dé-highlight"
		if (App.linkingDestination)
			App.paper.findViewByModel(App.linkingDestination).unhighlight();

		// On s'assure qu'on n'essaie pas de se linker avec soi-même...
		if (cell && cell.id == App.linking.get('source').id)
			cell = null;

		// On met à jour la cellule de destination
		App.linkingDestination = cell;

		// Si c'est une cellule (et non pas "null"), alors on highlight la cellule
		if (App.linkingDestination)
			App.paper.findViewByModel(App.linkingDestination).highlight();
	},


	startLink: function(e)
	{
		// Impossible de créer un lien quand il y a déjà une création en cours
		if (App.linking)
			return;

		// Impossible de créer un lien quand aucune cellule n'est sélectionnée
		if (!App.selected)
			return;

		// On crée le lien dans le graph/model, avec pour source la cellule sélectionnée,
		// et pour destination la position actuelle (convertie en coordonnées locales bien sûr)
		App.linking = new joint.dia.Link({
			source: {id: App.selected.model.id},
			target: App.globalToLocal(e.pageX, e.pageY)
		});

		// On ajoute le lien dans le graph/model
		App.graph.addCell(App.linking);

		// On "mange" l'événement de mousedown
		e.stopPropagation();
		return false;
	},

	/**
	 * Annuler la création d'un lien
	 *
	 */
	 cancelLink: function()
	 {
		// Pas en mode création de lien ? On sort.
		if (!App.linking)
			return;

		// D'abord on s'assure qu'on supprime bien l'highlight éventuel
		App.setLinkingDestination(null);

		// Ensuite on supprime le lien en cours de création
		App.linking.remove();
		App.linking = null;
	},

	/**
	 * Convertir des coordonnées globales (par rapport à la page html) en coordonnées locales au graphe (paper)
	 *
	 *
	 */
	 globalToLocal: function(x, y)
	 {
	 	var offset = App.$canvas.offset();

	 	return {
	 		x: x - offset.left + App.$canvas.scrollLeft(),
	 		y: y - offset.top + App.$canvas.scrollTop()
	 	};
	 }


	};
//s-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------s
function new_img(path, pos_y, graph) {
	var image = new joint.shapes.basic.Image({
		position : {x : 100, y : pos_y },
		size : { width : 50, height : 50 },
		attrs : { image : { "xlink:href" : path, width : 50, height : 50 }
	}
});
	graph.addCell(image);
}

function a(){	
	var htmlElement = joint.shapes.basic.Rect.extend({
		defaults: joint.util.deepSupplement({
			type: 'html.Element',
			attrs: {rect: { stroke: 'none', 'fill-opacity': 0 } }
		},	
		joint.shapes.basic.Rect.prototype.defaults)
	});
	test = new htmlElement({
		position: { x: 80, y: 80 },
		size: { width: 50, height: 50 },
		label: 'label',
		color: '#444444'
	});
	return test;
}

$(document).ready(function() {

	App.$canvas = $('#myholder');

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


new_img("img/thalie_9843R1w1.jpg", 20, graph_tools);
new_img("img/5655c3ff.jpg", 90, graph_tools);
new_img("img/Buttocksurgery.jpg", 160, graph_tools);
new_img("img/d5302569.jpg", 230, graph_tools);
new_img("img/LOL.jpg", 300, graph_tools);

	//          --------------------------------------------------------- PAPER GRAPH PRINCIPAL --------------------------------------------------------------------------
	var graph = new joint.dia.Graph;
	App.graph = graph;// Sameh: mettre à jour la variable graph

	var paper = new joint.dia.Paper({
		el: $('#myholder'),
		width: $('#myholder').width(),
		height: $('#myholder').height(),
		model: graph
	});	

	App.paper = paper; //sameh

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


	joint.shapes.html = {};
	var lol = a();
	graph.addCell(lol);


	// ---------------------------------------------------------- Sameh: J'adapte l'Overview à la SVG--------------------------------------------------------------------------
	var $cont = $('#myholder-small');
	var $large = $('#myholder');
	var ratio = $cont.width() / $large.width();

	var paperSmall = new joint.dia.Paper({
		el: $('#myholder-small'),
		width: $cont.width(),
		height: ratio * $large.height(),
		model: graph,
		gridSize: 1
	});
	paperSmall.scale(ratio);
	paperSmall.$el.css('pointer-events', 'none');



  //-------------------------------------------Sameh: J'empêche les cellules de sortir de la zone paper
  App.$svg = $('#myholder svg');
  paper.on('cell:pointermove', App.constraint);
//--------------------------------

//

paper.on('cell:pointerdown', App.selectCell);

graph.on('change:position', App.onPositionChanged);
App.handleCreateLink();

});
