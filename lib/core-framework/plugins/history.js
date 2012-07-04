/**
* Core.tree.history
* @version 1.0.0
*/
Core.define('Core.tree.history', Core.extend(
{
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
}));