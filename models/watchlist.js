const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: [true, "Watchlist entry does not reference valid pet"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "Watchlist entry must belong to valid user"]
    },
    dateUpdated: {
        type: Date,
        required: [true, "Watchlist entry requires valid date"]
    },
    comments: {
        type: String,
        trim: true
    },
    ranking: {
        type: Number,
        min: [1, "Minimum value for rank is 1"],
        required: [true, "Watchlist entry requires ranking"]
    }
})

watchlistSchema.index({ user: 1, pet: 1}, { unique: true});
module.exports = mongoose.model('Watchlist', watchlistSchema);