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


/** 
* Core.ui.element.select
*/
Core.define('Core.element.select', Core.element.extend(
{
	options: 
	{
		theme: {},
		placeholder: null
	},
	listeners:
	{
		select: function(event, ui){},
		change: function(event, ui){}
	},
	animation: new Core.animation(
	{
		speed: 100
	}),
	open: function(event)
	{
		/* Close previously opened dropdowns */
		this.closeAll();
				
		
		var dropdown = $('<div/>').addClass('ui-form-select-dropdown').addClass(this.options.theme.classes.dropdown).css(
		$.extend(
		{
			position:	'absolute',
			top: 		this.placeholder.offset().top + this.placeholder.height(),
			left: 		this.placeholder.offset().left,
			width: 		this.placeholder.outerWidth() - 4
		}, this.options.theme.css)).appendTo(document.body);
		
		if ($('option',this.element).length > this.options.theme.options.limit)
		{
			dropdown.css(
			{
				height: this.options.theme.options.maxHeight,
				overflow: 'auto'
			});
		}
		
		$('option',this.element).each(this.delegate(this, this.collect,[dropdown]));
		
		/* Animate dropdown */
		this.animation.reset().queue(dropdown,
		{
			height: "show"
		}).animate();
		
		/* Bind document */
		$(document).bind('mousedown',this.delegate(this, this.forceClose));
	},
	close: function(index, item)
	{
		this.animation.queue($(item),
		{
			height: "hide"
		}, function()
		{
			$(this).remove();
		});
	},
	closeAll: function()
	{
		$(document.body).children('.ui-form-select-dropdown').each(this.delegate(this, this.close));
		
		/* Hide all dropdowns */
		this.animation.animate();
	},
	forceClose: function(event)
	{
		var abort = $(event.target).parents('.ui-form-select-dropdown').length;
		
		if (!abort && !$(event.target).is('.ui-form-select-dropdown'))
		{
			this.closeAll();
		}
	},
	placeholder: function()
	{
		if (!this.options.placeholder)
		{
			this.options.placeholder = 
			{
				element: function( select )
				{
					var placeholder =  $('<div/>').addClass('ui-form-select')
									  .addClass(this.options.theme.classes.select)
									  .bind(
									  {
									  		mouseenter: this.delegate(this, this.mouse.over),
									  		mouseleave: this.delegate(this, this.mouse.out),
									  		click: this.delegate(this, this.open)
									  });
					
				    var wrapper = $('<div/>').appendTo(placeholder), input = $('<input/>',
				    {
				    	type: "text"
				    }).css(
				    {
				    	cursor: 		'pointer',
				    	width: 			100 + '%',
				    	background: 	'none',
				    	border: 		'none'
				    }).appendTo(wrapper).val();
				    
				    /* Simulate dropdown arrow */
				    var arrow = $('<span/>').addClass('ui-form-select-arrow').appendTo(placeholder);
				    
					return placeholder;
				},
				update: function( placeholder )
				{
					placeholder.find(':text').val(this.element.find('option:selected').text());
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
	selectOption: function(event)
	{
		this.element.find('option').each(this.delegate(this, this.update,[$(event.target).data('option')]));
		
		this.closeAll();
	},
	mouse:
	{
		over: function(event)
		{	
			this.placeholder.addClass(this.options.theme.classes.selectOver);
		},
		out: function(event)
		{
			this.placeholder.removeClass(this.options.theme.classes.selectOver);
		}
	},
	collect: function(index, option, dropdown)
	{
		var row = $('<a/>', 
		{
			title: $(option).text()
		}).data('option', $(option)).appendTo(dropdown).bind('click', this.delegate(this, this.selectOption)).html($(option).text());
		
		/* Check selected state */
		if ($(option).attr('selected'))
		{
			this.placeholder.find(':text').val($(option).text());
			
			row.addClass('ui-form-select-option-selected');
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

/**
* Core.ui.forms
* @version 1.0.0
*/
Core.define('Core.forms', Core.extend(
{
	options: 
	{
		applyTo: null,
		theme:
		{
			options: 
			{
				limit: 		20,
				maxHeight: 	320
			},
			classes:
			{	
				arrow:	  	'ui-form-select-arrow',
				select:	  	'ui-form-select',
				selectOver: 'ui-form-select-over',
				selected: 	'ui-form-select-option-selected',
				dropdown: 	'ui-form-select-dropdown'
			},
			effect: 		'slide',
			timeout: 		300
		},
		speed:  			300
	},
	applyTheme: function()
	{
		if (this.options.applyTo)
		{
			var applyTo = $(this.options.applyTo);

			$('select',applyTo).add(':checkbox',applyTo).each(this.delegate(this, this.replace));
		}
	},
	replace: function(index, item)
	{	
		var element = item.tagName.toLowerCase();
		/* Replace element */
		return (new Core.element[element]($(item))).replace(
		{
			theme: this.options.theme
		});
	},
	init: function(options)
	{
		this.options = $.extend(true, {}, this.options, options);
	}
}));