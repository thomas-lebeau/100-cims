const fs = require('fs');
const data = JSON.parse(fs.readFileSync(__dirname + '/cims.json', 'utf8'));

// {
//   name: 'la Miranda de Terranyes',
//   url: 'https://www.feec.cat/activitats/100-cims/cim/la-miranda-de-terranyes/',
//   img: null,
//   comarca: 'Terra Alta',
//   altitude: '1193',
//   latitude: '40.835005',
//   longitude: '0.280338',
//   essencial: false
// },

// {
//   "type": "FeatureCollection",
//   "features": [
//     {
//       "type": "Feature",
//       "properties": {
//         "comarca": " Conflent, Ripollès",
//         "marker-color": "#3cc83e",
//         "marker-size": "medium",
//         "marker-symbol": "mountain",
//         "altitude": 2881
//       },
//       "geometry": {
//         "coordinates": [
//           2.2328618189,
//           42.4262224049
//         ],
//         "type": "Point"
//       },
//       "id": 0
//     }
//   ]
// }

const geoJson = {
  type: 'FeatureCollection',
  features: data.map((cim, i) => ({
    type: 'Feature',
    properties: {
      'marker-color': cim.essencial ? '#3cc83e' : '#ff0000',
      'marker-size': 'medium',
      'marker-symbol': 'mountain',
      'name': cim.name,
      'url': cim.url,
      'img': cim.img,
      'comarca': cim.comarca,
      'altitude': cim.altitude,
    },
    geometry: {
      coordinates: [+cim.longitude, +cim.latitude],
      type: 'Point',
    },
    id: i,
  })),
};

fs.writeFileSync('cims.geojson', JSON.stringify(geoJson, null, 2));
