/**
* Core.animation
* @version 1.0.0
*/
Core.define('Core.animation', Core.extend(
{
	options:
	{
		speed:  300,
		easing: 'linear'
	},
	animationQueue:[],
	listeners: 
	{
		complete: function(event, ui){}
	},
	init: function(options)
	{
		this.options = $.extend(true,{}, this.options, options);
	},
	queue: function(item, animation, callback)
	{
		this.animationQueue.push(
        {
        	item:	 	item,
        	callback:   callback,
        	animation:  $.extend(true, {}, animation)
        });
        
        return this;
	},
	reset: function()
	{
		this.animationQueue = [];
		
		return this;
	},
	animate: function()
	{
		for (i = 0; i < this.animationQueue.length; i++)
		{
			var callback = i == this.animationQueue.length - 1 ? this.listeners.complete: this.animationQueue[i].callback;
			
			this.animationQueue[i].item.animate(this.animationQueue[i].animation, this.options.speed, this.options.easing, callback);
		}
		
		/* Reset animation queue */
		this.reset();
	},
	addListener: function(listener, fn)
	{
		this.listeners[listener] = fn;
	}
}));