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