// Masque le formulaire d'ajout de restaurant présent dans une infowindow
$('.addNewRestaurantForm').hide();

// Variables Globales
const GOOGLE_KEY = 'AIzaSyAdRLMuV1SShGeWaJw81FdroiSA4M7DO-0';
//Latitude et longitude de Paris (centre de la carte)
let lat = 48.856614;
let lon = 2.3522219;
// Array créé pour stocker les {Restaurant} créés d'après resultList
const restaurantList = [];
// Ajout de chaque infowindow dans cet array
const infoWindowList = [];
// Ajout de chaque marker dans cet array
const markerList = [];
// Contient la map après initialisation
let Gmap = undefined;
// Initialisation de GeoCoder
const geoCoder = initGeoCoder();
// LatLng convertit en address lisible une fois valorisé
let formattedAddress = '';
// Lat & Lng d'un marker placé manuellement une fois valorisé
let latLngObj= '';
// liste des reviews saisies sur le site
const customReviews = [];
// Restaurant clické par l'utilisateur dans la liste
let selectedRestaurant;

// Objet Restaurant
class Restaurant {
    constructor(restaurantName, address, lat, long, rating, place_id, reviews) {
        this.id = JSON.stringify(Math.floor(Math.random() * (999999 - 1 + 1)) + 1);
        this.restaurantName = restaurantName;
        this.address = address;
        this.lat = lat;
        this.long = long;
        this.rating = rating;
        this.place_id = place_id;
        this.reviews = reviews;
    }
    // Methodes
    getId() {
        return this.id;
    }
    getRestaurantName() {
        return this.restaurantName;
    }
    setRestaurantName(restaurantName) {
        this.restaurantName = restaurantName;
    }
    getRestaurantAddress() {
        return this.address;
    }
    getRestaurantLat() {
        return this.lat;
    }
    getRestaurantLong() {
        return this.long;
    }
    getRestaurantRating() {
        return this.rating;
    }
    setRestaurantRating(rating) {
        this.rating = rating;
    }
    getReviews() {
        return this.reviews;
    }
    setReviews(reviews) {
        this.reviews = reviews;
    }
    getPlace_id() {
        return this.place_id;
    }
}

// Objet Review
class Review {
    constructor(author, rate, comment) {
        this.author = author;
        this.rate = rate;
        this.comment = comment;
    }
}

class CustomReview extends Review {
    constructor(author, rate, comment, restaurantId) {
        super(author, rate, comment);
        this.restaurantId = restaurantId;
    }
}

