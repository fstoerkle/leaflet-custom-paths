

/**
* Core.data.ArrayStore
* @version 1.0.0
*/
Core.define('Core.data.ArrayStore', Core.data.extend(
{
	url: 		null,
	method: 	'POST',
	params: 	{},
	dataType:   'json',
	data:		[],
	fields:		[],
	autoload:	false,
	listeners:
	{
		success: function(response){},
		error:   function(response){}
	},
	parseData: function(index, row)
	{
		/* Push row in the data container */
		this.data.push(row);
	},
	assort: function(response, textStatus, callback)
	{
		if (response.success)
		{
			$.each(response.data, this.delegate(this, this.parseData));
			
			/* Call callback */
			callback.call();
		}
	},
	getData: function()
	{
		return this.data;
	},
	load: function(callback)
	{
		if (this.url)
		{
			$.ajax(
			{
				type: 		this.method,
				url: 		this.url,
				data: 		$.param(this.params),
				dataType: 	this.dataType,
				success: 	this.delegate(this, this.assort, [callback]),
				error: 		this.listeners.error
			});
		}
	}
}));