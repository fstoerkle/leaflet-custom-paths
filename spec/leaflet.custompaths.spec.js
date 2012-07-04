
function toTypeString(obj) {
    return Object.prototype.toString.call(obj);
}

describe("CustomPath's convertPath", function() {
    var emptyPath, data;

    beforeEach(function() {
        emptyPath = new L.CustomPath();
        data = 'M19,29 l100 200 3,0';
    });

    it("returns an array on parsing", function() {
        expect(toTypeString(emptyPath.parse(''))).toEqual(toTypeString([]));
    });

    it("parses path data successfully", function() {
        var parsedData = [ [ 'M', [19, 29]], [ 'l', [100, 200, 3, 0] ] ];
        expect(emptyPath.parse(data)).toEqual(parsedData);
    });

    it("keeps the type", function() {
        [ [], '' ].forEach(function(input) {
            var output = emptyPath.convertPath(input);
            expect(toTypeString(output)).toEqual(toTypeString(input));
        });
    });

    it("converts svg to vml commands", function() {
        var vmlData = 'm 19 29 r 100 200 3 0';
        expect(emptyPath.convertPath(data)).toEqual(vmlData);
    });


});