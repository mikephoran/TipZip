var map, infoWindow, service, type, searchterm;

function initialize() {
  type = $('title').text();
  searchterm = $('#searchterm').text();

  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: new google.maps.LatLng(43.661165, -79.390919),
    zoom: 12,
    styles: [
      {
        stylers: [
          { visibility: 'simplified' }
        ]
      },
      {
        elementType: 'labels',
        stylers: [
          { visibility: 'off' }
        ]
      }
    ]
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
  google.maps.event.addListenerOnce(map, 'bounds_changed', performSearch);
}

function performSearch() {
  var request = {
    bounds: map.getBounds(),
    keyword: searchterm
  };
  service.radarSearch(request, callback);
}

function callback(results, status) {
  if (status != google.maps.places.PlacesServiceStatus.OK) {
    alert(status);
    return;
  }
  
  makeCall(results, 0);

  for (var i = 0, result; result = results[i]; i++) {
    createMarker(result);
  }
}

function makeCall(results, i) {
  var selected = results[i] 
    
  service.getDetails(selected, function(result, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
      alert(status);
      return;
    }

    //Process details
    console.log(result);
    var obj = {
      type: JSON.stringify(type),
      result: JSON.stringify(result)
    };
    
    $.ajax({
      method: 'POST',
      url: 'http://management.app.dev:5000/populate',
      data: obj
    })
    .success(function(res) {
      console.log('Success:', res);
    });

    //Increment array and request details for next place
    i++;
    if (results[i]) {
      setTimeout(makeCall.bind(this, results, i), 2000);
    } else {
      console.log('FINISHED PULLING DATA')
    }
  });
}
  
function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
      fillColor: '#ffff00',
      fillOpacity: 1,
      scale: 1/4, 
      strokeColor: '#bd8d2c',
      strokeWeight: 1
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);