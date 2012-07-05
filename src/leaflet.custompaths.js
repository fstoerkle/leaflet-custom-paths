L.CustomPath = L.Path.extend({
    ABSOLUTE: 'absolute',
    RELATIVE: 'relative',

    initialize: function(data, options) {
        L.Path.prototype.initialize.call(this, options);
        this._customData = data;

        this._x = 0;
        this._y = 0;
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
                coords = found[2] === '' ? [] : [ parseNum(found[2]) ];
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
        var self = this,
            asString = (typeof pathData === typeof ''),
            vmlData = [],
            commands = {
                M: { name: 'm' },
                m: { name: 'm', convert: true },
                L: { name: 'l' },
                l: { name: 'r' },
                H: function(coords) { return ['H2vml', coords]; },
                h: function(coords) { return ['h2vml', coords]; },
                V: function(coords) { return ['V2vml', coords]; },
                v: function(coords) { return ['v2vml', coords]; },
                Z: { name: 'x' },
                z: { name: 'x', convert: true },
                C: { name: 'c' },
                c: { name: 'v' } },
            currentPoint = { x: 0, y: 0 };

        (asString ? this.parse(pathData) : pathData).forEach(function(item) {
            var command = commands[item[0]],
                coords = item[1],
                isRelative = command.name === command.name.toLowerCase(),
                i;

            if (isRelative) {
                // relative coordinates
                if (command.convert) {
                    for(i=0; i<coords.length; ++i) {
                        coords[i] += currentPoint.x;
                        coords[++i] += currentPoint.y;
                    }
                }

                currentPoint = self.fromCoords(coords, function(old, next) { return old+next; }, currentPoint);
            } else {
                // absolute coordinates
                currentPoint = self.fromCoords(coords, function(old, next) { return next; }, currentPoint);
            }

            vmlData.push(command.name);
            coords.forEach(function(c) { vmlData.push(c); });
        });

        return asString ? vmlData.join(' ') : vmlData;
    },

    fromCoords: function(coords, compute, p) {
        for(var i=0; i<coords.length; ++i) {
            p.x = compute(p.x, coords[i]);
            p.y = compute(p.y, coords[++i]);
        }

        return p;
    }
});