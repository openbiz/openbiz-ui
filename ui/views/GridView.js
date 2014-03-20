"use strict";
define(['../objects/View'],function(view){
	return view.extend({
		_columnsConfig:null,
		_filterConfig:null,
		_paginatorConfig:null,
		_actions:null,
		_config:null,
		_recordActions:null,
		_dataGridEL:'.data-grid',
		collection:null,
		initialize:function(){
			openbiz.View.prototype.initialize.apply(this);
			return this;
		},
		_bindEvents:function(){
			this.undelegateEvents();
			var actions = this._getActions();
			for (var i in actions){
				var action = actions[i];
				var key = action.event + " ." + action.className;
				this.events[key] = action.action;
			}
			var recordActions = this._getRecordActions();
			for (var i in recordActions){
				var recordAction = recordActions[i];
				var className = recordAction["className"];
				var selector = "rec-act-"+recordAction["name"].toLowerCase();
				var key = recordAction.event + " ." + selector;
				this.events[key] = recordAction.action;
			}
			this.delegateEvents();
			return this;
		},
		render:function(){
			$(window).off('resize');
			openbiz.ui.update($(this.el));
			if(this._canDisplayView())
			{
				$(this.el).html(this.template(this.locale));
				this._renderDataGridConfig()._bindEvents();
			}
			else
			{
				this._renderNoPermissionView();
			}
		},
		_renderDataGridConfig:function(){
			var columns = [];
			var columnConfigs = this._getColumnsConfig();
			for (var i in columnConfigs){
				var column = columnConfigs[i];
				if(this._canDisplayColumn(column)){
					columns.push(openbiz.elements.grid[column['type']].getConfig(this,column));
				}
			}
			if(this._getFilterConfig()){
				var filter = new Backgrid.Extension.ServerSideFilter({
					collection: this.collection,
					name: "query",
					placeholder: ""
				});
				$(this.el).find(this._dataGridEL).append(filter.render().el);
			}
			var grid = new Backgrid.Grid({
				columns:columns,
				collection: this.collection,
				className: 'backgrid table table-striped table-bordered text-center',
				emptyText: 'emptyText '
			});
			$(this.el).find(this._dataGridEL).append(grid.render().el);
			if(this._getPaginatorConfig()){
				var paginator = new Backgrid.Extension.Paginator({
					windowSize: 10,
					slideScale: 0.5,
					goBackFirstOnSort: true,
					collection: this.collection,
					className:'pagination'
				});
				$(this.el).find(this._dataGridEL).append(paginator.render().el);
			}
			this.collection.fetch();
		},
		_renderNoPermissionView:function(){
			//render 403 page
		},
		_canDisplayView:function(){
			return openbiz.session.me.hasPermission(this._config.permission);
		},
		_canDisplayColumn:function(column){
			if(typeof column['permission'] != 'undefined' && column['permission'])
				return openbiz.session.me.hasPermission(column['permission']);
			return true;
		},
		_getRecordActions:function(){
			if(! this._recordActions){
				this._recordActions = this._config.recordActions;
			}
			return this._recordActions;
		},
		_getActions:function(){

			if(! this._actions){
				this._actions = this._config.action;
			}
			return this._actions;
		},
		_getColumnsConfig:function(){
			if(! this._columnsConfig){
				this._columnsConfig = this._config.fields;
			}
			return this._columnsConfig;
		},
		_getFilterConfig:function(){
			if(! this._filterConfig){
				this._filterConfig = this._config.filter;
			}
			return this._filterConfig;
		},
		_getPaginatorConfig:function(){
			if(! this._paginatorConfig){
				this._paginatorConfig = this._config.paginator;
			}
			return this._paginatorConfig;
		}
	});
});