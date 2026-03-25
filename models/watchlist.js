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
        min: [0, "Minimum value for rank is 0"],
        required: [true, "Watchlist entry requires ranking"]
    },
    // required to inform user when pet is no longer available
    petName: {
        type: String,
        trim: true,
        required: [true, "Watchlist entry requires name"]
    }
})

watchlistSchema.index({ user: 1, pet: 1}, { unique: true});
module.exports = mongoose.model('Watchlist', watchlistSchema);