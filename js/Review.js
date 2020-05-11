// Objet Review
class Review {
    constructor(author, rate, comment) {
        this.author = author;
        this.rate = rate;
        this.comment = comment;
    }
    getAuthor() {
        return this.author;
    }
    getRate() {
        return this.rate;
    }
    getComment() {
        return this.comment;
    }
}