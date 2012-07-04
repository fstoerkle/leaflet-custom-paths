
/**
* Core.data.Grid
* @version 1.0.0
*/
Core.define('Core.data.Grid', Core.data.extend(
{
	store: null,
	columns:[],
	display: function()
	{
		var ul = $('<ul/>', 
		{
			id: 'grid'
		}).addClass('ui-core-grid');
		
		/* Display grid headers */
		this.addHeaders(ul)
			.addRows(ul);
		
		/* Render grid */
		ul.appendTo(this.renderTo);
	},
	addHeaders: function(grid)
	{
		var li = $('<li/>').addClass('ui-core-grid-row fix').appendTo(grid);
		
		$.each(this.columns, this.delegate(this, this.addHeader,[li]));
		
		return this;
	},
	addHeader: function(index, header, li)
	{
		var cell = $('<div/>').addClass('ui-core-grid-cell')
							  .css(
							  {
							  		width: header.width
							  })
							  .append(header.header).appendTo(li);
							  
		return this;
	},
	addRows: function(grid)
	{
		/* Display grid rows */
		$.each(this.store.data, this.delegate(this, this.addRow, [grid]));
		
		return this;
	},
	addRow: function(index, row, ul)
	{
		var li = $('<li/>').addClass('ui-core-grid-row fix').appendTo(ul);
		
		/* Create columns based on header information */
		$.each(this.columns, this.delegate(this, this.addCol,[row,li]));
		
		return this;
	},
	addCol: function(index, col, row, li)
	{
		var cell = $('<div/>').addClass('ui-core-grid-cell')
							  .addClass(col.cls)
							  .css(
							  {
							  		width: col.width
							  })
							  .append(row[col.id]).appendTo(li);
							 
	},
	render: function()
	{
		if (this.store)
		{
			this.store.load(this.delegate(this, this.display));
		}
	},
	renderTo:null
	
}));