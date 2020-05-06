// Masque le formulaire d'ajout de restaurant présent dans une infowindow
$('.addNewRestaurantForm').hide();

// Au chargement de la page : choix de la géolocalisation ou non par l'utilisateur
window.onload = function(){
    Gmap = initMap();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            Gmap.setCenter(new google.maps.LatLng(lat, lon));
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lon),
                map: Gmap,
                title: 'Votre position',
                icon: 'img/icon.png'
            });
            markerList.push(marker);
            const contentString = '<h5>Vous êtes ici</h5>';
            const infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            marker.addListener('click', function() {
                infowindow.open(Gmap, marker);
            });
            infoWindowList.push(infowindow);
            getRestaurantList();
        }, function() {
            alert('La position par défaut à été définie sur Paris.');
            Gmap.setCenter(new google.maps.LatLng(lat, lon));
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lon),
                map: Gmap,
                title: 'Votre position',
                icon: 'img/icon.png'
            });
            markerList.push(marker);
            const contentString = '<h5>Vous êtes ici</h5>';
            const infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            marker.addListener('click', function() {
                infowindow.open(Gmap, marker);
            });
            infoWindowList.push(infowindow);
            getRestaurantList();
        });
    } else {
        alert('La Géolocalisation n\'est pas disponible sur votre Navigateur.');
    }

    // Chargement du bouton pour l'ajout d'un commentaire
    $('#addCommentBtn').click(function() {
        addNewReview();
    });
};

// Recherche d'un restaurant via la navbar
$('#searchRestaurant').click(function() {
    const restaurantSearched = document.getElementById('searchBar').value;
    
    if (restaurantSearched) {
        // Récupération des informations sur GooglePlaces
        const request = {
            query: restaurantSearched,
            fields: ['name', 'geometry', 'formatted_address', 'rating', 'place_id'],
        };
        
        const service = new google.maps.places.PlacesService(Gmap);
        
        service.findPlaceFromQuery(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('searchRestaurant result:', results);

                const resultSearchedByName = results;
                if (resultSearchedByName === undefined) {
                    alert('Votre recherche ne retourne aucuns restaurants, désolé.');
                }
    
                resultSearchedByName.forEach(function(restaurant) {
                    const newRestaurant = new Restaurant(
                        restaurant.name,
                        restaurant.formatted_address,
                        restaurant.geometry.location.lat,
                        restaurant.geometry.location.lng,
                        restaurant.rating,
                        restaurant.place_id
                    );
                    const marker = new google.maps.Marker({
                        position: restaurant.geometry.location,
                        map: Gmap
                    });
                    markerList.push(marker);
                
                    const contentString = `<h5>${restaurant.name}</h5>${restaurant.formatted_address}`;
                
                    const infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });
    
                    marker.addListener('click', function() {
                        infowindow.open(Gmap, marker);
                    });
                    
                    infoWindowList.push(infowindow);
    
                    restaurantList.unshift(newRestaurant);
                });
    
                createRestaurantList();
                Gmap.setCenter(results[0].geometry.location);
            }
        });
    } else {
        alert('Veuillez saisir un restaurant à rechercher.');
    }
    document.getElementById('searchBar').value = '';
});

// Recherche des restaurant via filtre de leur moyenne
$('#search').click(function() {
    // reinitialisation de la map
    Gmap = initMap();
    // reinitialisation de restaurantListDom pour vider la liste
    let restaurantListDom = '';
    // retire les infowindow présents dans infoWindowList[]
    infoWindowClose(infoWindowList);
    // Créé un marker sur la map à chaque click
    markerAtClick();

    // On récupère la valeur min & max des moyennes pour effetuer une recherche
    const minValue = document.getElementById('minValue').value;
    const maxValue = document.getElementById('maxValue').value;
    let resultSearchByRate = [];
    
    if (minValue > maxValue) {
        alert('La valeur minimale doit être inferieur à la valeur maximal pour votre recherche.');
    } else {
        // resultSearchByRate = tout les restaurants ayant une moyenne entre minValue et maxValue
        resultSearchByRate = restaurantList.filter(restaurant => 
            restaurant.getRestaurantRating() >= minValue && restaurant.getRestaurantRating() <= maxValue);

        for (let i = 0; i < resultSearchByRate.length; i++) {
            const restaurant = resultSearchByRate[i];
            restaurantListDom += createRestaurantDom(restaurant);
        }
    
        document.getElementById('markerList').innerHTML = restaurantListDom;

        // Pour chaque restaurant on créé un marker
        resultSearchByRate.forEach(function(restaurant){
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(restaurant.getRestaurantLat(), restaurant.getRestaurantLong()),
                map: Gmap,
                title: restaurant.getRestaurantName(),
            });
            markerList.push(marker);

            const contentString = `<h5>${restaurant.getRestaurantName()}</h5>${restaurant.getRestaurantAddress()}`;

            const infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infoWindowList.push(infowindow);

            marker.addListener('click', function() {
                infowindow.open(Gmap, marker);
            });
        });
    }
});

// Lors du clic sur un restaurant de la liste - affichage de plus d'informations
$('#markerList').on('click','li.liElement', function() {
    const idLiElement = this.getAttribute('id');
    const restaurantMatched = getRestaurantById(idLiElement);
    selectedRestaurant = restaurantMatched;

    initMarkerForRestaurant(restaurantMatched);

    initRestaurantDetails(restaurantMatched);
});