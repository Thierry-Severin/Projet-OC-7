class Map {
    constructor(map) {
        this.map = map;
        this.markerList = [];
        this.infowindow = null;
    }
    setMarker(restaurant) {
        // Génération d'un marker sur la position du restaurant
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(restaurant.getRestaurantLat(), restaurant.getRestaurantLong()),
            map: map,
            title: restaurant.getRestaurantName(),
        });
        markerList.push(marker);
    
        const contentString = `<h5>${restaurant.getRestaurantName()}</h5>${restaurant.getRestaurantAddress()}`;

        const infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        infoWindowList.push(infowindow);
        infowindow.open(map, marker);
    
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }
    removeMarkers() {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers.length = 0;
    }
    closeInfoWindowAfterSubmit() { 
        this.infowindow.close(this.map);
    }
}