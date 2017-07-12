var mongoose = require('mongoose');

var userScoreSchema = {
	email: { type: String, index: true, unique: true},
	score: { type: Number }
}

module.exports = mongoose.model('scoreInfo', userScoreSchema);