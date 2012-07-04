var Captcha = (function()
{
	var config = 
	{
		key: 	'',
		widget: 'recaptcha-widget'
	}
	
	var reCaptcha = Core.extend(
	{
		element: null,
		options:
		{
			theme: 		'white',
   			tabindex: 	2
		},
		display: function()
		{
			/* Display captcha */
			Recaptcha.create(config.key,this.element,this.options);
		},
		init: function(element, options)
		{
			/* Set element */
			this.element = element;
			
			/* Extend options */
			this.options = $.extend(this.options, options);
			
			/* Recaptcha options */
			window.RecaptchaOptions = this.options;

			
			return this;
		},
		create: function()
		{
			/* Set blank include bath */
			Core.loader.setConfig(
			{
				path:'http://www.google.com/recaptcha/api/js'
			});
			
			/* Include captcha */
			Core.require('recaptcha_ajax', this.delegate(this, this.display));
		},
		custom: function()
		{
			var map = [
				{
					element: 'div',
					attr: 
					{
						id: 'recaptcha_image'
					}
				},
				{
					element: 'div',
					attr: 
					{
						'class': 'recaptcha_only_if_incorrect_sol'
					},
					label: 'Incorrect please try again'
				},
				{
					element: 'span',
					attr: 
					{
						'class':'recaptcha_only_if_image'
					},
					label: 	 'Enter the words above:'
				},
				{
					element: 'span',
					attr: 
					{
						'class':'recaptcha_only_if_audio'
					},
					label: 	 'Enter the numbers you hear:'
				},
				{
					element: 'input',
					attr: 
					{
						id:    		'recaptcha_response_field',
						'class': 	'recaptcha_only_if_audio'
					},
					label: 	 'Enter the numbers you hear:'
				},
				{
					element: 'div',
					attr: {},
					items:
					[
						{
							element: 'a',
							attr: 
							{
								href: 'javascript:Recaptcha.reload()'
							},
							label: 	 'Get another CAPTCHA'
						}
					]
				},
				{
					element: 'div',
					attr: 
					{
						'class': 'recaptcha_only_if_image'
					},
					items:
					[
						{
							element: 'a',
							attr: 
							{
								href: 'javascript:Recaptcha.switch_type("audio")'
							},
							label: 	 'Get an audio CAPTCHA'
						}
					]
				},
				{
					element: 'div',
					attr: 
					{
						'class': 'recaptcha_only_if_audio'
					},
					items: 
					[
						{
							element: 'a',
							attr: 
							{
								href: 'javascript:Recaptcha.switch_type("image")'
							},
							label: 'Get an image CAPTCHA'
						}
					]
				}
			];
			
			/* Create reCaptcha widget */
			var element =  $('[id=' + this.element + ']'), widget = $('<div/>',
			{
				id: config.widget
			}).appendTo(element).hide();
			
			
			/* Mapping */
			$.each(map, function(index, node)
			{
				var e = $(document.createElement(node.element)).attr(node.attr).appendTo(widget).html(node.label);

				/* Append items */
				if ("items" in node)
				{
					$.each(node.items, function(index, item)
					{
						var i = $(document.createElement(item.element))
						
						i.attr(item.attr).appendTo(e);
					})
				}
			});	
			
			var write = document.write;
			
			/* Mofify the write function */
			document.write = function(content)
			{
				$(content).insertAfter(widget);
			}
			
			$.getScript('http://www.google.com/recaptcha/api/challenge?k=' + config.key, function()
			{
				
			})
		}
	});
	
	return {
		config: function(conf)
		{
			$.extend(config, conf);
			
			return this;
		},
		create: function(element, options)
		{
			return new reCaptcha().init(element, options).custom();
		}
	}
})();