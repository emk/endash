// ==========================================================================
// Project:   Endash.DividedView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash */

sc_require('views/thumb');
sc_require('mixins/thumb_delegate');
/**
  @class
  
*/
Endash.DividedView = SC.View.extend(Endash.ThumbDelegate,
/** @scope Endash.DividedView.prototype */ {
  
  classNames: ['sc-split-view'],

	layoutDirection: SC.LAYOUT_HORIZONTAL,
	
  thicknesses: null,
  
  /** @private */
  thicknessesBindingDefault: SC.Binding.multiple(),

	dividers: YES,
	dividerSpacing: 6,
	dividerThickness: 6,
	dividerView: Endash.ThumbView,

	defaultView: SC.View,
	
	render: function(context, firstTime) {
		sc_super()
		if(firstTime)
			this.notifyPropertyChange("thicknesses")
	},
	
	createChildViews: function() {
    var views = this.get('childViews') ;
		var numberOfViews = views.get('length') ;
		var childCount = this.get('childCount') ;
		var numberOfSubViews = (childCount && childCount > 1) ? childCount : ((numberOfViews > 2) ? numberOfViews : 2) ;

		var direction = this.get('layoutDirection')
		var dividers = this.get('dividers') || YES

		var childViews = [] ;
		var subViews = []
		var dividers = []

		var dividerView = this.get('dividerView')

		var view;
		var thickness;
		var last = false;
		
		for(index = 0; index < numberOfSubViews; index++) {
			last = !(index < numberOfSubViews - 1)

			view = this.createChildView(this.viewForPaneAtIndex(index))
			subViews.push(view)
			childViews.push(view) ;
			
			if(!last && dividers) {
				view = this.createChildView(dividerView.extend({
					delegate: this
				}))

				dividers.push(view)
				childViews.push(view) ;
			} 
		}
		
		this.set('subViews', subViews)
		this.set('dividers', dividers)
		this.set('childViews', childViews)
  },

	viewForPaneAtIndex: function(index) {
		var views = this.get('childViews') ;
 		if(views.get('length') == 0)
			views = [SC.View] ;

		var view = views[index] || this.get('defaultView')
    
		view = view.extend({
			classNames: ['sc-split-view-pane'],
			delegate: this
		}) ;

		return view
	},

	updateChildLayout: function() {
		var thicknesses = this.get('thicknesses')
		
		if(!this.get('isVisibleInWindow') || SC.none(thicknesses))
			return

		var childViews = this.get('childViews')
		var numberOfChildViews = childViews.get('length')
		var subViews = this.get('subViews')

		var direction = this.get('layoutDirection')
		var parentThickness = this.get('thickness')
		var thicknesses = this.get('thicknesses')
		
		var dividerThickness = this.get('dividerThickness')
		var dividerSpacing = this.get('dividerSpacing')
		var dividerOffset = (dividerThickness - dividerSpacing) / 2
		
		this.set('dividerOffset', dividerOffset)
		var dividers = this.get('dividers')

		var frame = this.get('frame')
		
		var index = 0
		var point = 0;
		var delta = 0;
		var offset = 0;
		var layoutPoint = 0;
		var thickness = 0;
		
		var layout;
		var view;

		for(index; index < numberOfChildViews; index++) {
			view = childViews.objectAt(index)
			last = (dividerOffset == 0) ? (index == numberOfChildViews - 1) : (subViews.slice(-1)[0] == view)
			offset = 0

			if(!dividers || index % 2 == 0) {
				thickness = thicknesses.objectAt(dividers ? (index / 2) : index)
				delta = thickness
			} else {
				thickness = dividerThickness
				offset = dividerOffset
				delta = dividerSpacing
			}

			layoutPoint = parentThickness - point - thickness + offset
			layout = {}

			if(direction == SC.LAYOUT_HORIZONTAL) {
				layout = {top: 0, bottom: 0, left: point - offset}
				layout.width = last ? null : thickness
				layout.right = last ? 0 : null
			} else {
				layout = {left: 0, right: 0, top: point - offset}
				layout.height = last ? null : thickness
				layout.bottom = last ? 0 : null
			}
			
			point += delta

			this.updateLayout_forView(layout, view)
		}
	}.observes('thicknesses', 'isVisibleInWindow'),	
	
	updateLayout_forView: function(layout, view) {
		view.adjust(layout)			
	},

	
	thumb_thumbViewDidBeginDrag: function(thumbView, evt) {
		var direction = this.get('layoutDirection')
		var dragRange = this._dragRangeForDivider(thumbView)
		var viewOffset = SC.viewportOffset(this.get('layer'))
		var thumbOffset = SC.viewportOffset(thumbView.get('layer'))

		var dividerThickness = this.get('dividerThickness')
		var dividerOffset = this.get('dividerOffset')

		if(direction == SC.LAYOUT_HORIZONTAL) {
			thumbOffset = evt.pageX - thumbOffset.x
			viewOffset = viewOffset.x
 		} else {
			thumbOffset = evt.pageY - thumbOffset.y
			viewOffset = viewOffset.y
		}
		
		dragRange.start += viewOffset + thumbOffset
		
		this._dragRange = dragRange
		this._lastInside = YES
	},
	
	thumb_thumbViewWasDragged_withOffset: function(thumbView, offset, evt) {
		var direction = this.get('layoutDirection')
		var dividers = this.get('dividers')
		var index = dividers.indexOf(thumbView)
		var dragRange = this._dragRange
		var point = (direction == SC.LAYOUT_HORIZONTAL) ? evt.pageX : evt.pageY
		var offset = (direction == SC.LAYOUT_HORIZONTAL) ? offset.x : offset.y
		var inside = SC.valueInRange(point, dragRange) ;
		var lastInside = this._lastInside
		this._lastInside = inside

		var offset = this._adjustedOffsetForDrag(inside, lastInside, dragRange, point, offset)
		if(offset == 0)
			return
			
		this.beginPropertyChanges()
		this.adjustThicknessesForDividerAtIndex_byOffset(index, offset)
		this.endPropertyChanges()
		this.notifyPropertyChange('thicknesses')
	},
	
	thumb_thumbViewDidEndDrag: function(thumbView, evt) {
		this._dragRange = this._lastInside = null
	},
	
	dragRangeForDividerAtIndex: function(index) {
		var views = this.get('subViews')
		var view = views[index]
		var thickness = this.get('thickness')
		var maxThickness = this.maxThicknessForView(view)
		
		var min = this.positionForView(view) + this.minThicknessForView(view)
		var max = SC.none(maxThickness) ? thickness : this.positionForView(view) + this.maxThicknessForView(view)

		return {start: min, length: max - min}
	},
	
	adjustThicknessesForDividerAtIndex_byOffset: function(index, offset) {
		var views = this.get('subViews')
		var view = views[index]
		this.adjustThicknessForView_atIndex_byOffset(view, index, offset)
	},

	adjustThicknessForView_atIndex_byOffset: function(view, index, offset) {
		var thicknesses = this.get('thicknesses')
		var thickness = thicknesses.objectAt(index) + offset
		return (this._setThickness_forView_atIndex(thickness, view, index) - thickness)
	},
	
	positionForView: function(view) {
		var direction = this.get('layoutDirection')
		var frame = view.get('frame')
		return (direction == SC.LAYOUT_HORIZONTAL) ? frame.x : frame.y
	},
	
	thicknessForView: function(view, position) {
		var direction = this.get('layoutDirection')
		var frame = view.get('frame')

		if(direction == SC.LAYOUT_HORIZONTAL)
			return frame.width
		
		return frame.height
	},
	
	minThicknessForView: function(view, position) {
		var direction = this.get('layoutDirection')
		var layout = view.get('layout')
		var ret
		
		if(direction == SC.LAYOUT_HORIZONTAL)
			ret = layout.minWidth
		else
			ret = layout.minHeight

		if(ret)
			return ret
		
		return this.get('minimumThickness') || 5
	},
	
	maxThicknessForView: function(view, position) {
		var direction = this.get('layoutDirection')
		var layout = view.get('layout')

		if(direction == SC.LAYOUT_HORIZONTAL)
			return layout.maxWidth
		
		return layout.maxHeight
	},
	
	thickness: function(key, value) {
		if(SC.none(value))
			return this.thicknessForView(this)
			
		sc_super()
	}.property(),
	
	
	_dragRangeForDivider: function(thumbView) {
		if(this.__dragRangeForDivider && this.__dragRangeForDivider[thumbView])
			return this.__dragRangeForDivider[thumbView]

		var index = this.get('dividers').indexOf(thumbView) ;
		var ret = this._dragRangeForDivider[thumbView] = this.dragRangeForDividerAtIndex(index)

		return ret
	},
	
	_subViewsForDividerAtIndex: function(index) {
		var views = this.get('subViews')	
	
		if(index > (views.length - 2))
			return false 
	
		return views.slice(index, index + 2)
	},
	
	_adjustedOffsetForDrag: function(inside, lastInside, dragRange, point, offset) {
		var ret = 0
		if(inside)
			if(lastInside)
				ret = offset
			else
				if(offset > 0)
					ret = point - SC.minRange(dragRange)
				else
					ret = point - SC.maxRange(dragRange)
		else
			if(lastInside)
				if(offset > 0)
					ret = offset - (point - SC.maxRange(dragRange))
				else
					ret = offset - (point - SC.minRange(dragRange))
			else
				ret = 0
		return ret
	},
	
	_setThickness_forView_atIndex: function(thickness, view, index, position) {
		var thicknesses = this.get('thicknesses')
		var view = this.get('subViews')[index]
		var max = this.maxThicknessForView(view, position) || 9999
		var min = this.minThicknessForView(view, position) || 0
		var thickness = Math.min(max, Math.max(min, thickness))
		
		if(thickness != thicknesses.objectAt(index))
			thicknesses.replace(index, 1, [thickness])

		return thickness
	},
	
});