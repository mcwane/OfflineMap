'use strict';

var StorageTileLayer = L.TileLayer.extend({
    _setUpTile: function (tile, value) {
        tile._layer = this;
        tile.onload = this._tileOnLoad;
        tile.onerror = this._tileOnError;
        tile.src = value;

        this.fire('tileloadstart', {
            tile: tile,
            url: tile.src
        });
    },

    _loadTile: function (tile, tilePoint) {
        this._adjustTilePoint(tilePoint);
        var key = tilePoint.z + ',' + tilePoint.x + ',' + tilePoint.y;
        var self = this;
        if (this.options.storage) {
            this.options.storage.get(key, function (err, value) {
                if (value) {
                    self._setUpTile(tile, value.v);
                } else {
		     var tileurl=self.getTileUrl(tilePoint);
                    self._setUpTile(tile,tileurl);
		    ajax(tileurl, 'blob', function (response) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        db.put({_id: key, v: e.target.result});
                    };
                    reader.readAsDataURL(response);
                });
                }
            });
        } else {
            self._setUpTile(tile, self.getTileUrl(tilePoint));
        }
    }
});

var Control = L.Control.extend({
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.innerHTML = '<a href="#" class="leaflet-control-zoom-in">' + this.options.innerHTML + '</a>';
        L.DomEvent
            .on(container, 'click', L.DomEvent.stopPropagation)
            .on(container, 'click', L.DomEvent.preventDefault)
            .on(container, 'click', this.options.handler, map)
            .on(container, 'dblclick', L.DomEvent.stopPropagation);
        return container;
    }
});

var ajax = function (src, responseType, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.responseType = responseType || 'text';
    xhr.onload = function(err) {
        if (this.status == 200) {
            callback(this.response);
        }
    };
    xhr.send();
};

var dbname = 'tile';
var db = new PouchDB(dbname);
var map = L.map('map').setView([34.730539, -86.586181], 12);
//new StorageTileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {storage: db}).addTo(map);
//https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png

var tileServiceURL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';

var mapBoxServiceURL = 'https://{s}.tiles.mapbox.com/v4/examples.map-i87786ca/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnJhbXByYWthc2gxIiwiYSI6IjdlM2M3OTVjMmRlMTk4Mjk5NTkyMjQzNTVkMTNhZWQ5In0.d4GvTDZvO4orrpxks1zLgw'

new StorageTileLayer(mapBoxServiceURL, {storage: db}).addTo(map);
/*
map.addControl(new Control({position: 'topleft', innerHTML: 'C', handler: function () {
    ajax('cache_keys.json', 'text', function (response) {
        var tile_key_list = JSON.parse(response);
        for (var i = 0, l = tile_key_list.length; i < l; i++) {
            (function (key) {
	      //"http://api.tiles.mapbox.com/v4/examples.map-i87786ca/0/0/0.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q
                //var src = 'http://tiles.mapbox.com/' + key.split(',').join('/') + '.png';
                //var src = 'http://api.tiles.mapbox.com/v4/examples.map-i87786ca/' + key.split(',').join('/') + '.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';
                var src = 'http://tile.osm.org/' + key.split(',').join('/') + '.png';

                console.log('TEST LOCATON'+src);
                ajax(src, 'blob', function (response) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        db.put({_id: key, v: e.target.result});
                    };
                    reader.readAsDataURL(response);
                });
            })(tile_key_list[i]);
        }
    });
}}));*/

map.addControl(new Control({position: 'topleft', innerHTML: 'D', handler: function () {
    PouchDB.destroy(dbname, function (err, value) {
        if (!err) {
            db = new PouchDB(db);
        }
    });
}}));