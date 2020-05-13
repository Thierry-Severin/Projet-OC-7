/* eslint-disable no-undef */
// Masque le formulaire d'ajout de restaurant présent dans une infowindow
$('.addNewRestaurantForm').hide();

// Au chargement de la page : choix de la géolocalisation ou non par l'utilisateur
window.onload = function(){
    position = new google.maps.LatLng(lat, lon);
    map = new CustomMap(lat, lon);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            map.center(lat, lon);
            map.setUserMarker(lat, lon);
            map.getRestaurantList();
        }, function() {
            alert('La position par défaut à été définie sur Paris.');
            map.center(lat, lon);
            map.setUserMarker(lat, lon);
            map.getRestaurantList();
        });
    } else {
        alert('La Géolocalisation n\'est pas disponible sur votre Navigateur.');
    }
    map.markerAtRightClick();
    map.getRestaurantWhenDragend();

    // Chargement du bouton pour l'ajout d'un commentaire
    $('#addCommentBtn').click(function() {
        addNewReview();
    });
};

// Recherche d'un restaurant via la navbar
$('#searchRestaurantByName').click(function() {
    map.getRestaurantWhenDragend();
    // Contenu de commentList caché
    removeRestaurantDetails();
    // Requete pour récupérer le restaurant via le son nom grâce à la barre de recherche
    map.getRestaurantByName();
});

// Recherche des restaurant via filtre de leur moyenne
$('#searchRestaurantByRate').click(function() {
    // Contenu de commentList caché
    removeRestaurantDetails();
    // retire les infowindow présents dans infoWindowList[]
    infoWindowClose(infoWindowList);
    // Récupère les restaurants dont la moyenne est comprise entre minValue & maxValue
    getRestaurantByRate();

    map.getRestaurantWhenDragend();
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
    map.getRestaurantWhenDragend();
});