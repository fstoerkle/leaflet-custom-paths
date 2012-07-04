
/** 
* Core.ui.element.input
*/
Core.define('Core.element.input', Core.element.extend(
{
	replace: function(options)
	{
		/* Replace element */
		return (new Core.element[this.element.attr('type').toLowerCase()](this.element)).replace(
		{
			theme: options.theme
		});
	}
}));