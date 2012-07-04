L.CustomPath = L.Path.extend({
    initialize: function(data, options) {
        L.Path.prototype.initialize.call(this, options);
        this._customData = data;
    },

    getPathString: function() {
        return this._customData instanceof Array ? this._customData.join(' ') : this._customData;
    },

    parse: function(data) {
        var parsed = [],
            command,
            coords = [],
            addCommand = function() {
                parsed.push([command, coords]);
            };

        data.split(/[ ,]/).forEach(function(item) {
            var found,
                parseNum = function(str) {
                    return Math.round(parseFloat(str));
                };
            
            found = item.match(/^([a-zA-Z])([0-9]*)/);
            if (found && found[1]) {
                if (command) {
                    addCommand();
                }

                command = found[1];
                coords = [ parseNum(found[2]) ];
                return;
            }

            found = parseNum(item);
            if (!isNaN(found)) {
                coords.push(parseNum(found));
                return;
            }
        });

        if (command) {
            addCommand();
        }

        return parsed;
    },

    convertPath: function(pathData) {
        var asString = typeof pathData === typeof '',
            data = asString ? this.parse(pathData) : pathData,
            vmlData = [],
            i, j, command, temp,
            commands = {
                M: 'm',
                x: function(coords) { return ['x2vml', coords]; },
                L: 'l',
                l: 'r',
                H: function(coords) { return ['H2vml', coords]; },
                h: function(coords) { return ['h2vml', coords]; },
                V: function(coords) { return ['V2vml', coords]; },
                v: function(coords) { return ['v2vml', coords]; },
                Z: 'x',
                z: 'x',
                C: 'c',
                c: 'v'
        };

        data.forEach(function(item) {
            command = commands[item[0]];
            coords = item[1];

            vmlData.push(typeof command === 'function' ? command(coords) : [ command, coords ]);
        });



        return asString ? vmlData.join(' ') : vmlData;
    }
});