var map = new L.Map('map', { center: new L.LatLng(51.505, -0.09), zoom: 9 }),
    osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

map.addLayer(new L.TileLayer(osmUrl));

//var data = [ 'M', 50, 50, 'L', 70, 70, 'h', '100', 'X' ],
var data = 'M100,200 C100,100 250,100 250,200S400,300 400,200',
    path = new L.CustomPath(data, { color: 'red', weight: 3 });
map.addLayer(path);