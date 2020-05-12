// Masque le formulaire d'ajout de restaurant présent dans une infowindow
$('.addNewRestaurantForm').hide();

// Au chargement de la page : choix de la géolocalisation ou non par l'utilisateur
window.onload = function(){
    position = new google.maps.LatLng(lat, lon);
    gMap = initMap ? initMap() : null;
    map = new CustomMap(lat, lon, gMap);

    if (navigator.geolocation && gMap) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            map.center(lat, lon);
            map.setUserMarker(lat, lon);
            getRestaurantList();
        }, function() {
            alert('La position par défaut à été définie sur Paris.');
            map.center(lat, lon);
            map.setUserMarker(lat, lon);
            getRestaurantList();
        });
    } else {
        alert('La Géolocalisation n\'est pas disponible sur votre Navigateur.');
    }
    
    getRestaurantWhenDragend();

    // Chargement du bouton pour l'ajout d'un commentaire
    $('#addCommentBtn').click(function() {
        addNewReview();
    });
};

// Recherche d'un restaurant via la navbar
$('#searchRestaurantByName').click(function() {
    getRestaurantWhenDragend();
    // Contenu de commentList caché
    removeRestaurantDetails();
    // Requete pour récupérer le restaurant via le son nom grâce à la barre de recherche
    getRestaurantByName();
});

// Recherche des restaurant via filtre de leur moyenne
$('#searchRestaurantByRate').click(function() {
    // reinitialisation de la map
    gMap = initMap();
    // Contenu de commentList caché
    removeRestaurantDetails();
    // retire les infowindow présents dans infoWindowList[]
    infoWindowClose(infoWindowList);
    // Créé un marker sur la map à chaque click
    markerAtClick();
    // Récupère les restaurants dont la moyenne est comprise entre minValue & maxValue
    getRestaurantByRate();

    getRestaurantWhenDragend();
});

// Lors du clic sur un restaurant de la liste - affichage de plus d'informations
$('#markerList').on('click','li.liElement', function() {
    const idLiElement = this.getAttribute('id');
    if (idLiElement !== 'noRestaurantFound') {
        const restaurantMatched = getRestaurantById(idLiElement);
        selectedRestaurant = restaurantMatched;
    
        initMarkerForRestaurant(restaurantMatched);
    
        initRestaurantDetails(restaurantMatched);
    }
    getRestaurantWhenDragend();
});