// Variables Globales
const GOOGLE_KEY = 'AIzaSyAdRLMuV1SShGeWaJw81FdroiSA4M7DO-0';
// Latitude et longitude de Paris (centre de la carte)
let lat = 48.856614;
let lon = 2.3522219;
// position contient les coordonnées lat & lng pour initMap
let position;
// Array créé pour stocker les {Restaurant} créés d'après resultList
const restaurantList = [];
// Ajout de chaque infowindow dans cet array
const infoWindowList = [];
// Ajout de chaque marker dans cet array
const markerList = [];
// Contient la map après initialisation
let gMap = undefined;
// Initialisation de GeoCoder
const geoCoder = new google.maps.Geocoder();
// LatLng convertit en address lisible une fois valorisé
let formattedAddress = '';
// Lat & Lng d'un marker placé manuellement une fois valorisé
let latLngObj= '';
// liste des reviews saisies sur le site
const customReviews = [];
// Restaurant clické par l'utilisateur dans la liste
let selectedRestaurant;