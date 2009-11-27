Endash.DividedViewDelegate = {
	isDividedViewDelegate: YES,
	
	dividedViewCollapseRangeForDividerAtIndex: function(dividedView, index, dragRange) {
		var views = dividedView._subViewsForDividerAtIndex(index)
		var view;
		
		var start, end;
		
		if(dividedView.canCollapseView(views[0]))
			start = dividedView.positionForView(views[0]) + 10
		else
			start = -1000
		
		if(dividedView.canCollapseView(views[1]))
			end = dividedView.positionForView(views[1]) + dividedView.thicknessForView(views[1]) - 10
		else
			end = 9999
			
		return {start: start, length: end - start}
	},
	
	dividedViewCanCollapseView: function(dividedView, view) {
		return view.get('isCollapsable')
	},
	
	dividedViewWillCollapseView: function(dividedView, view) {
		var minThickness = dividedView.minThicknessForView(view)		
		var direction = dividedView.get('layoutDirection')

		view.set('_minThickness', minThickness)
		view.adjust((direction == SC.LAYOUT_HORIZONTAL) ? 'minWidth' : 'minHeight', 0)
	},
	
	dividedViewDidCollapseView: function(dividedView, view) {
		var direction = dividedView.get('layoutDirection')
		view.adjust((direction == SC.LAYOUT_HORIZONTAL) ? 'minWidth' : 'minHeight', view.get('_minThickness'))
		view.set('_minThickness', null)
	},

	dividedViewWillUncollapseView: function(dividedView, view) {
		
	},
	
	dividedViewDidUncollapseView: function(dividedView, view) {

	}
	

}