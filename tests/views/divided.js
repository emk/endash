// ==========================================================================
// Project:   Endash.DividedView Unit Test
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash module test ok equals same stop start */

// ==========================================================================
// Project:   Endash.SplitView Unit Test
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash module test ok equals same stop start */

var pane, view ;

module("Endash.DividedView",{
	setup: function() {
		SC.RunLoop.begin();
		pane = SC.MainPane.create({
			childViews: [ 
				Endash.DividedView.design({layout: {width: 500}}),
				Endash.DividedView.design({layout: {width: 612}, childViews: [
					SC.View.extend({layout: {width: 300, minWidth: 100}}),
					SC.View.extend({layout: {maxWidth: 300}}),
					SC.View.extend({layout: {minWidth: 100}})
				]})
			]
		});
		pane.append(); // make sure there is a layer...	    
		SC.RunLoop.end();

		view1 = pane.childViews[0];
		view2 = pane.childViews[1];
	},
    	
	teardown: function() {
		pane.remove();
		pane = view = null ;
	}		
});

test("View1 has two panes", function() {
	equals(2,view1.get('subViews').get('length'));
});

test("View1's panes have the same width", function() {
	var views = view1.get('subViews')
	equals(view1.thicknessForView(views[0]), view1.thicknessForView(views[1]))
});

test("the sum of the View1's panes (and the divider spacings) equals the thickness of View1", function() {
	var views = view1.get('subViews')
	var dividerSpacing = view1.get('dividerSpacing')
	var sum = view1.thicknessForView(views[0]) + view1.thicknessForView(views[1]) + dividerSpacing

	equals(view1.get('thickness'), sum)
});

test("View2 has three panes", function() {
	equals(3, view2.get('subViews').get('length'));
});

test("View2's first pane is 300 px", function() {
	equals(300, view2.thicknessForView(view2.get('subViews')[0]));
});

test("View2's second and third panes have the same width", function() {
	var views = view2.get('subViews')
	equals(view2.thicknessForView(views[1]), view2.thicknessForView(views[2]))
});

test("View2's panes are laid out properly", function() {
	var views = view2.get('subViews')
	equals(0, view2.positionForView(views[0]))
	equals(306, view2.positionForView(views[1]))
	equals(462, view2.positionForView(views[2]))
});

test("View2 respects minwidths", function() {
	view2.set('thicknesses', [50, 200, 50])	
	equals(100, view2.get('thicknesses')[0])
	equals(100, view2.get('thicknesses')[2])
});

test("View2 respects maxwidths", function() {
	view2.set('thicknesses', [100, 400, 100])	
	equals(300, view2.get('thicknesses')[1])
});

test("View2 calculates the correct drag range", function() {
	view2.set('thicknesses', [150, 300, 150])	

	dragRange1 = view2.dragRangeForDividerAtIndex(0)
	dragRange2 = view2.dragRangeForDividerAtIndex(1)

	equals(100, dragRange1.start)
	equals(156, dragRange2.start)
});