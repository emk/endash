// ==========================================================================
// Project:	 Endash.TableHeaderView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Endash */

sc_require('views/table_row')

/**
	@class
	
*/
Endash.TableHeaderView = Endash.TableRowView.extend(
/** @scope Endash.TableHeaderView.prototype */ {

	classNames: ['sc-table-header-view'],

	columns: null,
	columnsBindingDefault: SC.Binding.multiple(),

	showDividers: YES,
	
	defaultView: SC.View.extend({
		classNames: ['table-header-cell-view'],

		createChildViews: function() {

			var childViews = []

			var view = this.createChildView(SC.LabelView.extend({
				valueBinding: '.parentView*column.value'
			}))

			childViews.push(view)
			this.set('childViews', childViews)
		}
	}),

	thicknessesRangeObserver: function(thicknesses, object, key, indexes) {
		if(SC.none(thicknesses) || SC.none(indexes))
			return
			
		var index = indexes.get('firstObject')
		var columns = this.get('columns')
		var column = columns.objectAt(index)
		column.setIfChanged('width', thicknesses.objectAt(index))
	},

	updateThicknessesRangeObserver: function(target, key, value) {
		var thicknesses = this.get('thicknesses')
		var func = this.thicknessesRangeObserver
		var is = SC.IndexSet.create(0, thicknesses.get('length')).freeze();
		var observer = thicknesses.addRangeObserver(is, this, func, null);      
		this._th_thicknessesRangeObserver = observer ;
	}.observes('columns')
})