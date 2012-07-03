L.CustomPath = L.Path.extend({
    initialize: function(data, options) {
        L.Path.prototype.initialize.call(this, options);
        this._customData = data;
    },

    getPathString: function() {
        return this._customData instanceof Array ? this._customData.join(' ') : this._customData;
    }
});