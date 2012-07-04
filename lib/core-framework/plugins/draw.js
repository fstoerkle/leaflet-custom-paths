/**
* Core.draw
* 
* VML/SVG Draw implementation
* @version 1.0
*/
Core.draw = (function()
{
	var Shape = Core.inherit(function(options)
	{
		/* Private members */
		var options = $.extend(
		{
			top:		0,
			left: 		0,
			width:  	0,
			height:	 	0,
			opacity: 	1,
			scale: 		1,
			angle: 		0
		}, options) /* Override default options */
		
		return {
			element: null,
			getOptions: function()
			{
				return options;
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
			cast: function(arg) /* Cast array parameters to integer */
			{
				for ( var i=0, j = arg.length; i < j; ++i ) 
			    {
			        arg[i] = Math.round(arg[i]);
			    }
			    
			    return arg;
			}
		}
	});
	
	var Animatable = Shape.inherit(function(options)
	{
		/* Call parent constructor */
		this.parent(options);
		
		return {
			timeout: 100,
			animate: function(timeout)
			{
				this.timeout = this.timeout || timeout;
				
				/* Set initial opacity */
				
				if ($.browser.msie)
				{
					this.fill.opacity = this.getOptions().opacity
				}
				else 
				{
					this.element.setAttribute("opacity", this.getOptions().opacity);
				}

				setTimeout(this.delegate(this, $.browser.msie ? this.fade : this.fadeSVG), this.timeout);
			},
			fade: function()
			{
				if (this.fill.opacity >= this.getOptions().speed)
				{
					this.fill.opacity -= this.getOptions().speed;
				}
				else 
				{
					if (!this.stopped)
					{
						this.fill.opacity = this.getOptions().endOpacity;
					}
					else 
					{
						this.fill.opacity = 0;
						
						return;
					}
				}
				
				setTimeout(this.delegate(this, this.fade), 10);
			},
			fadeSVG: function()
			{
				var opacity = this.element.getAttribute("opacity");
				
				if (opacity >= this.getOptions().speed)
				{
					this.element.setAttribute("opacity", opacity - this.getOptions().speed);
				}
				else 
				{
					if (!this.stopped)
					{
						this.element.setAttribute("opacity",this.getOptions().endOpacity);
					}
					else
					{
						 this.element.setAttribute("opacity", 0);
						
						 return;
					}
				}
				
				setTimeout(this.delegate(this, this.fadeSVG), 10);
				
			},
			stop: function()
			{
				this.stopped = true;
				
				return this;
			},
			play: function()
			{
				this.stopped = false;
				
				return this;
			},
			hide: function()
			{
				return this;	
			}
		}
	});
	
	/**
	* Circle 
	* @version 1.0
	*/
	var Circle = Animatable.inherit(function(options)
	{
		/* Call parent constructor */
		this.parent(options);
		
		return {
			output: function()
			{
				if ($.browser.msie) /* Use VML */
				{
					/* Create element */
					this.element = document.createElement('v:oval');
					
					
					this.config(this.element, 
					{
						left:		this.getOptions().left,
						top:		this.getOptions().top,
						width:		this.getOptions().size,
						height:		this.getOptions().size
					}, {
						stroked: false
					});
					
					/* Create fill */
					this.fill = document.createElement('v:fill');
			
					this.config(this.fill, null, 
					{
						type:		'solid',
						color: 		this.getOptions().color,
						opacity: 	this.getOptions().opacity
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
						cx: 		this.getOptions().left,
						cy: 		this.getOptions().top,
						r: 			this.getOptions().size/2,
						opacity: 	0,
						fill: 		this.getOptions().color,
						transform:  "translate(" + (this.getOptions().size/2) + " " +  (this.getOptions().size/2) + ")"
					});
	
					return this.element;
				}
			}
		}
	});
	
	var Text = Shape.inherit(function(options)
	{
		this.parent(options);
	
		return {
			output: function()
			{
				this.element = document.createElementNS("http://www.w3.org/2000/svg", "text");
					
				this.config(this.element, null, 
				{
					x: 		20,
					y: 		20
				});
				
				/* Append the text */
				this.element.innerHTML = options.text;

				return this.element;
			}
		}
	})
	
	var Path = Animatable.inherit(function(options)
	{
		/* Call parent constructor*/
		this.parent(options);

		return {
			output: function()
			{
				/* Twitter Path */
				if ($.browser.msie) /* Use VML */
				{
					/* Create element */
					this.element = document.createElement('v:shape');
		
					this.config(this.element, 
					{
						top: 		this.getOptions().top, 
						left: 		this.getOptions().left,
						width:		this.getOptions().scale, 
						height: 	this.getOptions().scale,
						rotation: 	this.getOptions().angle
					}, {
						coordorigin: "0 0",
						coordsize: "10 10",
						path: Core.SVG.path(this.getOptions().path),
						stroked: false
					});
					
					/* Create fill */
					this.fill = document.createElement('v:fill');
			
					this.config(this.fill, null, 
					{
						type:		'solid',
						color: 		this.getOptions().color,
						opacity: 	this.getOptions().opacity
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
						d: 			this.getOptions().path,
						opacity: 	this.getOptions().opacity,
						fill: 		this.getOptions().color,
						transform:  "translate(" + (this.getOptions().left) + "," + (this.getOptions().top) + ") scale(" + this.getOptions().scale + ") rotate(" + this.getOptions().angle + " 0 0)"
					});
					 	
					return this.element;
				}
			}
		}
	});
	
	var AnimatedLoader = Core.extend(
	{
		options: 	null,
		shapes:		[],
		init: function(options)
		{
			this.shapes = [];
			
			/* Default options */
			this.options = $.extend(
			{
				offset: 
				{
					top:0,
					left:0
				},
				size: 		8,
				radius: 	15,
				opacity:	1,
				points: 	8,
				speed: 		2,
				scale: 		1,
				angle: 		0,
				clockwise:  true,
				shape: 		'circle',
				scale: 		1,
				color: 		'#000000',
				autoplay: 	true
			},options);

			return this;
		},
		create: function(canvas)
		{
			/* Calculate points */
			var points = this.points(this.options.offset.left,this.options.offset.top,this.options.radius,this.options.radius,this.options.angle,this.options.points);

			var x = this.options.opacity/this.options.points, opacity = 0;
			
			for (var point in points)
			{
				var pointOptions = 
				{
					top: 	 	points[point].y,
					left: 	 	points[point].x,
					angle: 		points[point].angle,
					radius:  	this.options.radius,
					opacity: 	(opacity += x),
					endOpacity: this.options.opacity,
					speed:   	this.options.speed/100,
					color: 	 	this.options.color,
					size: 	 	this.options.size,
					scale: 	 	this.options.scale,
					path: 	 	this.options.path
				}
				
				switch(this.options.shape.toLowerCase())
				{
					case 'path': /* Use polyline */
						var shape = new Path(pointOptions);
						break;
					default: /* Default top circle */
						var shape = new Circle(pointOptions);
				}
				
				canvas.append(shape.output());
				
				/* Queue shape */
				this.shapes.push(shape);
			}

			if (this.options.autoplay)
			{
				this.play((1/(this.options.speed/100))/this.options.points);
			}
			
			return this;
		},
		points: function(x, y, a, b, angle, steps) 
		{
			if (steps == null) steps = 36;
			
			var points = [];
			
			// Angle is given by Degree Value
			var beta = -angle * (Math.PI / 180); //(Math.PI/180) converts Degree Value into Radians
			var sinbeta = Math.sin(beta);
			var cosbeta = Math.cos(beta);
			
			for (var i = 0, c = i + 360; i < c; i += 360 / steps) 
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
		},
		play: function(speed)
		{
			for (i = 0, c = this.shapes.length; i < c; i++)
			{
				this.shapes[i].animate(speed * (this.shapes.length - 1));
			}
		},
		stop: function()
		{
			for (i = 0, c = this.shapes.length; i < c; i++)
			{
				this.shapes[i].stop().hide()
			}
		}
	});
	
	
	/* Special inherit method */
	var Coredraw = Core.inherit(function(options)
	{
		var vml = 
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

		var shapes = {}, canvas = null, options = $.extend(
		{
			width:	20,
			height:	20
		}, options);
		
		
		/* Start transformations */
		if ($.browser.msie)
		{
			document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
			
			/* Create dynamic stylesheet */
			var style = document.createStyleSheet();
			
			/* Add behaviour */
			$.each(vml,function() 
			{
				style.addRule('v\\:' + this,"position:absolute; display:block; behavior: url(#default#VML); antialias:true;");
			});
		}
		
		return {
			getCanvas: function()
			{
				if (null == canvas)
				{
					canvas = this.createCanvas();
				}
				return canvas;
			},
			createCanvas: function()
			{
				if (!$.browser.msie) /* Change behaviour */
				{
					var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					
					svg.setAttribute("width", options.width);
					svg.setAttribute("height", options.height);
					
					/* Private options */
					svg.setAttribute("version", "1.2");
					svg.setAttribute("shape-rendering",	"geometricPrecision");
					svg.setAttribute("text-rendering",	"geometricPrecision")
					svg.setAttribute("image-rendering",	"optimizeQuality");
					
					svg.append = function(element)
					{
						this.appendChild(element);
					}
					
					svg.appendTo = function(element)
					{
						$(element).append(this);
					}
					
					return svg;
				}
				else /* Create empty canvas element for IE & initialise shapes */
				{
					/* Add shape behaviour for IE */
					return $('<div/>').css(
					{
						width: options.width,
						height: options.height
					});
				}
			},
			clear: function()
			{
				/* Remove all canvas elements */
				$(this.getCanvas()).empty();
				
				return this;
			},
			appendTo: function(element)
			{
				/* Append canvas to element */
				this.getCanvas().appendTo(element);
				
				return this;
			},
			loader: function(options)
			{
				var canvas = this.getCanvas();
				
				return (new AnimatedLoader(options)).create(canvas);
			},
			path: function(options)
			{
				var path = new Path(options);
				
				this.getCanvas().append(path.output());
				
				return path;
			},
			text: function(options)
			{
				this.getCanvas().append(new Text(options).output());
			}
		}
	});
	
	return {
		setup: function()
		{
			return this;
		},
		canvas: function(options)
		{
			return (new Coredraw(options));
		}
	}
})();