Endash.SplitViewDelegate = {
	isSplitViewDelegate: YES,
	
	splitView_canCollapseSubview: function(splitView, subView) {
		return subView.get('collapsable')
	},
	
	splitView_constrainMaxCoordinateofDividerAtIndex: function(splitView, index) {
		return SC.maxRange(splitView.dragRangeForDividerAtIndex(index))
	},
	
	splitView_constrainMinCoordinateofDividerAtIndex: function(splitView, index) {
		return SC.minRange(splitView.dragRangeForDividerAtIndex(index))
	}	
}