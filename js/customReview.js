// Review ajouté par un utilisateur sur le site
class CustomReview extends Review {
    constructor(author, rate, comment, restaurantId) {
        super(author, rate, comment);
        this.restaurantId = restaurantId;
    }
}