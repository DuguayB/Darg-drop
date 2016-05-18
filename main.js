
$(document).ready(function() { 
   var graph = new joint.dia.Graph;

   /* CANEVAS */
    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 1000,
        height: 500,
        model: graph,
        gridSize: 1
    });

    /* CREER UN ITEM */
    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    var cercle = new joint.shapes.basic.Circle({
    	position : {x: 100, y: 250},
    	size: { width: 100, height: 100}
    })

    var rect2 = rect.clone();
    rect2.translate(300);

    /* CREER UN LIEN ENTRE DEUX ITEMS */
    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
    });

    /* CREER UNE COPIE D'UN ITEM */
    var rect3 = rect.clone();

    graph.addCells([rect, rect2, link, rect3, cercle]);
});