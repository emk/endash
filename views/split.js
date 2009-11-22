// ==========================================================================
// Project:   Endash.SplitView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash */

sc_require('views/divided')
sc_require('mixins/split_view_delegate');
sc_require('mixins/thumb_delegate');

/**
  @class
  
*/
Endash.SplitView = Endash.DividedView.extend(Endash.SplitViewDelegate,
/** @scope Endash.SplitView.prototype */ {
	
	dividerView: Endash.ThumbView.extend({
	  classNames: ['sc-split-divider-view']
	}),
	
	dividerSpacing: 7,
	
	dividerThickness: 7,

	adjustThicknessesForDividerAtIndex_byOffset: function(index, offset) {
		var ind = index;
		var diff = offset * -1
		var views = this.get('subViews')
		var view = ind = index
		var end = offset < 0 ? -1 : views.get('length')
		
		while(diff != 0 && ind != end && views[ind]) {
			diff = this.adjustThicknessForView_atIndex_byOffset(views[ind], ind, diff * -1)
			ind += (start < end) ? 1 : -1
		}
		
		view++
		this.adjustThicknessForView_atIndex_byOffset(views[view], view, (offset * -1) - diff)
	},
	
	dragRangeForDividerAtIndex: function(index) {
		var thickness = this.thickness()
		var subViews = this.get('subViews')
		var offset = SC.viewportOffset(this.get('layer'))
		var views = subViews
		var ind, max, min, maxPos, minPos, ret;
		var len = views.get('length')
		var dividerSpacing = this.get('dividerSpacing')
		var dividers = 0
		var immediateViews = this._subViewsForDividerAtIndex(index)
		var leftView = immediateViews[0]
		var rightView = immediateViews[1]
		var thickness = this.get('thickness')
		var min = [0, 0, 0]
		var max = [0, 0, 0]

		for(ind = 0; ind < len; ind++) {
			arr = (ind < index ? 0 : (ind > index ? 2 : 1)) 
			min[arr] += this.minThicknessForView(views.objectAt(ind))
			max[arr] += this.maxThicknessForView(views.objectAt(ind)) || 9999
		}
		
		dividers = (len - index - 1) * dividerSpacing
		maxPos = Math.min(thickness - min[2] - dividers, this.positionForView(leftView) + max[1])

		dividers = (index * dividerSpacing)
		minPos = Math.max(min[0] + min[1] + dividers, (this.positionForView(rightView) + this.thicknessForView(rightView)) - (this.maxThicknessForView(rightView) || 9999))

		return {start: minPos, length: maxPos - minPos}
	},
	
	adjustThicknesses: function() {
		if(this._adjusting || !this.get('isVisibleInWindow'))
			return
		this._adjusting = YES

		var thicknesses = this.get('thicknesses')
		var thickness = this.get('thickness')
		var views = this.get('subViews')
		var len = views.get('length')

		var sum = 0
		var adjustedSum = 0
		var multiplier = 1
		var newThickness = 0
		var adjustedThickness = 0
		var overflowThickness = 0
		var overflow = 0
		var i = 0
		var isSet = []
		var unSet = len
		
		if(SC.none(thicknesses)) {
			thicknesses = views.map(function(view) {
				return view.get('layout').width || 1
			})
			this.set('thicknesses', thicknesses)
		}
		
		for(var i = 0, len = thicknesses.get('length'); i < len; i++)
			sum += thicknesses.objectAt(i)
		
		if(sum == this._sum && thickness == this._thickness)
			return thicknesses
				
		var dividerSpacing = this.get('dividerSpacing')
		var dividerThicknesses = ((len - 1) * dividerSpacing)

		if(sum != thickness - dividerThicknesses) {
			isSet = thicknesses.map(function() { return false })
			multiplier = ((thickness - dividerThicknesses) / sum)
			do {
				for(var i = 0, adjustedSum = 0; i < len; i++) {
					if(isSet.objectAt(i)) {
						adjustedSum += thicknesses.objectAt(i)
					} else {
						
						newThickness = Math.round(thicknesses.objectAt(i) * multiplier)
						overflowThickness = overflow / unSet
						overflowThickness = overflow < 0 ? Math.floor(overflowThickness) : Math.ceil(overflowThickness)
						adjustedSum += (adjustedThickness = (views.objectAt(i).get('autoresize') === NO) ? thicknesses.objectAt(i) : this._setThickness_forView_atIndex(newThickness + overflowThickness, views.objectAt(i), i))
					
						if(newThickness == adjustedThickness) {
							overflow -= overflowThickness
						} else {
							overflow += newThickness - adjustedThickness
							isSet.replace(i, 1, true)
							--unSet
						}
					}
				}

				multiplier = 1
				if(overflow == 0 && adjustedSum != (thickness - dividerThicknesses))
					overflow = adjustedSum - dividerThicknesses - thickness

			} while(overflow != 0 && unSet > 0)
		}		
		
		this._sum = this._thickness = thickness
		this.updateChildLayout()
		this._adjusting = NO
	}.observes('thicknesses', 'frame', 'isVisibleInWindow'),
	
	_dragRangeForDivider: function(thumbView) {
		var index = this.get('dividers').indexOf(thumbView) ;
  	var max = this.invokeDelegateMethod(this.delegate, 'splitView_constrainMaxCoordinateofDividerAtIndex', this, index)
  	var min = this.invokeDelegateMethod(this.delegate, 'splitView_constrainMinCoordinateofDividerAtIndex', this, index)
		return {start: min, length: (max - min)}
	},

});

SC.SplitView = Endash.SplitView.extend({
	
	init: function() {
		var topLeftView = this.get('topLeftView')
		var bottomRightView = this.get('bottomRightView')
		
		this.set('childViews', [topLeftView, bottomRightView])
		this.set('dividerSpacing', this.get('dividerThickness'))
		
		sc_super()
	}
})
