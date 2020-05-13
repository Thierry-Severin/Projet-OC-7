/* eslint-disable no-undef */
class CustomMap {
    constructor(latitude, longitude) {
        this._initMap(latitude, longitude);
        this.markerList = [];
        this.infowindow = null;
        this.infowindowList = [];
    }

    // Initialisation de la map
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

    // Recentrer la map d'après des coordonnées
    center(latitude, longitude) {
        this.map.setCenter(new google.maps.LatLng(latitude, longitude));
    }
    // Obtenir les coordonnées du centre de la map
    getCustomMapCenter() {
        return this.map.getCenter();
    }
    // Changer le zoom sur la map
    setCustomMapZoom(value) {
        this.map.setZoom(value);
    }
    // addListener de la map
    customMapAddListener(event) {
        this.map.addListener(event);
    }

    // Création d'un marker pour l'utilisateur
    setUserMarker(latitude, longitude) {
        this._setMarker(latitude, longitude, 'Votre position', '<h5>Vous êtes ici !</h5>', 'img/icon.png');
    }
    
    // Création d'un marker pour les restaurants
    setRestaurantMarker(restaurant) {
        const infoWindowContentString = `<h5>${restaurant.getRestaurantName()}</h5>${restaurant.getRestaurantAddress()}`;
        this._setMarker(
            restaurant.getRestaurantLat(),
            restaurant.getRestaurantLong(),
            restaurant.getRestaurantName(),
            infoWindowContentString
        );
    }
    
    // Création d'un marker
    _setMarker(latitude, longitude, title, infoWindowContentString, icon = undefined) {
        const markerData = {
            position: new google.maps.LatLng(latitude, longitude),
            map: this.map,
            title: title,
        };

        if (icon !== undefined) {
            markerData.icon = icon;
        }
        // Génération d'un marker sur la position du restaurant
        const marker = new google.maps.Marker(markerData);
        this.markerList.push(marker);
    
        const infowindow = new google.maps.InfoWindow({
            content: infoWindowContentString
        });
        this.infowindowList.push(infowindow);

        // Création de customMap pour référencer la class CustomMap dans l'addListener
        const customMap = this;
        marker.addListener('click', function() {
            customMap.infowindowList.forEach((infowindow) => infowindow.close(customMap.map));
            infowindow.open(customMap.map, marker);
        });
    }

    // Suppression de tout les markers de la map
    removeMarkers() {
        for (let i = 0; i < this.markerList.length; i++) {
            this.markerList[i].setMap(null);
        }
        this.markerList.length = 0;
    }


    // Récupération des restaurants via GooglePlaces
    getRestaurantList() {
        // Récupération des informations sur GooglePlaces
        const request = {
            location: this.map.getCenter(),
            radius: '500',
            type: ['restaurant']
        };
    
        const service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);
    
        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(function (restaurant) {

                    const newRestaurant = new Restaurant(
                        restaurant.name, 
                        restaurant.vicinity, 
                        restaurant.geometry.location.lat(), 
                        restaurant.geometry.location.lng(), 
                        restaurant.rating, 
                        restaurant.place_id,
                        []
                    );
                    restaurantList.push(newRestaurant);
                });