// Fonction d'initialisation de la carte
function initMap() {
    return new google.maps.Map(document.getElementById('gMap'), {
        // Centre de la carte avec les coordonnées
        center: new google.maps.LatLng(lat, lon), 
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

// Initialisation de GeoCoder
function initGeoCoder() {
    return new google.maps.Geocoder();
}

// Création de la liste des restaurants
function createRestaurantDom(restaurant) {
    return `<li id='${restaurant.getId()}' class='list-group-item liElement'>
                <h5>${restaurant.getRestaurantName()}</h5>
                <p>
                    ${restaurant.getRestaurantAddress()}<br>
                    Moyenne : ${restaurant.getRestaurantRating()} <i class='fas fa-star'></i>
                </p>
            </li>`;
}

// Obtenir l'image GoogleStreetView
function getStreetViewImage(restaurant) {
    const IMG_WIDTH = 350;
    const IMG_HEIGHT = 150;
    const fov = 75;
    const address = `${restaurant.getRestaurantName()},${restaurant.getRestaurantAddress()}`;
    return `<a href='https://www.google.fr/maps/place/${restaurant.getRestaurantAddress()}' target='_blank'>
    <img src="https://maps.googleapis.com/maps/api/streetview?size=${IMG_WIDTH}x${IMG_HEIGHT}&location=${address}&fov=${fov}&key=${GOOGLE_KEY}"/></a>`;
}

// Ferme les infowindow dans infoWindowList[]
// MARCHE PAS lors d'un clic sur un autre marker !!!
function infoWindowClose(infoWindowList) {
    markerList.forEach(function(marker) {
        marker.addListener('click', function() {
            infoWindowList.forEach(function(infowindow) {
                infowindow.close();
            });
        });
    });
}

// Retire tout les marker de la map
function markerClose(markerList) {
    markerList.forEach(function(marker) {
        marker.setMap(null);
    });
}

// Récupère lat et lng sur la map et créé un marker avec ces coordonnées
function markerAtClick() {
    google.maps.event.addListener(Gmap, 'click', function(event) {
        markerClose(markerList);
        geoCoder.geocode({'location': event.latLng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    Gmap.setZoom(15);
                    const marker = new google.maps.Marker({
                        position: event.latLng,
                        map: Gmap
                    });
                    markerList.push(marker);

                    formattedAddress = results[0].formatted_address;
                    latLngObj = event.latLng;

                    document.getElementById('newAddress').innerHTML = formattedAddress;

                    const form = $('.addNewRestaurantForm').clone().show();
                    const infowindow_content = form[0];
                    const infowindow = new google.maps.InfoWindow({
                        content: infowindow_content
                    });

                    form.click(function(){
                        $('#addRestaurantBtn').click(function() {
                            createNewRestaurant(restaurantList);
                        });
                    });

                    infowindow.open(Gmap, marker);
                    infoWindowList.push(infowindow);
                } else {
                    alert('Aucun résultat trouvé.');
                }
            } else {
                alert(`Geocoder failed due to: ${status}`);
            }
        });
    });
}

// Créé un nouveau restaurant d'après un marker posé manuellement
function createNewRestaurant() {
    const newRestaurantName = document.getElementById('newRestaurantName').value;

    const existingRestaurantName = restaurantList.find(restaurant => restaurant.getRestaurantName() === newRestaurantName);
    const existingRestaurantAddress = restaurantList.find(restaurant => restaurant.getRestaurantAddress() === formattedAddress);

    if (existingRestaurantName || existingRestaurantAddress) {
        alert('Ce restaurant existe déjà dans la liste !');
    } else {
        const newRestaurant = new Restaurant(
            newRestaurantName,
            formattedAddress,
            latLngObj.lat(),
            latLngObj.lng(),
            0,
            'N/A',
            'N/A'
        );
        const noReviews = [{
            author: 'N/A',
            rate: 'N/A',
            comment: 'N/A'
        }];
        newRestaurant.setReviews(noReviews);
        restaurantList.unshift(newRestaurant);
        createRestaurantList();
    }
}

// Calcul de la moyenne d'un restaurant + ajout de l'attribut Rates dans chaque restaurant présent dans restaurantList
function createRestaurantList() {
    let restaurantListHtml = '';

    restaurantList.forEach(function(restaurant) {
        restaurantListHtml += createRestaurantDom(restaurant);
    });

    document.getElementById('markerList').innerHTML = restaurantListHtml;
}

// Met à jour les infos d'un restaurant
function refreshRestaurantDetailsView(restaurantMatched) {
    document.getElementById('rateList').innerHTML = buildRestaurantDetails(restaurantMatched);
}

// Mise en forme des avis
function getRestaurantReviews(restaurantMatched) {
    if (restaurantMatched.reviews.length === 0 || restaurantMatched.reviews.author === 'N/A') {
        return 'Aucun commentaire disponible.';
    } else {
        return restaurantMatched.reviews.map(function(review) {
            return `<h6><i><u>${review.author}</u></i></h6>
            <u>Note :</u> ${review.rate} 
            <i class='fas fa-star'></i>
            <br>
            <u>Avis :</u> ${review.comment}`;
        }).join('<br><br>');
    }
}

// Mise en place des informations d'un restaurant
function buildRestaurantDetails(restaurantMatched) {
    return `<div class='commentList'>
                ${getStreetViewImage(restaurantMatched)}
                <h4>${restaurantMatched.getRestaurantName()}</h4>
                ${restaurantMatched.getRestaurantAddress()}
                <br>Moyenne : ${restaurantMatched.getRestaurantRating()} <i class='fas fa-star'></i>
                <br>
                <br>
                <p id='comments'>
                    ${getRestaurantReviews(restaurantMatched)}
                </p>
                <br>
                <button type='button'
                        class='btn btn-outline-primary col-lg-6'
                        data-toggle='modal'
                        data-target='#addCommentModal'>
                        Ajouter un commentaire
                </button>
            </div>`;
}

// Ajout d'un commentaire
function addNewReview() {

    const newAuthor = document.getElementById('newAuthor').value;
    const newRate = parseInt(document.getElementById('newRate').value);
    const newComment = document.getElementById('newComment').value;
    if (newAuthor && newComment) {
        const newReview = new CustomReview(
            newAuthor,
            newRate,
            newComment,
            selectedRestaurant.getId()
        );
        customReviews.push(newReview);
        selectedRestaurant.reviews.push(newReview);
        
        const rateAvg = refreshRateAverage(selectedRestaurant);
        selectedRestaurant.setRestaurantRating(rateAvg);
        document.getElementById('comments').innerHTML = getRestaurantReviews(selectedRestaurant);
        $('#addCommentModal').modal('hide');
        // Reset de l'input
        document.getElementById('newAuthor').value = '';
        document.getElementById('newComment').value = '';
        refreshRestaurantDetailsView(selectedRestaurant);
        createRestaurantList();
    } else {
        alert('Veuillez remplir tout les champs avant de poster votre commentaire.');
    }
}

function refreshRateAverage(restaurantMatched) {
    // Recalcul de restaurant.rates - Mise à jour de la moyenne du restaurant
    let rateSum = 0;
    let rateAvg = 0;
    restaurantMatched.reviews.forEach(function(review) {
        rateSum += review.rate;
        rateAvg = rateSum / restaurantMatched.reviews.length;
    });
    return rateAvg.toFixed(1);
}

function getRestaurantById(id) {
    return restaurantList.find(restaurant => restaurant.getId() === id);
}

function initMarkerForRestaurant(restaurant) {
    // reinitialisation de la map
    Gmap = initMap();
    // Créé un marker sur la map à chaque click
    markerAtClick();

    // Génération d'un marker sur la position du restaurant
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
}

function getCustomReviewsByRestaurantId(id) {
    return customReviews.filter((review) => review.restaurantId === id);
}

function getGooglePlacesReviews(restaurant) {
    // Récupération des reviews de chaque restaurants sur GooglePlaces via restaurant.place_id
    const request = {
        placeId: restaurant.place_id,
        fields: ['review']
    };

    const service = new google.maps.places.PlacesService(Gmap);
    service.getDetails(request, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            let googlePlacesReviews = [];
            // Si un restaurant n'a pas de reviews, alors place.reviews === undefined
            if (place.reviews) {
                googlePlacesReviews = place.reviews.map(function(review) {
                    return new Review(review.author_name, review.rating, review.text);
                });
            }

            const customReviewsOfRestaurant = getCustomReviewsByRestaurantId(restaurant.id);

            const restaurantReviews = googlePlacesReviews.concat(customReviewsOfRestaurant);
            restaurant.setReviews(restaurantReviews);
            
            refreshRestaurantDetailsView(restaurant);
        } else {
            console.warn('Unable to fetch restaurant reviews.', status);
        }
    });
}

