// ==========================================================================
// Project:	 Endash.SplitView
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
	
	defaultViewThickness: null,

	adjustThicknessesForDividerAtIndex_byOffset: function(index, offset) {
		var ind = index;
		var views = this.get('subViews')
		var view = start = ind = index
		var view2
		var end = offset < 0 ? -1 : views.get('length')
		var diff
		
		if( offset > 0 ) {
			start = index + 1
			end = views.get('length')
			view2 = index
			offset *= -1
		} else {
			start = index
			end = -1
			view2 = index + 1
		}
		
		diff = offset
		view = ind = start
		
		do {
			diff = this.adjustThicknessForView_atIndex_byOffset(views[ind], ind, diff) * -1
			ind += (start < end) ? 1 : -1
		} while(diff != 0 && ind != end && views[ind])
		
		this.adjustThicknessForView_atIndex_byOffset(views[view2], view2, offset * -1 + diff)
	},
	
	dragRangeForDividerAtIndex: function(index) {
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
			min[arr] += (views.objectAt(ind).get('isCollapsed') && ind < index ? 0 : this.minThicknessForView(views.objectAt(ind)))
			max[arr] += this.maxThicknessForView(views.objectAt(ind)) || 9999
		}
		
		dividers = (len - index - 1) * dividerSpacing
		maxPos = Math.min(thickness - min[2] - dividers, this.positionForView(leftView) + max[1])

		dividers = (index * dividerSpacing)
		minPos = Math.max(min[0] + min[1] + dividers, (this.positionForView(rightView) + this.thicknessForView(rightView)) - (this.maxThicknessForView(rightView) || 9999))

		return {start: minPos, length: maxPos - minPos}
	},
	
	_adjustThicknesses: function() {
		if(this._adjusting)
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
				
		for(var i = 0, len = thicknesses.get('length'); i < len; i++)
			sum += thicknesses.objectAt(i)
		

		
		if(sum == this._sum && thickness == this._thickness) {
			this._adjusting = NO
			return thicknesses
		}
	
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
						
						if(thicknesses.objectAt(i) == 0) {
							isSet.replace(i, 1, [true])
						} else {
						
							newThickness = Math.round(thicknesses.objectAt(i) * multiplier)
							overflowThickness = overflow / unSet
							overflowThickness = overflow < 0 ? Math.floor(overflowThickness) : Math.ceil(overflowThickness)
							adjustedSum += (adjustedThickness = (views.objectAt(i).get('autoresize') === NO) ? thicknesses.objectAt(i) : this._setThickness_forView_atIndex(newThickness + overflowThickness, views.objectAt(i), i))
					
							if(newThickness == adjustedThickness) {
								overflow -= overflowThickness
							} else {
								overflow += newThickness - adjustedThickness
								isSet.replace(i, 1, [true])
								--unSet
							}
						}
					}
				}

				multiplier = 1
				if(overflow == 0 && adjustedSum != (thickness - dividerThicknesses))
					overflow = adjustedSum - dividerThicknesses - thickness

			} while(overflow != 0 && unSet > 0)
		}		
		
		this._sum = (this._thickness = thickness) - dividerThicknesses
		this._adjusting = NO
	},
	
	_dragRangeForDivider: function(thumbView) {
		var index = this.get('dividers').indexOf(thumbView) ;
		var max = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainMaxCoordinateofDividerAtIndex', this, index)
		var min = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainMinCoordinateofDividerAtIndex', this, index)
		return {start: min, length: (max - min)}
	},

});
