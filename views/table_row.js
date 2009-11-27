// ==========================================================================
// Project:	 Endash.TableRowView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash */

sc_require('views/divided')

/**
	@class

	This is a disaster. Do not use. 
	
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

		// createChildViews: function() {
		// 
		// 	var childViews = []
		// 
		// 	var view = this.createChildView(SC.LabelView.extend({
		// 		valueBinding: '.parentView*value',
		// 	}))
		// 
		// 	childViews.push(view)
		// 	this.set('childViews', childViews)
		// }
		
		
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
		
		/**
			This is a stub cell that ensures that the row "looks complete"
			It isn't actually tied to any column or thickness
		*/
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

		this.set('thickness', Math.max(sum, this.thicknessForView(this.get('parentView'))))
	}.observes('thicknesses'),

	adjustThickness: function() {
		var thickness = this.get('thickness')
		var direction = this.get('layoutDirection')
		this.adjust((direction == SC.LAYOUT_HORIZONTAL) ? "width" : "height", thickness)
	}.observes('thickness'),

	// 
	columnsRangeObserver: function(columns, object, key, indexes, propertyRevision) {
		if(SC.none(columns))
			return
	
		if(key == "[]") {
			var views = this.get('subViews')
			var thicknesses = []
			for(var i = 0, len = columns.get('length'); i < len; i ++)
				views.objectAt(i).set('column', columns.objectAt(i))
		}
	},
	// 
	// columnsPropertyDidChange: function(columns, object, key, indexes, propertyRevision) {
	// 	console.log("cPDC")
	// 	if(key != 'width')
	// 		return
	// 		
	// 	// console.log(key)
	// 	// console.log(arguments)
	// 
	// 	var columns = this.get('columns')
	// 	var index = columns.indexOf(target)
	// 	this._setThickness_forView_atIndex(target.get('width'), null, index)
	// 	// console.log(this.get('thicknesses'))
	// 	this.notifyPropertyChange('thicknesses')
	// },
	// 
	updateColumnsRangeObserver: function(target, key, value) {
		var columns = this.get('columns')
		// var func = this.columnsRangeObserver
		// var is = SC.IndexSet.create(0, columns.get('length')).freeze();
		// var observer = columns.addRangeObserver(is, this, func, null);      
		// this._tr_columnsRangeObserver = observer ;
	
		var f = this.columnsPropertyDidChange
	
		// this._columns = columns; 
		if (columns) {
			if (SC.isArray(columns)) {
				columns.invoke('addObserver', '*', this, f) ;
			} else if (columns.addObserver) {
				columns.addObserver('*', this, f) ;
			}
		}
	
		this.columnsRangeObserver(columns, null, '[]', null);
	}.observes('columns')
})