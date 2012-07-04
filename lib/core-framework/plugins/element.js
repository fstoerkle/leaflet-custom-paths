/**
* Core.ui.forms
* @version 1.0.0
*/
Core.define('Core.element', Core.extend(
{
	element: null,
	init: function(element, config)
	{
		this.element = element;

		/* Apply additional configuration directives */
		Core.apply(this, config);
	},
	replace: function()
	{
		/* Override */ 
	}
}));