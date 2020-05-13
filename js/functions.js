/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

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

// Ajout d'un message dans la liste si aucuns restaurant n'est trouvé
function emptyRestaurantList() {
    return `<li id='noRestaurantFound' class='list-group-item liElement'>
                <h5>Aucuns Restaurant n'à été trouvé.</h5>
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
function infoWindowClose(infoWindowList) {
    markerList.forEach(function(marker) {
        marker.addListener('click', function() {
            infoWindowList.forEach(function(infowindow) {
                infowindow.close();
            });
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
            latLngObj.lat,
            latLngObj.lng,
            0,
            'N/A',
            'N/A'
        );
        const noReviews = new Review(
            'N/A',
            'N/A',
            'N/A'
        );
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
            return `<h6><i><u>${review.getAuthor()}</u></i></h6>
            <u>Note :</u> ${review.getRate()} 
            <i class='fas fa-star'></i>
            <br>
            <u>Avis :</u> ${review.getComment()}`;
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

function removeRestaurantDetails() {
    $('.commentList').hide();
}

// Ajout d'un commentaire + actualisation de la moyenne et du restaurant dans la liste
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

// Permet de recalculer la moyenne d'un restaurant suite à l'ajout d'un commentaire
function refreshRateAverage(restaurantMatched) {
    // Recalcul de restaurant.rates - Mise à jour de la moyenne du restaurant
    let rateSum = 0;
    let rateAvg = 0;
    restaurantMatched.reviews.forEach(function(review) {
        rateSum += review.getRate();
        rateAvg = rateSum / restaurantMatched.reviews.length;
    });
    return rateAvg.toFixed(1);
}

// Selectionne le restaurant à l'id correspondant
function getRestaurantById(id) {
    return restaurantList.find(restaurant => restaurant.getId() === id);
}

// Créé un marker en reprenant la position (lat/lng) d'un restaurant
function initMarkerForRestaurant(restaurant) {

    map.removeMarkers();
    // Génération d'un marker sur la position du restaurant
    map.setRestaurantMarker(restaurant);
    // Centre la map sur le marker du restaurant
    map.center(restaurant.getRestaurantLat(), restaurant.getRestaurantLong());
}

// Récupère les reviews créés sur le site pour le restaurant correspondant
function getCustomReviewsByRestaurantId(id) {
    return customReviews.filter((review) => review.getRestaurantId() === id);
}

// Récupère les restaurants dont la moyenne est comprise entre minValue & maxValue
function getRestaurantByRate() {
    // reinitialisation de restaurantListDom pour vider la liste
    let restaurantListDom = '';
    // On récupère la valeur min & max des moyennes pour effetuer une recherche
    const minValue = document.getElementById('minValue').value;
    const maxValue = document.getElementById('maxValue').value;
    let resultSearchByRate = [];
    if (minValue > maxValue) {
        alert('La valeur minimale doit être inferieur à la valeur maximal pour votre recherche.');
    }
    else {
        // resultSearchByRate = tout les restaurants ayant une moyenne entre minValue et maxValue
        resultSearchByRate = restaurantList.filter(restaurant => restaurant.getRestaurantRating() >= minValue 
            && restaurant.getRestaurantRating() <= maxValue);

        if (resultSearchByRate.length === 0) {
            alert('Votre recherche ne retourne aucuns restaurants.');
        } else {
            for (let i = 0; i < resultSearchByRate.length; i++) {
                const restaurant = resultSearchByRate[i];
                restaurantListDom += createRestaurantDom(restaurant);
            }
            document.getElementById('markerList').innerHTML = restaurantListDom;
            // On supprime les markers deja présents
            map.removeMarkers();
            // Pour chaque restaurant on créé un marker
            resultSearchByRate.forEach(function (restaurant) {
                map.setRestaurantMarker(restaurant);
            });
        }
    }
}

// Affiche les détails d'un restaurant
function initRestaurantDetails(restaurant) {
    if (!restaurant.getPlace_id() || restaurant.getPlace_id() === 'N/A') {
        const restaurantCustomReviews = getCustomReviewsByRestaurantId(restaurant.id);
        restaurant.setReviews(restaurantCustomReviews);
            
        refreshRestaurantDetailsView(restaurant);
    } else {
        map.getGooglePlacesReviews(restaurant);
    }
}

// Reupération des restaurants et de leurs informations via le service GoogleMap & GooglePlaces || en local
// function getRestaurantList() {
//     // Récupération des informations sur GooglePlaces
//     const request = {
//         location: gMap.getCenter(),
//         radius: '500',
//         type: ['restaurant']
//     };
    
//     const service = new google.maps.places.PlacesService(gMap);
//     service.nearbySearch(request, callback);
    
//     function callback(results, status) {
//         if (status === google.maps.places.PlacesServiceStatus.OK) {
//             results.forEach(function (restaurant) {

//                 const newRestaurant = new Restaurant(
//                     restaurant.name, 
//                     restaurant.vicinity, 
//                     restaurant.geometry.location.lat(), 
//                     restaurant.geometry.location.lng(), 
//                     restaurant.rating, 
//                     restaurant.place_id,
//                     []
//                 );
//                 restaurantList.push(newRestaurant);
//             });

//             createRestaurantList();
//             markerAtRightClick();
//         }
//     }

// En local via JSON
// fetch('js/data.json')
//     .then(response => response.json())
//     .then(function(results) {
//         results.forEach(function (restaurant) {
//             const reviews = restaurant.ratings.map((rating) => new CustomReview(
//                 undefined,
//                 rating.stars,
//                 rating.comment
//             ));

//             let rating = 0;
//             reviews.forEach((review) => rating += review.rate);
//             rating /= reviews.length;

//             const newRestaurant = new Restaurant(
//                 restaurant.restaurantName, 
//                 restaurant.address, 
//                 restaurant.lat, 
//                 restaurant.long,
//                 rating.toFixed(1),
//                 undefined,
//                 reviews
//             );
//             newRestaurant.reviews.forEach((review) => review.restaurantId = newRestaurant.id);
//             restaurantList.push(newRestaurant);
//         });
        
//         restaurantList.flatMap((restaurant) => restaurant.reviews).forEach((review) => customReviews.push(review));
//         createRestaurantList();
//         markerAtClick();
//     });
// }