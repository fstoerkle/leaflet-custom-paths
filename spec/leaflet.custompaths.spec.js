


describe("Leaflet Plugin CustomPath", function() {
    var emptyPath;

    function svg2vml(svg, vml) {
        expect(emptyPath.convertToVml(svg)).toEqual(vml);
    }

    function type(obj) {
       return Object.prototype.toString.call(obj);
    }

    beforeEach(function() {
        emptyPath = new L.CustomPath();
    });

    describe("parse()", function() {
        it("returns an array", function() {
            expect(type(emptyPath.parse(''))).toEqual(type([]));
        });

        it("parses data successfully", function() {
            var data = '   M19,29       l100,,,, 200 3,0 m 27 92 K,  102 10    ',
                parsedData = [
                    [ 'M', [19, 29] ],
                    [ 'l', [100, 200, 3, 0] ],
                    [ 'm', [27, 92] ],
                    [ 'K', [102, 10] ] ];
            expect(emptyPath.parse(data)).toEqual(parsedData);
        });
    });

    
    describe("convertPath()", function() {
        it("keeps the type", function() {
            [ [], '' ].forEach(function(input) {
                var output = emptyPath.convertToVml(input);
                expect(type(output)).toEqual(type(input));
            });
        });

        it("converts absolute moveto", function() {
            svg2vml('M 19,29 M 30,40', 'm 19 29 m 30 40');
        });

        it("converts relative moveto", function() {
            svg2vml('m 19,29', 'm 19 29');
            svg2vml('m 19,29 m 100,23', 'm 19 29 m 119 52');
        });

        it("converts absolute lineto", function() {
            svg2vml('L 19,29 L 283,13', 'l 19 29 l 283 13');
        });

        it("converts relative lineto", function() {
            svg2vml('l 19,29 l 283,13', 'r 19 29 r 283 13');
        });

        it("converts close", function() {
            svg2vml('m 19,29 z', 'm 19 29 x');
            svg2vml('m 19,29 Z', 'm 19 29 x');
        });

        it("converts mixed absolute and relative moveto/lineto commands", function() {
             svg2vml('M 20,30 l 70,45', 'm 20 30 r 70 45');
             svg2vml('M 20,30 m 100,30 l 70,45', 'm 20 30 m 120 60 r 70 45');
             svg2vml('m 20,30 m 100,30 m 82,91 M 10,30', 'm 20 30 m 120 60 m 202 151 m 10 30');
        });
    });
});