/**
* Core Framework
* http://code.google.com/p/core-framework/
* 
* @version 1.0.0
* @copyright Creozon
* @author Angel Kostadinov
*/
(function() 
{
	/**
	* Core (Singleton Pattern)
	*
	* @version 1.0
	* @copyright Creozon
	*/
	this.Core = {}; 
	
	/* Base class */
	Core.Class = function(){};
	
  	 /**
     * Copies all the properties of config to the specified object.
     */
	Core.apply = function(object, config, defaults) 
	{
        if (defaults) {
            Core.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') 
        {
            for (var i in config) 
            {
                object[i] = config[i];
            }
        }
        
        return object;
    };
    
    /**
    * Delegate
    *
    * Delegates method execution to specified scope(target)
    * @version 1.0
    * @copyright Creozon
    */
    Core.delegate = function(target, method, args)
	{
		return (typeof method === "function") ? function() 
		{ 
			/* Override prototype */
			arguments.push = Array.prototype.push;
			
			/* Push additional arguments */
			for (var arg in args)
			{
				arguments.push(args[arg]);
			}
			return method.apply(target, arguments); 
		} : function()
		{
			return false;
		};
	};
	
	Core.pattern = (function()
	{
		return { /* Static patterns */
			isString: function(value)
			{
				return typeof value === 'string';
			},
			isArray: function(value) 
		 	{
		       	return value.constructor == Array;
		    },
		    isFilemap: function(value)
		    {
		    	if (this.isObject(value) && !this.isString(value))
		    	{	
		    		for (var key in value)
		    		{
		    			/* Return false immediatly if key is not string */
		    			if (!this.isString(key)) return false;

		    			/* Return false immediatly if value is not array */
		    			if (!this.isArray(value[key])) return false;
		    		}
		    	}
		    	else 
		    	{
		    		return false;
		    	}
		    	
		    	return true;
		    },
		    isNumber: function(value)
		    {
		    	return Object.prototype.toString.call(value) === '[object Number]';
		    },
		    isObject: function(value)
		    {
		    	return Object.prototype.toString.call(value) === '[object Object]';
		    },
		    isClass: function(value)
		    {
		    	return (typeof(value) == "function" && typeof(value.prototype) == "object") ? true : false; 
		    },
		    isFunction: function(value) 
			{
				return Object.prototype.toString.apply(value) === '[object Function]';
			},
			isBoolean: function(value) 
			{
				return Object.prototype.toString.apply(value) === '[object Boolean]';
			},
			isURI: function(value)
			{
				var regex =  new RegExp('(ftp|http|https)','ig');
				
				return value.match(regex) ? true : false;
			}
		}
	})();
    
    Core.mixin = (function()
    {
    	var options = /* Private options */
    	{
    		defer:	  [],
    		override: true
    	};
    	
    	/**
    	* Mixin Class 
    	* @version 1.0
    	* @copyright Core Framework 
    	*/
    	var Mixin = (function() /* Mixin Class */
    	{
    		return { 
    			proto: null,
    			mixins: null,
    			augment: function(args)
    			{
					this.proto   	 = args.shift(),
					this.mixins    	 = args.shift(),
					options.defer    = args.shift() || [],
					options.override = args.shift() || false;
					
					/* TODO: Determine whether to override or compose */
					this.override();
					
					return this.proto;
    			},
    			compose: function(){},
    			override: function()
    			{
    				for (var mixin in this.mixins)
    				{
						/* Allow both classes and objects to be used as mixin(s) */
						proto = this.mixins[mixin].prototype || this.mixins[mixin];
					
    					Core.apply(this.proto.prototype, proto);
    				
    					/* Store mixin prototype */	
    					this.proto.prototype.mixinPrototypes[mixin] = proto;
    				}
    			}
    		}
    	})();

    	return function()
    	{
    		var args = Array.prototype.slice.call(arguments);
    		
    		/* Unshift scope */
    		args.unshift(this);

    		return Mixin.augment(args);
    	}
    })();
    
	Core.Class.prototype = /* Auto-Inherited method(s) */
    {
    	mixinPrototypes:[],
    	delegate: Core.delegate,
		getMixin: function(name) 
		{
			return this.getMixins()[name];
		},
		getMixins: function() 
		{
			return this.mixinPrototypes || {};
		}
    };
    
    Core.apply(Core.Class,
    {
		extend: function(object)
		{
			Core.constructing = true;
			
			var proto = new this(), superclass = this.prototype;

			delete Core.constructing;

			/* Extend object prototypes */
			Core.apply(proto, object);
			
			// The dummy class constructor
			var Class = proto.constructor = function() 
			{
				// All construction is actually done in the init method
				if (!Core.constructing && this.init)
				{
					/* Apply constructor */
					this.init.apply(this, arguments);
				}
			};

			/* Associate superclass */
			proto.superclass = superclass;

			Core.apply(Class, 
			{
				prototype:   proto,
				constructor: Class,
				ancestor:    this,
				extend: 	 this.extend,
				mixin: 		 this.mixin
			});
			
			if (object.mixins)
			{
				this.mixin(object.mixins);
			}
			
			return Class;
		},
		extendPro: function(proto)
		{
			Core.constructing = true;
			
			var F = function() 
			{ 
				// All construction is actually done in the init method
				if (!Core.constructing && this.init)
				{
					/* Apply constructor */
					this.init.apply(this, arguments);
				}
			};
			
			F.prototype = new this(); // use our private method as magic cookie
			
			delete Core.constructing;
			
			for (key in proto) (function(fn, sfn)
			{ 
				// create a closure
				F.prototype[key] = !Core.pattern.isFunction(fn) || !Core.pattern.isFunction(sfn) ? fn : // add _super method
				function() 
				{ 
					this._super = sfn; return fn.apply(this, arguments); 
				};
			})(proto[key], F.prototype[key]);
			
			F.prototype.constructor = F;
			F.extend 				= this.extend;
			F.mixin					= this.mixin
			
			return F;
		},
		mixin: Core.mixin
    });
    
 
    /** 
    * Inhertance 
    * @version 2.0 - (Advanced Inheritance Model)
    */
    Core.Class.inherit = function(constructor) 
	{
		/* Allow empty constructor */
		constructor = constructor || function(){}
		
		var parent = this;
		
		F = function() 
		{
			this.parent = parent;
			
			var pubs = constructor.apply(this, arguments), self = this;
			
			for (key in pubs) (function(fn, sfn) 
			{
				self[key] = typeof fn != "function" || typeof sfn != "function" ? fn : function() 
				{ 
					this.parent = sfn; 
					
					return fn.apply(this, arguments); 
				};
			})(pubs[key], self[key]);
		}; 
		
		F.prototype 			= new this;
		F.prototype.constructor = F;
		F.inherit 				= arguments.callee;

		return F;
	};
    
    Core.apply(Core, 
    {
    	Array: (function()
    	{
    		var extendedPrototype = 
    		{
    			clear: function()
				{
					this.length = 0;
					
					return this;
				},
				map: function(mapper, context)
				{
					var result = new Array(this.length);
					
					for (var i = 0, n = this.length; i<n; i++)
					
					if (i in this) result[i] = mapper.call(context, this[i], i, this);
						
					return result;
				},
				invoke: function(method) 
				{
					var args = Array.prototype.slice.call(arguments, 1);
					
					return this.map(function(element) 
					{
						return element[method].apply(element, args);
					});
				},
				filter: function(fn) 
				{
				    var a = [];
				    
				    for ( var i=0, j=this.length; i < j; ++i ) 
				    {
				        if ( !fn.call(this, this[i], i, this) ) 
				        {
				            continue;
				        }
				        
				        a.push(this[i]);
				    }
				    return a;
				},
				clean: function()
				{
					return this.filter(function(value, index)
					{
						return null === value ? false : value.length;
					});
				},
				contains: function(obj) 
				{
					var i = this.length;
					
					while (i--) 
					{
						if (this[i] === obj) 
						{
							return true;
						}
					}
					return false;
				}

    		};
    		
    		return {
    			get: function(array)
    			{
    				Core.apply(array, extendedPrototype);
    				
    				return array;
    			}
    		}
    	})()
    });
    
    Core.apply(Core, 
    {
    	namespace: (function()
		{
			return Core.apply(Core,
			{
				register: function(namespace, scope, object)
				{
					var namespaces = namespace.split('.');
					
					for (var i = 0; i < namespaces.length; i++)
					{
						var namespace = namespaces[i];

						if (!this.exists(namespace, scope))
						{
							scope[namespace] = object;
						}

						scope = scope[namespace];
					}
					
					return scope;
				},
				exists: function(namespace, scope)
				{
					return (!scope || typeof scope[namespace] === "undefined") ? false : true;
				},
				autoload: function(namespace, callback)
				{
					var scripts = {};
					
					/**
					* Transform string to secure path
					*/
					var toPath = function( string )
					{
						if (Core.pattern.isURI(namespace)) /* Skip manipulation of URI(s) */
						{
							/* Do not take path into consideration */
							Core.loader.setConfig(
							{
								path: ''
							});
							
							return namespace;
						}
						
						var params = [], regex = new RegExp('((\\.\\.\\/)+)','i');
						
						/* Relative path(s) */
						relative = regex.exec(string);
						
						if (relative && relative.length)
						{
							/* Get the relative part */
							relative = relative.shift();
							
							/* Get string */
							string = string.substring(relative.length);
							
							params.push(relative);
						}

						/* Push clear path */
						params.push(Core.Array.get(string.split('.')).invoke('toLowerCase').join('/'));
						
						/* Return safe path */
						return params.join('');
					}

					/* Queue script */
					var queue = function(namespace)
					{
						var script = toPath(namespace);
						
						scripts[script] = [];
					};

					if (Core.pattern.isFilemap(namespace))
					{
						/* Apply map directly */
						scripts = namespace;
					}
					else 
					{			
						if (Core.pattern.isString(namespace))
						{

							queue(namespace);
						}
						else 
						{
							for (var i in namespace)
							{
								queue(namespace[i]);
							}
						}
					}
					

					Core.loader.addScripts(scripts).autoload(callback);
				}
			})
		})(),
		extend: function(object)
		{
			return Core.Class.extend(object);
		},
		inherit: function(object)
		{
			return Core.Class.inherit(object);
		},
		override: function(origclass, overrides)
		{
			Core.apply(origclass.prototype, overrides);
		},
		define: function(namespace, object)
		{
			return this.namespace.register(namespace, window, object);
		},
		require: function(namespace, callback)
		{
			this.namespace.autoload(namespace, callback);
		},
		loader: (function()
		{
			// Table of script names and their dependencies.
			var scripts = {}, queue = [], counter = 0, config = 
			{
				path: 	 	null,
				basePath:	null,
				cache: 		true,
				dataType: 	'script',
				type:		'.js',
				method: 	'GET'
			};

			/** @lends core.loader */
			return {
				setConfig: function(options)
				{
					$.extend(config, options);
					
					return this;
				},
				getConfig: function()
				{
					return config;
				},
				addScripts: function( collection )
				{
					scripts = $.extend(true, {}, scripts, collection);

					return this;
				},
				loadScript: function(url, callback, context) 
				{
					var script = queue[url] || (queue[url] = 
					{
						loaded    : false,
						callbacks : []
					});
				
					if(script.loaded) 
					{
						return callback.apply(context);
					}
				
					script.callbacks.push(
					{
						fn      : callback,
						context : context
					});

					if(script.callbacks.length == 1) 
					{
						var resource = [];
						
						resource.push(config.path);
						resource.push(config.basePath);
						resource.push(url + (config.type || ''));
						
						$.ajax(
						{
							type     : config.method,
							url      : Core.Array.get(resource).clean().join('/'),
							dataType : config.dataType,
							cache    : config.cache,
							success  : function() 
							{
								script.loaded = true;
								
								$.each(script.callbacks, function() 
								{
									this.fn.apply(this.context);
								});
								
								script.callbacks.length = 0;
							}
						});
					}
				},
				clear: function()
				{
					this.queue.clear();
					
					return this;
				},
				queue: function()
				{
					var pushQueue = function(script)
					{
						if (-1 == $.inArray(script,queue) && script.length) /* Queue only script not loaded yet */
						{
							queue.push(script);
						}
					};
					
					$.each(scripts, function(script, scripts)
					{
						/* Queue dependencies first */
						$.each(scripts, function(index, script)
						{
							pushQueue(script);
						});
						/* Queue script */
						pushQueue(script);
					});
					
					return this;
				},
				autoload: function( callback )
				{
					var path = this.path();

					/* Build queue */
					this.queue();

					/* Sequential loading via closure */
					(function() 
					{
						if(counter == queue.length) 
						{
							return callback.apply(window);
						}

						Core.loader.loadScript(queue[counter++], arguments.callee);
					})();
				},
				path: (function(file)
				{
					if (!config.path)
					{
						var exists = $('script').filter(function()
						{
							return this.src.indexOf(file) != -1;
						}).eq(0);
						
						/* Core has been found */
						if (exists.size())
						{
							config.path = exists.attr('src').slice(0, -1 - file.length)
						}
					}
					
					return function()
					{
						return config.path;
					}
					
				})('core.js')
			}
		})(),
		 /**
		 * Parallel image preloader 
		 *
		 * @version 1.0
		 * @copyright Core Framework
		 */
		preloader: (function()
		{
			var queue = [], images = [], total = 0, config = 
			{
				cache: 		true,
				parallel: 	true
			};
			
			var time = 
			{
				start: 0,
				end: 0   
			}
			
			return {
				onComplete: function(ui){ /* Override */},
				images: function()
				{
					return images;
				},
				reset: function()
				{
					queue 	= [];
					images 	= [];
					total 	= 0;
					
					return this;
				},
				queue: function(element)
				{
					if (Core.pattern.isString(element))
					{
						queue.push(element)
					}
					else 
					{
						$.each(element, function(index, element)
						{
							queue.push(element);
						})
					}
					
					return this;
				},
				finish: function(event, index, image)
				{
					/* Decrease number of finished items */
					total--;
					
					images[index].size = 
					{
						width: 	image.width,
						height: image.height
					}

					/* Check if no more items to preload */
					if (0 == total)
					{
						time.end = new Date().getTime();
						
						this.onComplete.apply(this,[
						{
							time: ((time.end - time.start)/1000).toPrecision(2)
						}])
					}
				},
				preload: function(callback)
				{
					/* Set callback function */
					this.onComplete = callback || this.onComplete;
					
					time.start = new Date().getTime();
					
					/* Get queue length */
					total = i = queue.length;
					
					while(i--)
					{
						var image = new Image();
					
						image.onload  = Core.delegate(this, this.finish, ($.browser.msie && $.browser.version <= 8 ? [window.event, i,image] : [i,image]));
						image.onerror = Core.delegate(this, this.finish, ($.browser.msie && $.browser.version <= 8 ? [window.event, i,image] : [i,image]));
						image.onabort = Core.delegate(this, this.finish, ($.browser.msie && $.browser.version <= 8 ? [window.event, i,image] : [i,image]));
						
						/* Set image source */
						image.src = config.cache ? queue.shift() : (queue.shift() + '?u=' + (new Date().getTime()))
						
						/* Push image */
						images.push(
						{
							index: i,
							image: image,
							size: 
							{
								width:	0,
								height: 0
							}
						});
					}
				},
				preloadCssImages: function(callback)
				{
					var images = this.getCssImages();
					
					this.queue(images).preload(callback);
				},
				getCssRules: function()
				{
					var collection = [], data = {}
					
					/* Private colect method */
					var Collect = 
					{
						rules: function(rules)
						{
							var rule = rules.length;
						
							while(rule--)
							{
								data = 
								{
									rule: 		   rules[rule],
									selectorText: !rules[rule].selectorText ? null : rules[rule].selectorText,
									declaration:  (rules[rule].cssText) ? rules[rule].cssText : rules[rule].style.cssText
								}
						
								collection.push(data);
							}
						}
					}
					
					/* Loop stylesheets */
					var i = document.styleSheets.length;
					
					while(i--)
					{
						var sheet = 
						{
							rules: 	 document.styleSheets[i].rules || document.styleSheets[i].cssRules,
							imports: document.styleSheets[i].imports || []
						}
						
						/* Collect rules */
						Collect.rules(sheet.rules);
						
						/* Collecte imported rules */
						for (x = 0; x < sheet.imports; x++)
						{
							Collect.rules(document.styleSheets[x].imports[x].rules || document.styleSheets[i].imports[x].cssRules);
						}
					}
					
					return collection;
				},
				getCssImages: function()
				{
					var rules = this.getCssRules(), i = rules.length, images = [], regex = new RegExp('[^\(|\'\"]+\.(gif|jpg|jpeg|png)','ig');
					
					while(i--)
					{
						var img = rules[i].declaration.match(regex);
						
						if (img.length)
						{
							images.push(img);
						}
					}
					return images;
				}
			}
		})()
    });

    Core.validator = (function() /* TODO: Complete Validators */
	{
		/* Private var(s) */
		var data = {}, condition = Core.Array.get(
		[
			'required', 
			'message',
			'element',
			'tooltip',
			'error'
		]);
			
		return { /* Static patterns */
			errors: false,
			tooltip: function()
			{
				var Tip = Core.extend(
				{
					tooltip: null,
					create: function()
					{
						this.tooltip = $('<div/>').addClass('coretip');
						
						return this;
					},
					empty: function()
					{
						this.tooltip.empty();
					},
					content: function(content)
					{
						this.tooltip.html(content);
						
						return this;
					},
					open: function(target)
					{
						var offset = target.offset();
						
						this.tooltip.css(
						{
							top: 	offset.top,
							left: 	offset.left + target.width() + 15,
							opacity:0.95
						}).appendTo('body').fadeIn(200);
					},
					close: function()
					{
						this.tooltip.remove()
					}
				})
				
				return new Tip().create();
			},
			display: function(map)
			{
				var error = false;
				
				/* Remove all error tips */
				$('div.coretip').remove();
				
				$.each(map, function(name, options)
				{
					/* Create error tooltip */	
					if (options.error)
					{	
						error = true; 
						
						options.element.addClass('invalid');

						/* Open tooltip */
						options.tooltip.content(options.message).open(options.element);
					}
					else 
					{
						options.element.removeClass('invalid');
						
						/* Close previously opened tooltip(s) */
						options.tooltip.close();
					}
				});
			},
			map: function(id, map)
			{
				/* Locate form */
				var form = $('form[id=' + id + ']');
				
				/* Map form */
				data[id] =
				{
					form: form.length > 0 ? form : null,
					map: 
					{
						/* Override */
					}
				}
				
				if (data[id].form)
				{
					/* Mapping */
					$.each(map, function(element, options)
					{
						data[id].map[element] = $.extend(
						{
							error: 	 false,
							message: null,
							tooltip: Core.validator.tooltip()
						},options)
					});
				}

				return this;
			},
			auto: function()
			{
				$.each(data, Core.delegate(this, this.bind));
			
				return this;
			},
			bind: function(index, form)
			{
				if (form.form)
				{
					form.form.find(':submit').unbind('click').bind('click', Core.delegate(this, this.validate,[form]));
				}
			},
			validate: function(event, form)
			{
				/* Bind self */
				form.form.find(':input').unbind("blur").bind(
				{
					blur: Core.delegate(this, this.validate,[form])
				}).end()
					
				/* No errors by default */
				this.errors = false;
				
				/* Smart validation */
				$.each(form.map, Core.delegate(this, this.filter, [form]));
	
				if (!this.valid())
				{
					this.display(form.map);
				}
				
				/* Return validation result */
				return this.valid();
			},
			valid: function()
			{
				return this.errors ? false : true;
			},
			filter: function(name, options, form)
			{
				var element = form.form.find(':input[name=' + name + ']');
				
				if (options.required)
				{
					$.each(options, Core.delegate(this, this.check,[name, element, form]));
				}
			},
			check: function(fn, bool, name, element, form)
			{
				var error = false;
				
				if (!condition.contains(fn))
				{
					if (Core.pattern.isFunction(bool))
					{
						bool = bool.apply(this,[element.val()]);
					}
					
					if (bool !== this[fn].apply(this, [element.val(), element]))
					{
						/* Rise error */
						error = true;
						
						/* Save error state */
						this.errors = true;
					}

					$.extend(true, form.map[name], 
					{
						error: 		error,
						element: 	element
					})
				}
			},
			empty: function(value) /* Check whether value is empty string */
			{
				return null === value ? false : (value.length == 0 ? true : false);
			},
			email: function(value) /* Check whether the value is valid email */
			{
				var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
				
				return regex.test(value);
			},
			alnum: function(value) /* Check whether value contains alphabetic or numeric characters only */ 
			{
				return true;
			},
			digit: function(value) /* Check whether value contains numeric characters only */ 
			{
				return Core.pattern.isNumber(value);
			},
			alpha: function(value) /* Check whether value contains alphabetic characters only */ 
			{
				return false;
			},
			lower: function(value) /* Check whether value contains only lower characters */ 
			{
				return (value == value.toLowerCase()); 
			},
			upper: function(value) /* Check whether value contains only upper characters */ 
			{
				return (value == value.toUpperCase()); 
			},
			extend: function(proto)
			{
				Core.apply(this, proto);
				
				return this;
			},
			password: function(value)
			{
				return true;
			},
			checked: function(value, element)
			{
				return element.is(':checked') ? true : false
			},
			positive: function(value)
			{
				return parseInt(value) > 0 ? true : false
			},
			negative: function(value)
			{
				return parseInt(value) < 0 ? true : false
			},
			zero: function(value)
			{
				return parseInt(value) === 0 ? true : false
			},
			equalTo: function(value)
			{
				return true;
			},
			strcmp: function(str1, str2)
			{
				return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
			},
			ukpostcode: function(value)  /* Check whether value contains valid UK postcode */ 
			{
				var regex = /^([A-PR-UWYZ0-9][A-HK-Y0-9][AEHMNPRTVXY0-9]?[ABEHMNPRVWXY0-9]? {1,2}[0-9][ABD-HJLN-UW-Z]{2}|GIR 0AA)$/;
				
				return regex.test(value);
			}
		}
	})();
	
	/**
	* jQuery Adapter(s) 
	* 
	* The following methods can be used for creation of jQuery plugins & widgets
	* @version 1.0.0
	*/
	Core.jQuery = (function()
	{	
		return {
			plugin: function(name, proto) 
			{
				$.fn[name] = function(options) 
				{
					var args = Array.prototype.slice.call(arguments, 1);
					
					return this.each(function() 
					{
						var instance = $.data(this, name);
						
						if (instance) 
						{
							instance[options].apply(instance, args);
						} 
						else 
						{
							instance = $.data(this, name, new proto(options, this));
						}
					});
				};
			},
			widget: function(name, proto)
			{
				return $.widget(name, proto.prototype);
			}
		}
	})()
	
	
	Core.SVG = (function()
	{
		var SVGPathSeg = Core.extend(
		{
			x:  null,
			y:  null,
			pathSegType: 		 0,
			pathSegTypeAsLetter: null, 
			vml: function()
			{
				return this.pathSegTypeAsLetter;
			}
		});
		
		SVGPathSeg.PATHSEG_UNKNOWN                      = 0;
		SVGPathSeg.PATHSEG_CLOSEPATH                    = 1;
		SVGPathSeg.PATHSEG_MOVETO_ABS                   = 2;
		SVGPathSeg.PATHSEG_MOVETO_REL                   = 3;
		SVGPathSeg.PATHSEG_LINETO_ABS                   = 4;
		SVGPathSeg.PATHSEG_LINETO_REL                   = 5;
		SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS            = 6;
		SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL            = 7;
		SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS        = 8;
		SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL        = 9;
		SVGPathSeg.PATHSEG_ARC_ABS                      = 10;
		SVGPathSeg.PATHSEG_ARC_REL                      = 11;
		SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS        = 12;
		SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL        = 13;
		SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS          = 14;
		SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL          = 15;
		SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS     = 16;
		SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL     = 17;
		SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS = 18;
		SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL = 19;
		
		var SVGPathSegClosePath = SVGPathSeg.extend(
		{
			pathSegType: 		SVGPathSeg.PATHSEG_CLOSEPATH,
			pathSegTypeAsLetter: "z", 
			vml: function()
			{
				return "xe";
			}
		});
		
		var SVGPathSegMovetoAbs = SVGPathSeg.extend(
		{
			pathSegType: 		 SVGPathSeg.PATHSEG_MOVETO_ABS,
			pathSegTypeAsLetter: "M",
			vml: function()
			{
				return "m" + [this.x, this.y].join(',');
			}
		});
		
		// Path Segment Types
		var SVGPathSegMovetoRel = SVGPathSeg.extend(
		{ 
			pathSegType : SVGPathSeg.PATHSEG_MOVETO_REL,
			pathSegTypeAsLetter : "m"
		});
		
		var SVGPathSegLinetoAbs = SVGPathSeg.extend(
		{
			pathSegType : SVGPathSeg.PATHSEG_LINETO_ABS,
			pathSegTypeAsLetter : "L",
			vml: function()
			{
				return "l" + [this.x, this.y].join(',');
			}
		});
		
		var SVGPathSegLinetoRel = SVGPathSeg.extend(
		{ 
			pathSegType : SVGPathSeg.PATHSEG_LINETO_REL,
			pathSegTypeAsLetter : "l",
			vml: function()
			{
				return this.pathSegTypeAsLetter + [this.x, this.y].join(',');
			}
		});
		
		var SVGPathSegCurvetoCubicAbs = SVGPathSeg.extend(
		{ 
			x1: null,
			y1: null,
			x2: null,
			y2: null,
			pathSegType : SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS,
			pathSegTypeAsLetter : "C",
			vml: function()
			{
				return "c" + [this.x1,this.y1,this.x2,this.y2, this.x, this.y].join(', ');
			}
		});
		
		var SVGPathSegCurvetoCubicRel = SVGPathSeg.extend(
		{ 
			x1: null,
			y1: null,
			x2: null,
			y2: null,
			pathSegType : SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL,
			pathSegTypeAsLetter : "c",
			vml: function()
			{
				return "v" + [this.x1,this.y1,this.x2,this.y2, this.x, this.y].join(',');
			}
		});
		
		var SVGPathSegCurvetoQuadraticAbs = SVGPathSeg.extend(
		{ 
			pathSegType: SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS,
			pathSegTypeAsLetter: "Q"
		});
		
		var SVGPathSegCurvetoQuadraticRel = SVGPathSeg.extend(
		{ 
			pathSegType: SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL,
			pathSegTypeAsLetter: "q"
		});
		
		var SVGPathSegArcAbs = SVGPathSeg.extend(
		{ 
			angle: 				null,
			largeArcFlag: 		true,
			sweepFlag: 			true,
			pathSegType: 		SVGPathSeg.PATHSEG_ARC_ABS,
			pathSegTypeAsLetter: "A"
		});
		
		var SVGPathSegArcRel = SVGPathSeg.extend(
		{ 
			r1: 			null,
			r2: 			null,
			angle: 			null,
			largeArcFlag: 	true,
			sweepFlag: 		true,
			pathSegType: 	SVGPathSeg.PATHSEG_ARC_REL,
			pathSegTypeAsLetter: "a"
		});
		
		var SVGPathSegLinetoHorizontalAbs = SVGPathSeg.extend(
		{ 
			pathSegType: SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS,
			pathSegTypeAsLetter: "H"
		});
		
		var SVGPathSegLinetoHorizontalRel = SVGPathSeg.extend(
		{ 
			pathSegType: SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL,
			pathSegTypeAsLetter: "h"
		});
		
		var SVGPathSegLinetoVerticalAbs = SVGPathSeg.extend( 
		{ 
			pathSegType:SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS,
			pathSegTypeAsLetter:"V",
			vml: function()
			{
				return "l" + [this.x,this.y].join(',');
			}
		});
		
		var SVGPathSegLinetoVerticalRel = SVGPathSeg.extend( 
		{ 
			pathSegType:SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL,
			pathSegTypeAsLetter:"v"
		});
		
		var SVGPathSegCurvetoCubicSmoothAbs = SVGPathSeg.extend(
		{ 
			pathSegType:SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS,
			pathSegTypeAsLetter:"S"
		});
		
		var SVGPathSegCurvetoCubicSmoothRel = SVGPathSeg.extend(
		{
			pathSegType:SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL,
			pathSegTypeAsLetter:"s"
		});
		
		var SVGPathSegCurvetoQuadraticSmoothAbs = SVGPathSeg.extend(
		{
			pathSegType:SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS,
			pathSegTypeAsLetter:"T"
		});
		
		var SVGPathSegCurvetoQuadraticSmoothRel = SVGPathSeg.extend(
		{
			pathSegType:SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL,
			pathSegTypeAsLetter:"t"
		});
	
		return {
			cast: function(arg) /* Cast array parameters to integer */
			{
				for ( var i=0, j = arg.length; i < j; ++i ) 
			    {
			        arg[i] = Math.round(arg[i]);
			    }
			    
			    return arg;
			},
			path: function(value)
			{
	            var path = [], regex = /([-+]?[0-9]*\.?[0-9]+)/gi;
	
	            /* Replace exponent parts */
	            value = value.replace(/(\d*)((\.*\d*)(e ?-?\d*))/g,"$1");
	            
	            var pathCommands = value.match( /([MLHVCSQTAZ].*?)(?=[MLHVCSQTAZ]|$)/gi );
	            
	            for( var i=0; i < pathCommands.length; i++ ) 
	            {
	                    var command = pathCommands[i].substring(0,1), params = pathCommands[i].substring(1,pathCommands[i].length);
	                    
	                    /* Extract numbers */
						var data = params.match(regex);
						
						/* Normalize */
						if (data)
						{
							for (x = 0; x < data.length; x++)
							{							
								var num = Math.round(data[x]);
								
								data[x] = " " + num;
							}
							
							params = data.join();
						}
						
						/* Get coordinates */
						args = params.split(/[,]+/);
						
						/* Cast all arguments to integers */
						args = this.cast(args);
	
	                    switch(command) 
	                    {
	                        case "M": // moveTo absolute
	                                element = this.createSVGPathSegMovetoAbs(args[0], args[1]);
	                                break;
	                        case "m": // moveTo relative
	                                element = this.createSVGPathSegMovetoRel(args[0], args[1]);
	                                break;
	                        case "A": // arc absolute:
	                                element = this.createSVGPathSegArcAbs(args[5], args[6], args[j], args[1], args[2], args[3], args[4]);
	                                break;
	                        case "a":
	                        		element = this.createSVGPathSegArcRel(args[5], args[6], args[j], args[1], args[2], args[3], args[4]);
	                        		break;
	                        case "L": // lineTo absolute
	                               	element = this.createSVGPathSegLinetoAbs(args[0], args[1]);
	                                break;
	                        case "l": // lineTo relative
	                               	element = this.createSVGPathSegLinetoRel(args[0], args[1]);
	                                break;
	                        	break;
	                       	case "V": /* Absolute vertical line */
	                       		  	element = this.createSVGPathSegLinetoVerticalAbs(args[0]);
	                                break;
	                        case "H": /* Absolute horizontal line*/
	                        		element = this.createSVGPathSegLinetoHorizontalAbs(args[0]);
	                        		break;
	                        case "v":
	                        		element = this.createSVGPathSegLinetoVerticalRel(args[0]);
	                                break;
	                       	case "h": /* Relative line to */
	                       			element = this.createSVGPathSegLinetoHorizontalRel(args[0]);
	                                break;
	                        case "C":
	                        		element = this.createSVGPathSegCurvetoCubicAbs(args[4], args[5], args[0], args[1],args[2], args[3]);
	                        		break;
	                        case "c":
	                               	element = this.createSVGPathSegCurvetoCubicRel(args[4], args[5], args[0], args[1], args[2], args[3]);
	                                break;
	                        case "S":
	                        		element = this.createSVGPathSegCurvetoCubicSmoothAbs(args[2], args[3], args[0], args[1]);
	                                break;
	                        case "s":
	                        		element = this.createSVGPathSegCurvetoCubicSmoothRel(args[2], args[3], args[0], args[1]);
	                        		break;
	                        case "z":
	                        		element = this.createSVGPathSegClosePath();
	                              	break;
	                        default:
	                           	  	element = new SVGPathSeg();
	                    }
	
	                    path.push(element);                   
	            }
	            
	            return this.vml(path);
			},
			vml: function(path)
			{	
				var vml = [], cx = 0, cy = 0, xn = 0, yn = 0,startx = 0, starty = 0; //M,m Z,z
				
				for (var j = 0, tli = path.length; j < tli; ++j) 
				{
					var ti = path[j], ts = ti.pathSegType, dii = ti.pathSegTypeAsLetter;
					
					if (ts ===  0) 
					{
						/*SVGPathSeg.PATHSEG_UNKNOWN*/
					} 
					else 
					{
						var rx = cx, ry = cy;   //rx
						
						if (ts % 2 === 1) 
						{
							cx += ti.x;
							cy += ti.y;
						} 
						else 
						{
							cx = ti.x;
							cy = ti.y;
						}
						
						if (dii === "C") 
						{
							vml.push(ti);
						} 
						else if (dii === "L") 
						{
							vml.push(ti);
							
						} else if (dii === "M") 
						{
							if (j !== 0) 
							{
								var tg = path[j-1];
								
								if (tg.pathSegTypeAsLetter === "M") 
								{
									vml.push(this.createSVGPathSegLinetoAbs(cx, cy));
									
									continue;
								}
							}
							startx = cx;
							starty = cy;
							
							vml.push(ti);
						} 
						else if (dii === "m") 
						{
							if (j !== 0) 
							{
								var tg = path[j-1];
								
								if (tg.pathSegTypeAsLetter === "m") 
								{
									vml.push(this.createSVGPathSegLinetoAbs(cx, cy));
									
									continue;
								}
							}
							startx = cx;
							starty = cy;
							
							vml.push(this.createSVGPathSegMovetoAbs(cx, cy));
						} 
						else if (dii === "l") 
						{
							vml.push(this.createSVGPathSegLinetoAbs(cx, cy));
						} 
						else if (dii === "c") 
						{
							vml.push(ti);
						} 
						else if (dii.toLowerCase() === "z") 
						{
							cx = startx;
							cy = starty;
	
							vml.push(ti);
						} 
						else if (dii === "Q") 
						{
							xn = 2*cx - ti.x1;
							yn = 2*cy - ti.y1;
							
							vml.push(this.createSVGPathSegCurvetoCubicAbs(cx, cy, (rx + 2*ti.x1) / 3, (ry + 2*ti.y1) / 3, (2*ti.x1 + cx) / 3, (2*ti.y1 + cy) / 3));
							
						} 
						else if (dii === "q") 
						{
							var x1 = ti.x1 + rx, y1 = ti.y1 + ry;
							
							xn = 2*cx - x1;
							yn = 2*cy - y1;
							
							vml.push(this.createSVGPathSegCurvetoCubicAbs(cx, cy, (rx + 2*x1) / 3, (ry + 2*y1) / 3, (2*x1 + cx) / 3, (2*y1 + cy) / 3));
							
							x1 = y1 = null;
						} 
						else if (dii === "A" || dii === "a") 
						{
							(function(ti, cx, cy, rx, ry, tar, vml) 
							{
								if (ti.r1 === 0 || ti.r2 === 0) 
								{
									return;
								}
								
								var fS = ti.sweepFlag,
								psai = ti.angle,
								r1 = Math.abs(ti.r1),
								r2 = Math.abs(ti.r2),
								ctx = (rx - cx) / 2,  cty = (ry - cy) / 2,
								cpsi = Math.cos(psai*Math.PI/180),
								spsi = Math.sin(psai*Math.PI/180),
								rxd = cpsi*ctx + spsi*cty,
								ryd = -1*spsi*ctx + cpsi*cty,
								rxdd = rxd * rxd, rydd = ryd * ryd,
								r1x = r1 * r1,
								r2y = r2 * r2,
								lamda = rxdd/r1x + rydd/r2y,
								sds;
								
								if (lamda > 1) 
								{
									r1 = Math.sqrt(lamda) * r1;
									r2 = Math.sqrt(lamda) * r2;
									sds = 0;
								}  
								else
								{
									var seif = 1;
									if (ti.largeArcFlag === fS) 
									{
										seif = -1;
									}
									sds = seif * Math.sqrt((r1x*r2y - r1x*rydd - r2y*rxdd) / (r1x*rydd + r2y*rxdd));
								}
								
								var txd = sds*r1*ryd / r2,
								tyd = -1 * sds*r2*rxd / r1,
								tx = cpsi*txd - spsi*tyd + (rx+cx)/2,
								ty = spsi*txd + cpsi*tyd + (ry+cy)/2,
								rad = Math.atan2((ryd-tyd)/r2, (rxd-txd)/r1) - Math.atan2(0, 1),
								s1 = (rad >= 0) ? rad : 2 * Math.PI + rad,
								rad = Math.atan2((-ryd-tyd)/r2, (-rxd-txd)/r1) - Math.atan2((ryd-tyd)/r2, (rxd-txd)/r1),
								dr = (rad >= 0) ? rad : 2 * Math.PI + rad;
								
								if (!fS  &&  dr > 0) 
								{
									dr -=   2*Math.PI;
								} else if (fS  &&  dr < 0) 
								{
									dr += 2*Math.PI;
								}
								
								var sse = dr * 2 / Math.PI,
								seg = Math.ceil(sse<0 ? -1*sse  :  sse),
								segr = dr / seg,
								t = 8/3 * Math.sin(segr/4) * Math.sin(segr/4) / Math.sin(segr/2),
								cpsir1 = cpsi * r1, cpsir2 = cpsi * r2,
								spsir1 = spsi * r1, spsir2 = spsi * r2,
								mc = Math.cos(s1),
								ms = Math.sin(s1),
								x2 = rx - t * (cpsir1*ms + spsir2*mc),
								y2 = ry - t * (spsir1*ms - cpsir2*mc);
								
								for (var n = 0; n < seg; ++n) 
								{
									s1 += segr;
									mc = Math.cos(s1);
									ms = Math.sin(s1);
									
									var x3 = cpsir1*mc - spsir2*ms + tx,
									y3 = spsir1*mc + cpsir2*ms + ty,
									dx = -t * (cpsir1*ms + spsir2*mc),
									dy = -t * (spsir1*ms - cpsir2*mc);
									
									vml.push(this.createSVGPathSegCurvetoCubicAbs(x3, y3, x2, y2, x3-dx, y3-dy));
									
									x2 = x3 + dx;
									y2 = y3 + dy;
								}
								
								ti= cx= cy= rx= ry= tar= vml = null;
							
							})(ti, cx, cy, rx, ry, tar, vml);
						} 
						else if (dii === "S") 
						{
							if (j !== 0) 
							{
								var tg = vml[vml.length -1];
								
								if (tg.pathSegTypeAsLetter === "C") 
								{ 
									var x1 = 2 * tg.x - tg.x2, y1 = 2 * tg.y - tg.y2;
								} 
								else 
								{
									var x1 = rx, y1 = ry;
								}
							} 
							else 
							{
								var x1 = rx, y1 = ry;
							}
							
							vml.push(this.createSVGPathSegCurvetoCubicAbs(cx, cy, x1, y1, ti.x2, ti.y2));
							
							x1 = y1 = null;
						} 
						else if (dii === "s") 
						{
							if (j !== 0) 
							{
								var tg = vml[vml.length -1];
								
								if (tg.pathSegTypeAsLetter === "C") 
								{
									var x1 = 2*tg.x - tg.x2,
									y1 = 2*tg.y - tg.y2;
								} 
								else 
								{
									var x1 = rx,
									y1 = ry;
								}
							} 
							else 
							{
								var x1 = rx,
								y1 = ry;
							}
							
							vml.push(this.createSVGPathSegCurvetoCubicAbs(cx, cy, x1, y1, ti.x2+rx, ti.y2+ry));
							
							x1 = y1 = null;
						} 
						else if (dii === "T" || dii === "t") 
						{
							if (j !== 0) 
							{
								var tg = path[j-1];
								
								if ("QqTt".indexOf(tg.pathSegTypeAsLetter) > -1) 
								{
									
								} else 
								{
									xn = rx, yn = ry;
								}
							} 
							else 
							{
								xn = rx, yn = ry;
							}
							
							vml.push(this.createSVGPathSegCurvetoCubicAbs(cx, cy, (rx + 2*xn) / 3, (ry + 2*yn) / 3, (2*xn + cx) / 3, (2*yn + cy) / 3));
							
							xn = 2*cx - xn;
							yn = 2*cy - yn;
							xx1 = yy1 = null;
							
						} 
						else if (dii === "H" || dii === "h") 
						{
							vml.push(this.createSVGPathSegLinetoAbs(cx, ry));
							cy = ry; //å
						} 
						else if (dii === "V" || dii === "v") 
						{
							vml.push(this.createSVGPathSegLinetoAbs(rx, cy));
							cx = rx;
						}
					}
				}
				
				var string = [];
				
				for (var i in vml)
				{
					string.push(vml[i].vml());
				}
				
				return string.join('');
			},
			createSVGPathSegClosePath: function() 
			{
				return (new SVGPathSegClosePath());
			},
			createSVGPathSegMovetoAbs: function(/*float*/ x, /*float*/ y ) 
			{
				s = new SVGPathSegMovetoAbs();
				
				s.x = x;
				s.y = y;
				
				return s;
			},
			createSVGPathSegMovetoRel: function(/*float*/ x, /*float*/ y ) 
			{
				var s = new SVGPathSegMovetoRel();
				s.x = x;
				s.y = y;
				return s;
			},
			createSVGPathSegLinetoAbs: function(/*float*/ x, /*float*/ y ) 
			{
				var s = new SVGPathSegLinetoAbs();
				s.x = x;
				s.y = y;
				return s;
			},
			createSVGPathSegLinetoRel: function(/*float*/ x, /*float*/ y ) 
			{
				var s = new SVGPathSegLinetoRel();
				s.x = x;
				s.y = y;
				return s;
			},
			createSVGPathSegCurvetoCubicAbs: function(/*float*/ x, /*float*/ y, /*float*/ x1, /*float*/ y1, /*float*/ x2, /*float*/ y2 ) 
			{
				s = new SVGPathSegCurvetoCubicAbs();
				
				s.x = x;
				s.y = y;
				s.x1 = x1;
				s.y1 = y1;
				s.x2 = x2;
				s.y2 = y2;
				
				return s;
			},
			createSVGPathSegCurvetoCubicRel: function(/*float*/ x, /*float*/ y, /*float*/ x1, /*float*/ y1, /*float*/ x2, /*float*/ y2 ) 
			{
				var s = new SVGPathSegCurvetoCubicRel();
				
				s.x = x;
				s.y = y;
				s.x1 = x1;
				s.y1 = y1;
				s.x2 = x2;
				s.y2 = y2;
				return s;
			},
			createSVGPathSegCurvetoQuadraticAbs: function(/*float*/ x, /*float*/ y, /*float*/ x1, /*float*/ y1 ) 
			{
				var s = new SVGPathSegCurvetoQuadraticAbs();
				
				s.x = x;
				s.y = y;
				s.x1 = x1;
				s.y1 = y1;
				return s;
			},
			createSVGPathSegCurvetoQuadraticRel: function(/*float*/ x, /*float*/ y, /*float*/ x1, /*float*/ y1 ) 
			{
				var s = new SVGPathSegCurvetoQuadraticRel();
				
				s.x = x;
				s.y = y;
				s.x1 = x1;
				s.y1 = y1;
				return s;
			},
			createSVGPathSegArcAbs: function(/*float*/ x, /*float*/ y, /*float*/ r1, /*float*/ r2, /*float*/ angle, /*boolean*/ largeArcFlag, /*boolean*/ sweepFlag ) 
			{
				var s = new SVGPathSegArcAbs();
				
				s.x = x;
				s.y = y;
				s.r1 = r1;
				s.r2 = r2;
				s.angle = angle;
				s.largeArcFlag = largeArcFlag;
				s.sweepFlag = sweepFlag;
				
				return s;
			},
			createSVGPathSegArcRel: function(/*float*/ x, /*float*/ y, /*float*/ r1, /*float*/ r2, /*float*/ angle, /*boolean*/ largeArcFlag, /*boolean*/ sweepFlag ) 
			{
				var s = new SVGPathSegArcRel();
				
				s.x = x;
				s.y = y;
				s.r1 = r1;
				s.r2 = r2;
				s.angle = angle;
				s.largeArcFlag = largeArcFlag;
				s.sweepFlag = sweepFlag;
				
				return s;
			},
			createSVGPathSegLinetoHorizontalAbs: function(/*float*/ x ) 
			{
				var s = new SVGPathSegLinetoHorizontalAbs();
				
				s.x = x;
				s.y = 0;
				
				return s;
			},
			createSVGPathSegLinetoHorizontalRel: function(/*float*/ x ) 
			{
				var s = new SVGPathSegLinetoHorizontalRel();
				s.x = x;
				s.y = 0;
				
				return s;
			},
			createSVGPathSegLinetoVerticalAbs: function(/*float*/ y ) 
			{
				var s = new SVGPathSegLinetoVerticalAbs();
				s.x = 0;
				s.y = y;
				
				return s;
			},
			createSVGPathSegLinetoVerticalRel: function(/*float*/ y ) 
			{
				var s = new SVGPathSegLinetoVerticalRel();
				s.x = 0;
				s.y = y;
				
				return s;
			},
			createSVGPathSegCurvetoCubicSmoothAbs: function(/*float*/ x, /*float*/ y, /*float*/ x2, /*float*/ y2 ) 
			{
				var s = new SVGPathSegCurvetoCubicSmoothAbs();
				
				s.x = x;
				s.y = y;
				s.x2 = x2;
				s.y2 = y2;
				
				return s;
			},
			createSVGPathSegCurvetoCubicSmoothRel: function(/*float*/ x, /*float*/ y, /*float*/ x2, /*float*/ y2 ) 
			{
				var s = new SVGPathSegCurvetoCubicSmoothRel();
				
				s.x = x;
				s.y = y;
				s.x2 = x2;
				s.y2 = y2;
				
				return s;
			},
			createSVGPathSegCurvetoQuadraticSmoothAbs: function(/*float*/ x, /*float*/ y ) 
			{
				var s = new SVGPathSegCurvetoQuadraticSmoothAbs();
				s.x = x;
				s.y = y;
				
				return s;
			},
			createSVGPathSegCurvetoQuadraticSmoothRel: function(/*float*/ x, /*float*/ y ) 
			{
				var s = new SVGPathSegCurvetoQuadraticSmoothRel();
				
				s.x = x;
				s.y = y;
				
				return s;
			}
		}
	})();

	/**
	* Core.draw
	* 
	* VML/SVG Draw implementation
	* @version 1.0
	*/
	Core.draw = (function()
	{
		/**
		* Shape Class
		*/
		var Shape = Core.extend(
		{
			id: 		null,
			element: 	null,
			fill: 		null,
			stopped:  	false,
			timeout: 	null,
			options:
			{
				top:		0,
				left: 		0,
				width:  	0,
				height:	 	0,
				opacity: 	0,
				radius: 	0,
				speed: 		0.05,
				color: 		'#ffffff',
				angle: 		0
			},
			init: function(id, options)
			{
				/* Set shape id */
				this.id = id;
				
				/* Extend shape options */
				$.extend(this.options, options);
				
				/* Calculate radius */
				this.options.width = this.options.height = options.radius;
			},
			config: function(element, styles, attributes)
			{
				styles 	   = styles || {};
				attributes = attributes || {};
				
				/* Config element */
				$(element).css(styles);
				
				/* Set attributes */
				$.each(attributes,  function(attribute, value)
				{
					element.setAttribute(attribute, value);
				})
			},
			output: function()
			{
				if ($.browser.msie) /* Use VML */
				{
					/* Create element */
					this.element = document.createElement('v:oval');
					
					this.config(this.element, 
					{
						left:		this.options.left,
						top:		this.options.top,
						width:		this.options.size,
						height:		this.options.size
					}, {
						stroked: false
					});
					
					/* Create fill */
					this.fill = document.createElement('v:fill');
			
					this.config(this.fill, null, 
					{
						type:		'solid',
						color: 		this.options.color,
						opacity: 	this.options.opacity
					})
					/* Full type */
					
					/* Append fill */
					this.element.appendChild(this.fill);
					
					return this.element;
				}
				else /* Use canvas */ 
				{
					
					this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					
					this.config(this.element, null, 
					{
						cx: 		this.options.left,
						cy: 		this.options.top,
						r: 			this.options.size/2,
						opacity: 	this.options.opacity,
						fill: 		this.options.color
					});
					
				
					return this.element;
				}
			},
			animate: function(timeout)
			{
				this.timeout = this.timeout || timeout;
				
				setTimeout(this.delegate(this, $.browser.msie ? this.fade : this.fadeSVG), this.timeout);
			},
			fade: function()
			{
				if (!this.stopped)
				{
					if (this.fill.opacity >= this.options.speed)
					{
						this.fill.opacity -= this.options.speed;
						
						setTimeout(this.delegate(this, this.fade), 10);
					}
					else 
					{
						this.fill.opacity = 1;
						
						/* Continue fading */
						this.fade();
					}
				}
			},
			fadeSVG: function()
			{
				if (!this.stopped)
				{
					var opacity = this.element.getAttribute("opacity");
					
					if (opacity >= this.options.speed)
					{
						this.element.setAttribute("opacity", opacity - this.options.speed);
						
						setTimeout(this.delegate(this, this.fadeSVG), 10);
					}
					else 
					{
						this.element.setAttribute("opacity",1);
						
						/* Continue fading */
						this.fadeSVG();
					}
				}
			},
			stop: function()
			{
				this.stopped = true;
				
				return this;
			},
			resume: function()
			{
				this.stopped = false;
				
				this.animate(this.timeout);
				
				return this;
			},
			cast: function(arg) /* Cast array parameters to integer */
			{
				for ( var i=0, j = arg.length; i < j; ++i ) 
			    {
			        arg[i] = Math.round(arg[i]);
			    }
			    
			    return arg;
			}
		});
		
		var Path = Shape.extend(
		{
			output: function()
			{
				var path = null, points = [], coords = [];
				
				points.push([0,0]);
				points.push([20,20]);
				points.push([20,40]);
				points.push([0,20]);
				
				for (var i in points)
				{
					coords.push([points[i][0], points[i][1]].join(" "));
				}
				
				/* Twitter Path */
				if ($.browser.msie) /* Use VML */
				{
					/* Create element */
					this.element = document.createElement('v:shape');

					this.config(this.element, 
					{
						top: 		this.options.top, 
						left: 		this.options.left,
						width:		1, 
						height: 	1,
						rotation: 	this.options.angle
					}, {
						coordorigin: "0 0",
						coordsize: "1 1",
						path: Core.SVG.path(this.options.path),
						stroked: false
					});
					
					/* Create fill */
					this.fill = document.createElement('v:fill');
			
					this.config(this.fill, null, 
					{
						type:		'solid',
						color: 		this.options.color,
						opacity: 	this.options.opacity
					})

					/* Append fill */
					this.element.appendChild(this.fill);
					
					return this.element;
				}
				else /* Use canvas */ 
				{
					this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
					
					this.config(this.element, null, 
					{	
						d: 			this.options.path,
						opacity: 	this.options.opacity,
						fill: 		this.options.color,
						transform:  "scale(" + this.options.scale + "  " + this.options.scale + ") translate(" + this.options.left + "," + this.options.top + ") rotate(" + this.options.angle + " 0 0)"
					});
					 	
					return this.element;
				}
				
			},
			convert: function(value)
			{
				
				/* Tracing */
                var cursorX = 0;
                var cursorY = 0;
        
                var regex = /([-+]?[0-9]*\.?[0-9]+)/gi;

                /* Replace exponent parts */
                value = value.replace(/(\d*)((\.*\d*)(e ?-?\d*))/g,"$1");
                
                var pathCommands = value.match( /([MLHVCSQTAZ].*?)(?=[MLHVCSQTAZ]|$)/gi );
                
                var newPath = "";

                for( var i=0; i < pathCommands.length; i++ ) 
                {
                        var command = pathCommands[i].substring(0,1);
                        
                        var params = pathCommands[i].substring(1,pathCommands[i].length);
                        
                        /* Extract numbers */
						var data = params.match(regex);
						
						if (data)
						{
							for (x = 0; x < data.length; x++)
							{							
								var num = Math.round(data[x]);
								
								data[x] = " " + num;
							}
							
							params = data.join();
						}

                        switch( command ) 
                        {
                                case "M": // moveTo absolute
                                        var command="m";
                                        var coords = params.split(/[, ]/);
                                        
                                        cursorX = parseInt(coords[0]);
                                        cursorY = parseInt(coords[1]);
                                        
                                        break;
                                case "m": // moveTo relative
                                        var command = "t"
                                        var coords = params.split(/[, ]/);
                                        
                                        coords[0] = parseInt(coords[0]) + parseInt(cursorX); 
                                        coords[1] = parseInt(coords[1]) + parseInt(cursorY);
                                        
                                        cursorX = parseInt(coords[0]);
                                        cursorY = parseInt(coords[1]);

                                        break;
                                case "A": // arc absolute:
                                        var command = "ae";
                                        var args = params.split(/[, ]+/);
                                        
                                        args = this.cast(args);
                                        
                                        params = args[4] + " " + args[5] + " " + args[2]*2 + " " + args[3]*2 + " 0 360";

                                        break;
                                case "L": // lineTo absolute
                                        var command = "l";
                                        
                                        var coords = params.split(/[, ]+/);
                                        
                                        cursorX = parseInt(coords[0]);
                                        cursorY = parseInt(coords[0]);
                                        
                                        break;
                                case "l": // lineTo relative
                                        var command = "r";
                                        var coords = params.split(/[, ]+/);
     
                                        coords[0] = parseInt(coords[0]) + parseInt(cursorX); 
                                        coords[1] = parseInt(coords[1]) + parseInt(cursorY);
                                        
                                        cursorX = parseInt(coords[0]);
                                        cursorY = parseInt(coords[1]);
                                     
                                        break;
                                	break;
                               	case "V": /* Absolute vertical line */
                               		  	var command = "l", coords = params.split(/[, ]+/);
                               		  	
                               		  	params = [cursorX,coords[0]].join(',');
                               		  	
                                        cursorY = parseInt(coords[0]);
                               		  	
                                        break;
                                case "H": /* Absolute horizontal line*/
                                		var command = "l", coords = params.split(/[, ]+/);
                                		
                               		  	params = [coords[0],cursorY].join(',');
                               		  	
                               		  	/* Set current cursor */
                               		  	cursorX = parseInt(coords[0]);
                                		break;
                                case "v":
                                		var command = "r", coords = params.split(/[, ]+/);
                                        break;
                               	case "h": /* Relative line to */
                               			var command = "r", coords = params.split(/[, ]+/);
                               			
                               		  	params = [coords[0],0].join(',');
                               		  	
                               		  	cursorX = parseInt(cursorX) + parseInt(coords[0]);
                               		  
                               		  	/* Update cursors X */
                                        break;
                                case "C":
                                		var command = "c";
                                		
                                		var args = params.split(/[, ]+/);
                                		
										args = this.cast(args);
										
										cursorX = args[4];
										cursorY = args[5];
										
                                	break;
                                case "c":
                                        var command = "v";
                                        
                                        var args = params.split(/[, ]+/);
										
										args = this.cast(args);
										
										cursorX = cursorX + args[4];
										cursorY = cursorY + args[5];
										
                                        break;
                                case "S":
                                		var command = "c";
                                		 
										var args = params.split(/[, ]+/);
										
										args = this.cast(args)
										
										params = args.join(',');
										
                                        break;
                                case "s":
                                		 var command = "hf";
                                         break;
                                	break;
                                case "z":
                                        var command = "xe";
                                        var params = "";

                                default:
                               	 	command = command.toLowerCase();
                        }
                        newPath += command + params;                                    
                }
                
                return Core.SVG.path(value);
				
                
                return newPath;

			}
		});
		
		
		var AnimatedLoader = Core.extend(
		{
			options: 	null,
			shapes:		[],
			queue:		[],
			svg:		null,
			canvas:		null,
			init: function(options)
			{
				this.shapes = [];
				
				/* Default options */
				this.options = $.extend(
				{
					size: 		8,
					radius: 	15,
					opacity:	1,
					points: 	8,
					speed: 		2,
					scale: 		1,
					shape: 		'circle',
					color: 		'#000000'
				},options);
				

				if (!$.browser.msie) /* Change behaviour */
				{
					this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					
					this.svg.setAttribute("width", 100 + '%');
					this.svg.setAttribute("height", 100 + '%');
					this.svg.setAttribute("version", "1.2");
					this.svg.setAttribute("shape-rendering","geometricPrecision");
					this.svg.setAttribute("text-rendering",	"geometricPrecision")
					this.svg.setAttribute("image-rendering","optimizeQuality")
				}
				
				return this;
			},
			create: function()
			{
					/* Calculate loader offset */
				var offset = 20 + this.options.radius + this.options.size/2;
				
				/* Calculate points */
				var points = this.points(offset,offset,this.options.radius,this.options.radius,0,this.options.points);
				
				/* Get canvas element */
				this.canvas = $(this.options.renderTo);

				var x = this.options.opacity/this.options.points, opacity = 0;
				
				for (var point in points)
				{
					var pointOptions = 
					{
						top: 	 points[point].y,
						left: 	 points[point].x,
						angle: 	 points[point].angle,
						radius:  this.options.radius,
						opacity: (opacity += x),
						speed:   this.options.speed/100,
						color: 	 this.options.color,
						size: 	 this.options.size,
						scale: 	 this.options.scale,
						path: 	 this.options.path
					}
					
					switch(this.options.shape.toLowerCase())
					{
						case 'path': /* Use polyline */
							var shape = new Path(point, pointOptions);
							break;
						default: /* Default top circle */
							var shape = new Shape(point, pointOptions);
					}
					
					if ($.browser.msie)
					{
						this.canvas.append(shape.output());
					}
					else 
					{
						this.svg.appendChild(shape.output());
					}
					
					
					/* Queue shape */
					this.shapes.push(shape);
				}
				
				this.canvas.append(this.svg);

				/* Calculate speeds */
				
				//this.play((1/(this.options.speed/100))/this.options.points);
				
				return this;
			},
			play: function(speed)
			{
				for (var i in this.shapes)
				{
					this.shapes[i].animate(speed * (this.shapes.length - 1));
				}
			},
			pause: function()
			{
				for (var i in this.shapes)
				{
					this.shapes[i].stop();
				}
			},
			resume: function()
			{
				for (var i in this.shapes)
				{
					this.shapes[i].resume();
				}
			},
			hide: function()
			{
				this.canvas.add(this.svg).empty();
			},
			points: function(x, y, a, b, angle, steps) 
			{
				if (steps == null) steps = 36;
				
				var points = [];
				
				// Angle is given by Degree Value
				var beta = -angle * (Math.PI / 180); //(Math.PI/180) converts Degree Value into Radians
				var sinbeta = Math.sin(beta);
				var cosbeta = Math.cos(beta);
				
				for (var i = 0; i < 360; i += 360 / steps) 
				{
					var alpha 	 = i * (Math.PI / 180) ;
					var sinalpha = Math.sin(alpha);
					var cosalpha = Math.cos(alpha);
					
					var X = x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta);
					var Y = y + (a * cosalpha * sinbeta + b * sinalpha * cosbeta);
	
	
					points.push(
					{
						x: 		Math.floor(X),
						y: 		Math.floor(Y),
						angle: 	i
					});
				}
				
				return points;
			}
		});
		
		/* Start transformations */
		if ($.browser.msie)
		{
			document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
			
			/* Create dynamic stylesheet */
			var style = document.createStyleSheet();
		}
		
		var shapes = 
		[
			'shape',
			'rect', 
			'oval', 
			'circ', 
			'fill', 
			'stroke', 
			'imagedata', 
			'group',
			'textbox',
			'polyline',
			'arc',
			'path',
			'roundrect'
		];
		
		return {
			
			setup: function()
			{
				if ($.browser.msie) /* VML, Change behaviour */
				{
					$.each(shapes,function() 
					{
						style.addRule('v\\:' + this,"position:absolute; display:block; behavior: url(#default#VML); antialias:true;");
					});
				}
				
				return this;
			},
			loader: function(options)
			{
				return (new AnimatedLoader(options)).create();
			}
		}
	})();
	/* EOF Core */
})(jQuery, window);