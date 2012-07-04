var Tree = {
	options: 
	{
		items: 'li',
		draggable: 
		{
			handle: 			' > div',
	        addClasses: 		false,
	        helper: 			'clone',
	        zIndex: 			100,
	        opacity: 			.8,
	        refreshPositions: 	true
		},
		droppable: 
		{
			accept: 			'li',
	        tolerance: 			'pointer',
	        refreshPositions: 	true
		},
		folder: null
	},
	init: function(index, item)
	{
		/* Append placeholder(s) */
		var placeholder = $('<div/>').addClass('placeholder'), item = $(item);
		
		placeholder.prependTo(item).css(
		{
			height:2
		})
		
		/* Check wether item has OL children */
		this.refresh();
	},
	drop: function(event, ui)
	{
		var li = $(event.target).parent();
		
		var child = !$(event.target).hasClass('placeholder');
		
		if (child && li.children('ol').length == 0) 
		{
			li.append('<ol/>');
		}
		
		if (child) 
		{
			li.addClass('ui-state-expanded').removeClass('ui-state-collapsed').children('ol').append(ui.draggable).show(200);
		}
		else 
		{
			li.before(ui.draggable);
		}
		
		$('ol.sortable li.ui-state-expanded').not(':has(li:not(.ui-draggable-dragging))').removeClass('ui-state-expanded');
		
		li.find('.placeholder').removeClass('placeholder-active').find('>div').removeClass('ui-droppable-active');
		
		
		this.clear(this.element);
		
		this.refresh();
		
		/* Commit changes to history stack */
		this.history.commit();
	},
	over: function(event, ui)
	{
		$(event.target).filter('div:not(.placeholder)').addClass('ui-droppable-active').parent().children('ol').show(200).each(function()
		{
			$(this).parent().addClass('ui-parent-expanded');
		});
		
        $(event.target).filter('.placeholder').addClass('placeholder-active');
	},
	out: function(event, ui)
	{
		$(event.target).filter('div').removeClass('ui-droppable-active');
        $(event.target).filter('.placeholder').removeClass('placeholder-active');
	},
	refresh: function()
	{
		this.element.find('ol:hidden').each(function()
		{
			$(this).parent().addClass('ui-parent-collapsed');
		});
		
		this.element.find('ol:visible').each(function()
		{
			$(this).parent().addClass('ui-parent-collapsed ui-parent-expanded');
		});
		
		return this;
	},
	clear: function(element) /* Clear empty UL/LI*/
	{
		element.find('ol').filter(function()
		{
			return $(this).children().size() == 0;
		}).remove();
		
		this.serialize.serialize(this.element);
	},
	log: function(event, ui)
	{
		var item = $(event.target);
		
		$(ui.helper).addClass("ui-draggable-helper");

		/* Save state*/
		this.history.saveState(item);
	},
	undo: function(event)
	{
		 if (event.ctrlKey && (event.which == 122 || event.which == 26)) 
		 {
		 	this.history.restoreState();
		 	
			this.refresh();
		 }
	},
	toggle: function(event)
	{
		$(event.target).parents('li:first').toggleClass('ui-parent-expanded').children("ol").toggle(200);
		
		return false;
	},
	_create: function()
	{
		/* Extend draggable options */
		this.options.draggable = $.extend({}, this.options.draggable,
		{
			start: Core.delegate(this, this.log),
			delay: 200
		});
		
		
		/* Extend droppable options */
		this.options.droppable = $.extend({}, this.options.droppable, 
		{
	        drop: 				Core.delegate(this, this.drop),
	        over: 				Core.delegate(this, this.over),
	        out: 				Core.delegate(this, this.out)
		})
		
		/* Init */
		this.element.find(this.options.items)
				    .each(Core.delegate(this, this.init))
				    .bind("click",Core.delegate(this,this.toggle))
				    .bind(
				    {
				    	mouseenter: Core.delegate(this.smartControl, this.smartControl.append,[this.options]),
				    	mouseleave: Core.delegate(this.smartControl, this.smartControl.remove)
				    })
				    .draggable(this.options.draggable)
				    .end()
				    .find('div, .placeholder')
				    .droppable(this.options.droppable)
				    .disableSelection();
				    
	    $(document).bind('keypress', Core.delegate(this, this.undo));
	    
	    this.serialize.serialize(this.element);
	},
	smartControl: (function()
	{
		var Control = Core.extend(
		{
			options: 
			{
				folder:null
			},
			activate: function(target)
			{
				var id = target.attr('data-id'), smart = $('<div/>').addClass('smart fix');
				
				$.each(
				[
					$('<a/>',
					{
						href: this.options.folder + '/edit.php?id=' + id
					}).addClass('edit'),
					$('<a/>',
					{
						href: this.options.folder + '/delete.php?id=' + id
					}).bind('click', function()
					{
						return confirm("Are you sure?");
					}).addClass('delete')
				], function()
				{
					$(this).addClass('smart-link').bind('click', function(event)
					{
						event.stopPropagation();
						
					}).appendTo(smart);
				})
				
				smart.appendTo(target);
			},
			deactivate: function(target)
			{
				target.find('.smart').remove();
			},
			setOptions: function(options)
			{
				$.extend(this.options, options);
				
				return this;
			}				
		});
		
		return {
			element: null,
			control: function()
			{
				if (null == this.element)
				{
					this.element = new Control();
				}
				return this.element;
			},
			append: function(event, options)
			{
				var target = this.getTarget(event);

				/* Activate the smart control */
				this.control().setOptions(options).activate(target);
			},
			remove: function(event)
			{
				var target = this.getTarget(event);
				
				this.control().deactivate(target);	
			},
			getTarget: function(event)
			{
				if ($(event.target).is('li'))
				{
					return $(event.target);
				}
				else 
				{
					return $(event.target).parents('li:first');
				}
			}
			
		}
	})(),
	history: (function()
	{
		return {
			stack: new Array(),
		    temp: null,
		    saveState: function(item) 
		    {
		        this.temp = 
		        { 
		        	item: 		item, 
		        	itemParent: item.parent(), 
		        	itemAfter: 	item.prev() 
		        };
		    },
		    commit: function() 
		    {
		        if (this.temp != null) 
		        {
		        	this.stack.push(this.temp);
		        }
		    },
		    restoreState: function() 
		    {
		        var h = this.stack.pop();
		        
		        if (h == null) return;
		        
		        if (h.itemAfter.length > 0) 
		        {
		            h.itemAfter.after(h.item);
		        }
		        else 
		        {
		            h.itemParent.prepend(h.item);
		        }
		    }
		}
	})(),
	serialize: (function()
	{
		return {
			level:		1,
			sequence:	1,
			items:		[],
			serialize: function(tree)
			{
				this.level   = 1;
				this.sequence = 2;
				
				/* Process tree */
				tree.children().each(Core.delegate(this,this.boundaries,[this.level]));
			},
			boundaries: function(index, element, level )
			{
				var item = 
				{
					element: 	$(element),
					level: 		level++,
					left: 		this.sequence++,
					right: 		null,
					parent:     $(element).parents('li:first[id]').attr('id')
				}
				
				item.element.children('ol').children(':not(.ui-draggable-helper)').each(Core.delegate(this,this.boundaries,[level]));
				
				item.right = this.sequence++;
				
				this.items.push(item);
			}
		}
	})()
}