                createRestaurantList();
            }
        }
    }

    // Récupération des restaurants alentours
    getRestaurantNearby(position) {
        // Récupération des informations sur GooglePlaces
        const request = {
            location: position,
            radius: '1000',
            type: ['restaurant']
        };
        
        const service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);
        
        function callback(results, status) {
            restaurantList = [];
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(function (restaurant) {
                    const newRestaurant = new Restaurant(
                        restaurant.name, 
                        restaurant.vicinity, 
                        restaurant.geometry.location.lat(), 
                        restaurant.geometry.location.lng(), 
                        restaurant.rating, 
                        restaurant.place_id,
                        []
                    );
                    restaurantList.push(newRestaurant);
                    map.setRestaurantMarker(newRestaurant);
                });
                createRestaurantList();
            } else {
                document.getElementById('markerList').innerHTML = emptyRestaurantList();
                alert('Aucuns restaurants n\'à été trouvé dans cette zone.');
            }
        }
    }

    // Récupération des restaurants alentours après un déplacement sur la map
    getRestaurantWhenDragend() {
        this.map.addListener('dragend', function(){
            map.removeMarkers();
            position = map.getCustomMapCenter();
            map.center(position.lat(), position.lng());
            map.getRestaurantNearby(position);
            removeRestaurantDetails();
        });
    }

    // Recherche d'un restaurant par son nom et ajout dans restaurantList
    getRestaurantByName() {
        const restaurantSearched = document.getElementById('searchBar').value;
        
        if (restaurantSearched) {
            // Récupération des informations sur GooglePlaces
            const request = {
                query: restaurantSearched,
                fields: ['name', 'geometry', 'formatted_address', 'rating', 'place_id'],
                locationBias: map.getCustomMapCenter()
            };
            
            const service = new google.maps.places.PlacesService(this.map);
            
            service.findPlaceFromQuery(request, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const resultSearchedByName = results;
                    const existingRestaurant = restaurantList.find(restaurant => restaurant.place_id === resultSearchedByName[0].place_id);
                    if (existingRestaurant === undefined) {
                        resultSearchedByName.forEach(function(restaurant) {
                            const newRestaurant = new Restaurant(
                                restaurant.name,
                                restaurant.formatted_address,
                                restaurant.geometry.location.lat(),
                                restaurant.geometry.location.lng(),
                                restaurant.rating,
                                restaurant.place_id
                            );
                            map.removeMarkers();
                            map.setRestaurantMarker(newRestaurant);
                            restaurantList.unshift(newRestaurant);
                        });
                        createRestaurantList();
                        map.center(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    } else {
                        alert('Ce restaurant existe déjà dans la liste.');
                    }
                } else {
                    alert('Votre recherche ne retourne aucuns restaurants, désolé.');
                }
            });
        } else {
            alert('Veuillez saisir un restaurant à rechercher.');
        }
        document.getElementById('searchBar').value = '';
    }

    // Récupération des reviews via googlePlaces
    getGooglePlacesReviews(restaurant) {
        // Récupération des reviews de chaque restaurants sur GooglePlaces via restaurant.place_id
        const request = {
            placeId: restaurant.place_id,
            fields: ['review']
        };
    
        const service = new google.maps.places.PlacesService(this.map);
        service.getDetails(request, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let googlePlacesReviews = [];
                // Si un restaurant n'a pas de reviews, alors place.reviews === undefined
                if (place.reviews) {
                    googlePlacesReviews = place.reviews.map(function(review) {
                        return new Review(
                            review.author_name, 
                            review.rating, 
                            review.text
                        );
                    });
                }
    
                const restaurantCustomReviews = getCustomReviewsByRestaurantId(restaurant.id);
    
                const restaurantReviews = googlePlacesReviews.concat(restaurantCustomReviews);
                restaurant.setReviews(restaurantReviews);
                
                refreshRestaurantDetailsView(restaurant);
            } else {
                alert('Impossible de récupérer les reviews.', status);
            }
        });
    }

    // Création d'un marker special avec un formulaire pour créer un restaurant après un click droit
    setFormMarker(position, results) {
        const marker = new google.maps.Marker({
            position: position,
            map: this.map
        });
        markerList.push(marker);

        formattedAddress = results[0].formatted_address;
        latLngObj = position;

        document.getElementById('newAddress').innerHTML = formattedAddress;

        const form = $('.addNewRestaurantForm').clone().show();
        const infowindow_content = form[0];
        const infowindow = new google.maps.InfoWindow({
            content: infowindow_content
        });

        form.click(function(){
            $('#addRestaurantBtn').click(function() {
                createNewRestaurant();
                infowindow.close();
            });
        });

        infoWindowList.push(infowindow);
        infowindow.open(map, marker);
    }

    markerAtRightClick() {
        google.maps.event.addListener(this.map, 'rightclick', function(event) {
            map.removeMarkers();

            const location = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };
            geoCoder.geocode({'location': location}, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        map.setCustomMapZoom(15);
                        map.setFormMarker(location, results);
                    } else {
                        alert('Aucun résultat trouvé.');
                    }
                } else {
                    alert(`Geocoder failed due to: ${status}`);
                }
            });
        });
    }
}