function initRestaurantDetails(restaurant) {
    if (!restaurant.getPlace_id() || restaurant.getPlace_id() === 'N/A') {
        const customReviewsOfRestaurant = getCustomReviewsByRestaurantId(restaurant.id);
        restaurant.setReviews(customReviewsOfRestaurant);
            
        refreshRestaurantDetailsView(restaurant);
    } else {
        getGooglePlacesReviews(restaurant);
    }
}

// Reupération des restaurants et de leurs informations via le service GoogleMap & GooglePlaces
function GetRestaurantList() {
    // Récupération des informations sur GooglePlaces
    // const request = {
    //     location: new google.maps.LatLng(lat, lon),
    //     radius: '500',
    //     type: ['restaurant']
    // };
    
    // const service = new google.maps.places.PlacesService(Gmap);
    // service.nearbySearch(request, callback);

    
    // function callback(results, status) {
    //     if (status === google.maps.places.PlacesServiceStatus.OK) {
    //         results.forEach(function (restaurant) {

    //             const newRestaurant = new Restaurant(
    //                 restaurant.name, 
    //                 restaurant.vicinity, 
    //                 restaurant.geometry.location.lat(), 
    //                 restaurant.geometry.location.lng(), 
    //                 restaurant.rating, 
    //                 restaurant.place_id,
    //                 []
    //             );
    //             restaurantList.push(newRestaurant);
    //         });

    //         console.log('RestaurantList:', results);
    //         createRestaurantList();
    //         markerAtClick();
    //     }
    // }

    // En local via JSON
    fetch('js/data.json')
        .then(response => response.json())
        .then(function(results) {
            console.log('results:', results);
            results.forEach(function (restaurant) {
                const reviews = restaurant.ratings.map((rating) => new CustomReview(
                    undefined,
                    rating.stars,
                    rating.comment
                ));

                let rating = 0;
                reviews.forEach((review) => rating += review.rate);
                rating /= reviews.length;

                const newRestaurant = new Restaurant(
                    restaurant.restaurantName, 
                    restaurant.address, 
                    restaurant.lat, 
                    restaurant.long,
                    rating.toFixed(1),
                    undefined,
                    reviews
                );
                newRestaurant.reviews.forEach((review) => review.restaurantId = newRestaurant.id);
                restaurantList.push(newRestaurant);
            });
        
            restaurantList.flatMap((restaurant) => restaurant.reviews).forEach((review) => customReviews.push(review));
            console.log('restaurantList:', restaurantList);
            createRestaurantList();
            markerAtClick();
        });
}

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
            GetRestaurantList();
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
            GetRestaurantList();
        });
    } else {
        alert('La Géolocalisation n\'est pas disponible sur votre Navigateur.');
    }

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