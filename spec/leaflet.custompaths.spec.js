
function toTypeString(obj) {
    return Object.prototype.toString.call(obj);
}

describe("Leaflet Plugin CustomPath", function() {
    var emptyPath, data;

    function svg2vml(svg, vml) {
        expect(emptyPath.convertPath(svg)).toEqual(vml);
    }

    beforeEach(function() {
        emptyPath = new L.CustomPath();
        data = 'M19,29 l100 200 3,0 m 27 92 K,  102 10';
    });

    describe("parse()", function() {
        it("returns an array", function() {
            expect(toTypeString(emptyPath.parse(''))).toEqual(toTypeString([]));
        });

        it("parses data successfully", function() {
            var parsedData = [ [ 'M', [19, 29] ], [ 'l', [100, 200, 3, 0] ], [ 'm', [27, 92] ], [ 'K', [102, 10] ] ];
            expect(emptyPath.parse(data)).toEqual(parsedData);
        });
    });

    
    describe("convertPath()", function() {
        it("keeps the type", function() {
            [ [], '' ].forEach(function(input) {
                var output = emptyPath.convertPath(input);
                expect(toTypeString(output)).toEqual(toTypeString(input));
            });
        });

        it("converts absolute moveto", function() {
            svg2vml('M 19 29', 'm 19 29');
        });

        it("converts relative moveto", function() {
            svg2vml('m 19 29', 'm 19 29');
            svg2vml('m 19 29 m 100 23', 'm 19 29 m 119 52');
        });
    });
});