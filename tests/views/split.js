// ==========================================================================
// Project:   Endash.SplitView Unit Test
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash module test ok equals same stop start */

var pane, view ;

module("Endash.SplitView",{
	setup: function() {
		SC.RunLoop.begin();
		pane = SC.MainPane.create({
			childViews: [ 
				Endash.SplitView.design({layout: {width: 614}, childViews: [
					SC.View.extend({layout: {width: 300, minWidth: 100}, isCollapsable: YES}),
					SC.View.extend({layout: {maxWidth: 300}, autoresize: NO}),
					SC.View.extend({layout: {minWidth: 100}, isCollapsable: YES})
				]})
			]
		});
		pane.append(); // make sure there is a layer...	    
		SC.RunLoop.end();

		view = pane.childViews[0];
	},
    	
	teardown: function() {
		pane.remove();
		pane = view = null ;
	}		
});

test("Calculates the correct drag range", function() {
	view.set('thicknesses', [150, 300, 150])	

	dragRange1 = view.dragRangeForDividerAtIndex(0)
	dragRange2 = view.dragRangeForDividerAtIndex(1)

	equals(157, dragRange1.start)
	equals(343, dragRange1.length)
	equals(107, dragRange2.start)
	equals(350, dragRange2.length)
});

test("iscollapsable", function() {
	var views = view.get('subViews')
	equals(YES, view.canCollapseView(views[0]))
	equals(NO, view.canCollapseView(views[1]))
	equals(YES, view.canCollapseView(views[2]))
})

test("Calculates the correct collapseRange", function() {
	dragRange1 = view.invokeDelegateMethod(view.delegate, 'dividedViewCollapseRangeForDividerAtIndex', view, 0)
	dragRange2 = view.invokeDelegateMethod(view.delegate, 'dividedViewCollapseRangeForDividerAtIndex', view, 1)

	equals(10, dragRange1.start)
	equals(1604, dragRange2.length)
});

test("Resizes properly and respects autoresize", function() {
	view.set('thicknesses', [150, 300, 150])	
	view.adjust('width', 714)
	equals(200, view.get('thicknesses')[0])
	equals(300, view.get('thicknesses')[1])
	equals(200, view.get('thicknesses')[2])
});
