// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals Endash */

/**
  @class

  A ThumbView works in concert with SC.SplitView to adjust the divider 
  position from an arbitrary subview of the SplitView. Simply make an
  instance of ThumbView a child somewhere in the childViews (or 
  descendants) of the split view and add the path to the ThumbView to the
  SplitView's thumbViews array.
  
  SplitView will automatically set the delegate property of the views in
  its thumbViews array.

  @extends SC.View
	@author Christopher Swasey
  @author Erich Ocean
*/
Endash.ThumbView = SC.View.extend(
/** @scope Endash.ThumbView.prototype */ {

  classNames: ['sc-thumb-view'],
  
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.bool(),
  
	delegate: null,
	
	eventDelegate: function() {
		var del = this.get('delegate')
		return this.delegateFor('isThumbDelegate', del);  
	}.property('delegate').cacheable(),
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO ;

		var responder = this.getPath('pane.rootResponder') ;
    if (!responder) return NO ;
    
		var del = this.get('eventDelegate')
		if (!del) return NO ;

		this._del = del
		this._offset = {x: 0, y: 0}
		
		del.thumb_thumbViewDidBeginDrag(this, evt)
    responder.dragDidStart(this) ;
    
    this._mouseDownX = this._lastX = evt.pageX ;
    this._mouseDownY = this._lastY = evt.pageY ;
    
    return YES ;
  },

	mouseDragged: function(evt) {
		var offset = this._offset
    
		offset.x = evt.pageX - this._lastX
		offset.y = evt.pageY - this._lastY
		
		this._lastX = evt.pageX
		this._lastY = evt.pageY
		
		var del = this.get('eventDelegate')
		del.thumb_thumbViewWasDragged_withOffset(this, offset, evt)				
    return YES;
  },

	mouseUp: function(evt) {
		this._del = this._lastX = this._lastY = this._offset = this._mouseDownX = this.mouseDownY = null
		var del = this.get('eventDelegate')
		del.thumb_thumbViewDidEndDrag(this, evt)
	},
    
  // doubleClick: function(evt) {
  // 		console.log("click")
  // 		var del = this.get('eventDelegate')
  // 		return del.doubleClickInThumbView(this, evt)
  // }

});