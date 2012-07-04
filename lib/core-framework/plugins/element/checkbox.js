
/** 
* Core.ui.element.select
*/
Core.define('Core.element.checkbox', Core.element.extend(
{
	options: 
	{
		theme: {},
		placeholder: null
	},
	listeners:
	{
		click: function(event, ui){}
	},
	click: function()
	{
		if (this.element.attr('checked'))
		{
			this.placeholder.find('a').removeClass('checked');
			
			/* Uncheck hidden element */
			this.element.attr('checked', false)
		}
		else 
		{
			this.placeholder.find('a').addClass('checked'); 
			
			/* Uncheck hidden element */
			this.element.attr('checked', true);
		}
		
		return false;
	},
	placeholder: function()
	{
		if (!this.options.placeholder)
		{
			this.options.placeholder = 
			{
				element: function( select )
				{
					var placeholder =  $('<div/>').addClass('ui-form-checkbox')
									  .addClass(this.options.theme.classes.checkbox)
									  .bind(
									  {
									  		click: this.delegate(this, this.click)
									  });
					
					var C = $('<a/>').appendTo(placeholder);
					
					if (this.element.attr('checked'))
					{
						C.addClass('checked');
					}
					
					return placeholder;
				},
				update: function( placeholder )
				{
					var label = $('label[for=' + this.element.attr('id') + ']');
					
					/* Hide label & element */
					this.element.add(label).hide();
					
					this.placeholder.append(label.text());
					
					
				}
			}
		}
		
		this.placeholder = this.options.placeholder.element.apply(this,[this.element]);
		
		/* Update placeholder */
		this.options.placeholder.update.apply(this,[this.placeholder]);
		
		return this.placeholder;
	},
	update: function(index, option, newOption )
	{
		if ($(option).val() == newOption.val())
		{
			$(option).attr('selected', true);
			
			this.placeholder.find(':text').val($(option).text());
			
			/* Trigger used defined onchange event(s) */
			this.element.trigger('onchange');
			
			/* Trigger listener */
			this.listeners.change.apply(this,[]);
		}
		else 
		{
			$(option).attr('selected', false);
		}
	},
	replace: function(options)
	{
		/* Set options */
		this.options = $.extend(true,{},this.options,options);

		/* Create placeholder */
		this.placeholder().insertAfter(this.element);
	}
}));