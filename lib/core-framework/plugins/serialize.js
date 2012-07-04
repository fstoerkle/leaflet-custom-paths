/**
* Core.tree.serialize
* @version 1.0.0
*/
Core.define('Core.tree.serialize', Core.data.extend(
{
	level:		1,
	sequence:	1,
	items:		[],
	serialize: function(tree)
	{
		this.level   = 1;
		this.sequence = 2;
		
		/* Process tree */
		tree.children().each(this.delegate(this,this.boundaries,[this.level]));
		
		$.each(this.items, function(index, item)
		{
			item.element.find('a:first span').html(item.level + '/' + item.left + ':' + item.right);
		});
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
		
		item.element.children('ol').children(':not(.ui-draggable-helper)').each(this.delegate(this,this.boundaries,[level]));
		
		item.right = this.sequence++;
		
		this.items.push(item);
	}
}));