class Map {
    constructor(latitude, longitude) {
        this.map = this._initMap(latitude, longitude);
        this.markerList = [];
        this.infowindow = null;
        this.infowindowList = [];
    }

    _initMap(latitude, longitude) {
        this.map = new google.maps.Map(document.getElementById('gMap'), {
            // Centre de la carte avec les coordonnées
            center: new google.maps.LatLng(latitude, longitude), 
            // Zoom par défaut
            zoom: 14, 
            // Type de carte (ici carte routière)
            mapTypeId: google.maps.MapTypeId.ROADMAP, 
            // Options de contrôle de la carte (plan, satellite...)
            mapTypeControl: true,
            // Nous désactivons la roulette de souris
            scrollwheel: false, 
            mapTypeControlOptions: {
                // Définit comment les options se placent
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR 
            },
            // Activation des options de navigation dans la carte (zoom...)
            navigationControl: true, 
            navigationControlOptions: {
                // Affichage des options
                style: google.maps.NavigationControlStyle.ZOOM_PAN 
            }
        });
    }

    center(latitude, longitude) {
        this.map.setCenter(new google.maps.LatLng(latitude, longitude));
    }

    setUserMarker(latitude, longitude) {
        this._setMarker(latitude, longitude, 'Votre position', '<h5>Vous êtes ici !</h5>', 'img/icon.png');
    }
    
    setRestaurantMarker(restaurant) {
        const infoWindowContentString = `<h5>${restaurant.getRestaurantName()}</h5>${restaurant.getRestaurantAddress()}`;
        this._setMarker(
            restaurant.getRestaurantLat(),
            restaurant.getRestaurantLong(),
            restaurant.getRestaurantName(),
            infoWindowContentString
        );
    }
    
    _setMarker(latitude, longitude, title, infoWindowContentString, icon = undefined) {
        const markerData = {
            position: new google.maps.LatLng(latitude, longitude),
            map: this.map,
            title: title,
        };

        if (icon != undefined) {
            markerData.icon = icon;
        }

        // Génération d'un marker sur la position du restaurant
        const marker = new google.maps.Marker(markerData);
        this.markerList.push(marker);
    
        const infowindow = new google.maps.InfoWindow({
            content: infoWindowContentString
        });
        this.infowindowList.push(infowindow);
        infowindow.open(this.map, marker);
    
        marker.addListener('click', showInfowindow(infowindow, marker));
    }

    showInfowindow(infowindow, marker) {
        return function () {
            this.infowindowList.forEach((infowindow) => infowindow.close(this.map));
            infowindow.open(this.map, marker);
        };
    }

    removeMarkers() {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers.length = 0;
    }
}