// ==========================================================================
// Project:	 Endash.DividedView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash */

sc_require('views/thumb');
sc_require('mixins/thumb_delegate');
/**
	@class

*/
Endash.DividedView = SC.View.extend(Endash.ThumbDelegate, Endash.DividedViewDelegate,
/** @scope Endash.DividedView.prototype */ {

	classNames: ['sc-divided-view'],
	
	/**
		Direction of layout.	Must be SC.LAYOUT_HORIZONTAL or SC.LAYOUT_VERTICAL.
		
		@property {String}
	*/
	layoutDirection: SC.LAYOUT_HORIZONTAL,

	thicknesses: null,

	/** @private */
	thicknessesBindingDefault: SC.Binding.multiple(),

	/**
		Set to NO to disable rendering of divider views
		
		@property {Boolean}
	*/
	showDividers: YES,
	
	/**
		Amount of space the divider takes up between views.
		
		@property {Integer}
	*/
	dividerSpacing: 6,
	
	/**
		Size of the divider view (can be greater than dividerSpacing)
		
		@property {Integer}
	*/
	dividerThickness: 6,
	
	// default views
	dividerView: Endash.ThumbView,
	defaultView: SC.View,
	childCount: 2,
	

	

	
	addPane: function(view, index, thickness) {
		var childViews = this.get('childViews')
		var subViews = this.get('subViews')
		var dividers = this.get('dividers')
		var thicknesses = this.get('thicknesses')
		var showDividers = this.get('showDividers')

		if(SC.none(thickness))
			thickness = this._defaultThicknessForView(view)
			
		if(SC.none(index))
			index = subViews.get('length')

		if(subViews.get('length') > 0 && showDividers)
			this._createDivider(index)
		
		var view = this.createChildView(view.extend({
			classNames: ['sc-split-view-pane'],
			delegate: this
		}))

		thicknesses.insertAt(index, thickness)
		subViews.insertAt(index, view)
		
		if(this.get('layer'))	{
			this.insertBefore(view, subViews.objectAt(index + 1))
			if(thickness == null || thickness.w)
				this.set('thicknesses', thicknesses)
			this.displayDidChange()
		} else
			childViews.insertAt(showDividers ? index * 2 : index, view)
	},
	
	removePane: function(index) {
		var subViews = this.get('subViews')
		if(SC.none(index))
			index = subViews.get('length') - 1
		var view = subViews.objectAt(index)
		
		this.removeChild(view)
		view = this.get('dividers').pop()
		this.removeChild(view)
		subViews.removeAt(index)
		this.get('thicknesses').removeAt(index)
		this.displayDidChange()
	},
	
	replacePane: function(view, index) {
		var subViews = this.get('subViews')
		var existing = subViews.objectAt(index)
		subviews.replace(index, 1, [view])
		this.replaceChild(view, existing);
		this.displayDidChange()
	},
	
	movePane: function(index, offset) {
		var views = this.get('subViews') 
		var thicknesses = this.get('thicknesses')
		var thickness = thickness.objectAt(index)
		var view = views.objectAt(index)
		var newIndex = index + offset

		if(this.get('layer'))
			this.insertBefore(view, views.objectAt(newIndex))
		
		views.removeAt(index, 1).insertAt(newIndex, view)
		thicknesses.removeAt(index, 1).insertAt(newIndex, thickness)
		this.displayDidChange()
	},


	
	/**
		@property {Array} thicknesses
	*/
	thicknesses: function(key, value) {
		if(value != undefined) {
			this.__thicknesses = value
			this._thicknesses = null
		}
		
		if(this.get('layer') && SC.none(this._thicknesses)) {
			this._thicknesses = this.__thicknesses
			this.__adjustThicknesses()
		}
			
		return this._thicknesses
	}.property(),



	





	/**
		Adjusts the thicknesses array for a given divider and offset.
		
		The default behaviour is to resize the view to the left of 
		the divider, only.
		
		@params {Integer} index index of the divider view
		@params {Integer} offset value to change the thicknesses by
	*/
	adjustThicknessesForDividerAtIndex_byOffset: function(index, offset) {
		var views = this.get('subViews')
		var view = views[index]
		this.adjustThicknessForView_atIndex_byOffset(view, index, offset)
	},

	/**
		Adjusts the thicknesses array for a given view and offset.
		
		@params {SC.View} view view to resize
		@params {Integer} index index of the view to resize
		@params {Integer} offset value to change the thicknesses by
		@returns {Integer} the difference between the specified thickness and final thickness
	*/
	adjustThicknessForView_atIndex_byOffset: function(view, index, offset) {
		var thicknesses = this.get('thicknesses')
		var thickness = thicknesses.objectAt(index) + offset
		return (this._setThickness_forView_atIndex(thickness, view, index) - thickness)
	},

	/**
		Returns either the frame.x or frame.y for a given view
		
		@params {SC.View} view
		@returns {Integer}
	*/
	positionForView: function(view) {
		var direction = this.get('layoutDirection')
		var frame = view.get('frame')
		return (direction == SC.LAYOUT_HORIZONTAL) ? frame.x : frame.y
	},
	
	thickness: function(key, value) {
		return this.thicknessForView(this)
	}.property('frame').cacheable(),

	/**
		Returns either the width or geight for a given view
		
		@params {SC.View} view
		@returns {Integer}
	*/
	thicknessForView: function(view) {
		var direction = this.get('layoutDirection')
		var frame = view.get('frame')

		if(direction == SC.LAYOUT_HORIZONTAL)
			return frame.width

		return frame.height
	},

	/**
		Returns either the minWidth or minHeight for a given view
		
		@params {SC.View} view
		@returns {Integer}
	*/
	minThicknessForView: function(view) {
		var direction = this.get('layoutDirection')
		var layout = view.get('layout')
		var ret

		if(direction == SC.LAYOUT_HORIZONTAL)
			ret = layout.minWidth
		else
			ret = layout.minHeight

		if(ret)
			return ret

		return this.get('minimumThickness') || 0
	},

	/**
		Returns either the maxWidth or maxHeight for a given view
		
		@params {SC.View} view
		@returns {Integer}
	*/
	maxThicknessForView: function(view) {
		var direction = this.get('layoutDirection')
		var layout = view.get('layout')

		if(direction == SC.LAYOUT_HORIZONTAL)
			return layout.maxWidth

		return layout.maxHeight
	},


	
	collapseDividerAtIndex: function(index, direction) {
		var views = this._subViewsForDividerAtIndex(index)
		var view = views[(direction < 0) ? 0 : 1]
		if(!view || view.get('isCollapsed')) 
			return
			
		this.invokeDelegateMethod(this.delegate, 'dividedViewWillCollapseView', this, view)
		this.collapseView(view, index, direction)
		this.invokeDelegateMethod(this.delegate, 'dividedViewDidCollapseView', this, view)		
	},
	
	uncollapseDividerAtIndex: function(index) {
		var views = this._subViewsForDividerAtIndex(index)
		var idx = (views[0].get('isCollapsed') ? 0 : 1)
		var view = views[idx]
		if(!view || !view.get('isCollapsed')) 
			return
			
		var direction = (idx == 0) ? 1 : -1
			
		this.invokeDelegateMethod(this.delegate, 'dividedViewWillUncollapseView', this, view)
		this.uncollapseView(view, index, direction)
		this.invokeDelegateMethod(this.delegate, 'dividedViewDidUncollapseView', this, view)		
	},
	
	canCollapseView: function(view) {
		return this.invokeDelegateMethod(this.delegate, 'dividedViewCanCollapseView', this, view) || NO
	},
	
	collapseView: function(view, index, direction) {
		return this._setCollapse_forView_andDividerAtIndex_inDirection(YES, view, index, direction)
	},
	
	uncollapseView: function(view, index, direction) {
		return this._setCollapse_forView_andDividerAtIndex_inDirection(NO, view, index, direction)
	},
	



	/** Private */


	/** Delegate methods */
	
	/**
		Delegate method for the dividerView.

		Caches the allowed drag range for the divider.
		
		@params {SC.View} thumbView the divider
		@params {Event} evt the click event
	*/
	thumbViewDidBeginDrag: function(thumbView, evt) {
		var direction = this.get('layoutDirection')
		var index = this.get('dividers').indexOf(thumbView)
		var dragRange = this._dragRangeForDivider(thumbView)
		var collapseRange = this.invokeDelegateMethod(this.delegate, 'dividedViewCollapseRangeForDividerAtIndex', this, index, dragRange)
		var viewOffset = SC.viewportOffset(this.get('layer'))
		var thumbOffset = SC.viewportOffset(thumbView.get('layer'))
		var dividerThickness = this.get('dividerThickness')
		var dividerOffset = this.get('dividerOffset')
		var point, view
		
		if(direction == SC.LAYOUT_HORIZONTAL) {
			thumbOffset = (point = evt.pageX) - thumbOffset.x
			viewOffset = viewOffset.x
 		} else {
			thumbOffset = (point = evt.pageY) - thumbOffset.y
			viewOffset = viewOffset.y
		}

		dragRange.start += viewOffset + thumbOffset
		collapseRange.start += viewOffset + thumbOffset

		this._dragRange = dragRange
		this._collapseRange = collapseRange
		this._lastInside = SC.valueInRange(point, dragRange) ;
	},

	/**
		Delegate method for the dividerView.

		Handles the actual drag of the divider view by adjusting the drag
		offset as needed and then passing that value to 
		adjustThicknessesForDividerAtIndex_byOffset
		
		@params {SC.View} thumbView the divider
		@params {Array} offset a pair of offset coordinates
		@params {Event} evt the click event
	*/
	thumbViewWasDragged_withOffset: function(thumbView, offset, evt) {
		var direction = this.get('layoutDirection')
		var dividers = this.get('dividers')
		var index = dividers.indexOf(thumbView)
		var dragRange = this._dragRange
		var collapseRange = this._collapseRange
		var point = (direction == SC.LAYOUT_HORIZONTAL) ? evt.pageX : evt.pageY
		var offset = (direction == SC.LAYOUT_HORIZONTAL) ? offset.x : offset.y
		var inside = SC.valueInRange(point, dragRange) ;
		var lastInside = this._lastInside
		var view
		var offset = this._adjustedOffsetForDrag(inside, lastInside, dragRange, point, offset)

		this._lastInside = inside
	
		if(point <= SC.minRange(collapseRange))
			this.collapseDividerAtIndex(index, -1)
		else if(point >= SC.maxRange(collapseRange))
			this.collapseDividerAtIndex(index, 1)
		else if(!inside || !lastInside)
			this.uncollapseDividerAtIndex(index)
	
		if(offset == 0)
			return offset

		this.beginPropertyChanges()
		this.adjustThicknessesForDividerAtIndex_byOffset(index, offset)
		this.endPropertyChanges()
		this.notifyPropertyChange('thicknesses')
		
		return offset
	},

	/**
		Delegate method for the dividerView. 

		Resets some cached properties.

		@params {SC.View} thumbView the divider
		@params {Event} evt the click event
	*/
	thumbViewDidEndDrag: function(thumbView, evt) {
		this._dragRange = this._lastInside = this._collapseRange = null
	},
	
	
	/** Internal */
	



	
	render: function(context, firstTime) {
		sc_super()
		if(firstTime)
			this.notifyPropertyChange("thicknesses")
	},
	
	
	/**
		Observer for adjusting the thicknesses and redrawing
		the display and for frame change
	*/
	_displayNeedsToBeUpdated: function(object, key) {
		if(!this.get('layer'))
			return
			
		if(key != "frame" || this.get('thickness') != this._oldThickness) {
			if(!this._oldThickness || key == "frame")
				this._oldThickness = this.get('thickness')
			this._adjustThicknesses()
			this.updateChildLayout()
		}
	}.observes('thicknesses', 'frame'),

	createChildViews: function() {
		var views = this.get('childViews') ;
		var numberOfViews = views.get('length') || 2;

		this.set('childViews', [])
		this.set('subViews', [])
		this.set('dividers', [])
		this._thicknesses = []
		
		for(var i = 0; i < numberOfViews; i++)
			this.addPane(views.objectAt(i) || SC.View)
			
		this.set('thicknesses', this._thicknesses)
	},
	
	_createDivider: function(index) {
		var childViews = this.get('childViews')
		var dividers = this.get('dividers')	
		var dividerView = this.get('dividerView')
		var view = this.createChildView(dividerView.extend({
			delegate: this
		}))
		dividers.insertAt(index - 1, view)
		if(this.get('layer'))	
			this.insertBefore(view, childViews.objectAt(index * 2 - 1))
		else
			childViews.insertAt(index * 2 - 1, view)
	},

	_defaultThicknessForView: function(view) {
		var direction = this.get('layoutDirection')
		var layout = view.prototype.layout
		var defaultThickness = this.get('defaultViewThickness') 
		var thickness
		
		if(layout)
			if(thickness = layout[direction == SC.LAYOUT_HORIZONTAL ? "width" : "height"])
				return thickness
			// else if(thickness = layout[direction == SC.LAYOUT_HORIZONTAL ? "minWidth" : "minHeight"])
			// 	return thickness
		
		if(defaultThickness !== undefined)
			return defaultThickness
			
		return null
	},
	
	/**
		Called when thicknesses are changed in order that
		they might be adjusted as needed. For subclasses.
	*/
	_adjustThicknesses: function() {
		/* empty */
	},
	
	/**
		Called when thicknesses are first set to resolve
		any percentages.
		
		@param {Array} thicknesses array of thicknesses
		@returns {Array}
	*/	
	__adjustThicknesses: function() {
		var sum = 0
		var percentages = 0
		var thickness = 0
		var total = 0
		var ret = []
		var thicknesses = this.get('thicknesses')
		var thickness = this.get('thickness') - (thicknesses.get('length') - 1) * this.get('dividerSpacing')

		var views = this.get('subViews')
		var i, vars = 0, remaining = thickness
		var lastChar
		
		var z = 0
		while(remaining > 0 && z < 5) {
			for(var idx = 0, len = thicknesses.get('length'); idx < len; idx++) {
				i = thicknesses.objectAt(idx)
				
				if(SC.none(i))
					if(z > 0)
						i = Math.floor(remaining / vars)
					else
						vars++
				else 
					if(i.w) {
						if((lastChar = i.charAt(i.length - 1)) == "%")
							i = Math.floor(parseInt(i) / 100 * thickness)
						else
							if(lastChar == ":")
								if(z == 0)
									vars += parseInt(i)
								else
									Math.floor((remaining / vars) * parseInt(i))
					} else if(z > 1 && remaining > 0) {
						var addl = Math.ceil(remaining / len)
						i += addl
					}
						
				if(!SC.none(i)) {
					var thick = this._setThickness_forView_atIndex(i, null, idx)
					sum += thick
					if(z > 1 && addl)
						remaining -= addl + i - thick
				}
			}

			remaining = thickness - sum
			sum = 0
			z++
		}
		
	},

	/**
		Updates the child views
	*/
	updateChildLayout: function(object, key, value, rev) {
		var thicknesses = this.get('thicknesses')

		if(SC.none(thicknesses) || !this.get('isVisibleInWindow'))
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
		var showDividers = this.get('showDividers')

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

			if(!showDividers || index % 2 == 0) {
				thickness = thicknesses.objectAt(showDividers ? (index / 2) : index)
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

			this._updateLayout_forView(layout, view)
			view.set('isVisible', thickness > 0)
		}
	}.observes('isVisibleInWindow'),

	/**
		Does the actual modification of the child view's layout
	*/
	_updateLayout_forView: function(layout, view) {
		view.adjust(layout)
	},
	
	/**
		Determines the allowed drag range for a given divider, based
		on the divider's left/top edge, and relative to the parentView. 

		@params {Integer} index index of the divider view
		@returns {Range}
	*/
	dragRangeForDividerAtIndex: function(index) {
		var views = this.get('subViews')
		var view = views[index]
		var thickness = this.get('thickness')
		var maxThickness = this.maxThicknessForView(view)

		var min = this.positionForView(view) + this.minThicknessForView(view)
		var max = SC.none(maxThickness) ? thickness : this.positionForView(view) + this.maxThicknessForView(view)

		return {start: min, length: max - min}
	},
	
	
	/**
		Caches & returns the dragRange for a given divider view
		
		@params {SC.View} thumbView the divider
		@returns {Range}
	*/
	_dragRangeForDivider: function(thumbView) {
		if(this.__dragRangeForDivider && this.__dragRangeForDivider[thumbView])
			return this.__dragRangeForDivider[thumbView]

		var index = this.get('dividers').indexOf(thumbView) ;
		var ret = this._dragRangeForDivider[thumbView] = this.dragRangeForDividerAtIndex(index)

		return ret
	},
	
	/**
		Returns the views to the immediate left and right of a divider.
		
		@params {Index} index the index of the divider
		@returns {Array}
	*/
	_subViewsForDividerAtIndex: function(index) {
		var views = this.get('subViews')

		if(index > (views.length - 2))
			return false 

		return views.slice(index, index + 2)
	},

	/**
		Takes an offset and truncates it as necessary to remain within
		the dragRange.
		
		Example: In a single event the mouse is dragged from 12 points within
		the allowed dragRange to 8 points outside, with an offset of -20.
		This method will return -12, so that the offset remains within the
		dragRange.

		@params {Boolean} inside whether the current point is within the dragRange
		@params {Boolean} lastInside whether the previous point is within the dragRange		
		@params {Range} dragRange range of valid points
		@params {Integer} point the current point
		@params {Integer} offset the difference between the current and previous points
		@returns {Integer} the adjusted offset
	*/
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

	/**
		Sets the thicknesses array for a given view and thickness.
		
		Ensures that the value that is set is valid.
		
		@params {Integer} thickness value to set
		@params {SC.View} view view to resize
		@params {Integer} index index of the view to resize
		@returns {Integer} the actual value set
	*/
	_setThickness_forView_atIndex: function(thickness, view, index) {
		var thicknesses = this.get('thicknesses')
		var view = this.get('subViews')[index]
		var max = this.maxThicknessForView(view) || 9999
		var min = this.minThicknessForView(view) || 0
		var thickness = Math.min(max, Math.max(min, thickness))

		if(thickness != thicknesses.objectAt(index))
			thicknesses.replace(index, 1, [thickness])

		return thickness
	},
	
	_setCollapse_forView_andDividerAtIndex_inDirection: function(state, view, index, direction) {
		if(view.get('isCollapsed') == state)
			return
			
		var thickness = (state ? view.get('_minThickness') : this.thicknessForView(view)) * direction

		view.set('isCollapsed', state)

		this.beginPropertyChanges()
		this.adjustThicknessesForDividerAtIndex_byOffset(index, thickness)
		this.endPropertyChanges()
		this.notifyPropertyChange('thicknesses')

		return true
	}
	
});