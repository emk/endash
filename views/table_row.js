// ==========================================================================
// Project:	 Endash.TableRowView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash */

sc_require('views/divided')

/**
	@class
	
*/
Endash.TableRowView = Endash.DividedView.extend(
/** @scope Endash.TableRowView.prototype */ {
	
	classNames: ['sc-table-row-view'],

	columns: null,
	columnsBindingDefault: SC.Binding.multiple(),

	dividerSpacing: 0,

	showDividers: NO,

	defaultView: SC.View.extend({
		classNames: ['table-row-cell-view'],

		createChildViews: function() {

			var childViews = []

			var view = this.createChildView(SC.LabelView.extend({
				// valueBinding: '.parentView*value'
				valueBinding: SC.Binding.from('.parentView*value'),
			}))

			childViews.push(view)
			this.set('childViews', childViews)
		},
		
		value: function() {
			var column = this.get('column')
			var content = this.get('parentView').get('content')
			if(!column || !content)
				return ""

			return content.get(column.get('contentKey'))
		}.property('column', '.parentView.content')
		
	}),
		
	createChildViews: function() {
		sc_super()

		var showDividers = this.get('showDividers')
		if(showDividers) {
			var dividerView = this.get('dividerView') || Endash.ThumbView
			var view = this.createChildView(dividerView.extend({
				delegate: this
			}))
			this.get('childViews').push(view)
			this.get('dividers').push(view)
		}
		
		var view = this.createChildView(SC.View.extend({
			classNames: ['table-row-cell-view']
		}))
		
		this.get('childViews').push(view)
		this.get('subViews').push(view)
	},

	updateThickness: function() {
		var thicknesses = this.get('thicknesses')
		if(SC.none(thicknesses))
			return

		var dividerSpacing = this.get('dividerSpacing')
		var sum = 0
		for(var i = 0, len = thicknesses.get('length'); i < len; i++)
			sum += thicknesses.objectAt(i)
		sum += ((len - 1) * dividerSpacing)

		this.set('thickness', Math.max(sum, this.thicknessForView(this.get('parentView').get('parentView'))))
	}.observes('thicknesses'),

	adjustThickness: function() {
		var thickness = this.get('thickness')
		var direction = this.get('layoutDirection')
		this.adjust((direction == SC.LAYOUT_HORIZONTAL) ? "width" : "height", thickness)
	}.observes('thickness'),


	columnsRangeObserver: function(columns, object, key, indexes) {
		if(SC.none(columns))
			return
			
		if(SC.none(indexes)) {
			var views = this.get('subViews')
			for(var i = 0, len = columns.get('length'); i < len; i ++)
				views.objectAt(i).set('column', columns.objectAt(i))
				
			var thicknesses = columns.map(function(item, index, enumerable) { return item.get('width') })
			this.set('thicknesses', thicknesses)
			return
		}
	},

	columnsPropertyDidChange: function(target, key, value, propertyRevision) {
		if(key != 'width')
			return

		var columns = this.get('columns')
		var index = columns.indexOf(target)
		this._setThickness_forView_atIndex(target.get('width'), null, index)
		this.notifyPropertyChange('thicknesses')
	},

	updateColumnsRangeObserver: function(target, key, value) {
		var columns = this.get('columns')
		var func = this.columnsRangeObserver
		var is = SC.IndexSet.create(0, columns.get('length')).freeze();
		var observer = columns.addRangeObserver(is, this, func, null);      
    this._cv_columnsRangeObserver = observer ;

		var f = this.columnsPropertyDidChange

		this._columns = columns; 
    if (columns) {
      if (SC.isArray(columns)) {
        columns.invoke('addObserver', '*', this, f) ;
      } else if (columns.addObserver) {
        columns.addObserver('*', this, f) ;
      }
    }

    this.columnsRangeObserver(columns, null, '[]', null);
	}.observes('columns'),
	
	
	viewNeedsToUpdate: function(target, key, value, propertyRevision) {
		// if(!this.get('isVisibleInWindow'))
			// return

		var content = this.get('content')
		if(content) {
		 // && content.propertyRevision > (this._lastPropertyRevision || 0)) {
			this.redraw()
			this._lastPropertyRevision = propertyRevision
		}
	}.observes('content', 'isVisibleInWindow'),
	
	redraw: function() {
		var columns = this.get('columns')
		var content = this.get('content')
		var subViews = this.get('subViews')
		for(var i = 0, len = columns.get('length'); i < len; i++)
			subViews.objectAt(i).set('value', content.get(columns.objectAt(i).get('contentKey')))
	}
})