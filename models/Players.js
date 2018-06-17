var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlayersSchema = new Schema({
    name: String,
    url: String,
    score: Number,
    games_played: Number
});

module.exports = mongoose.model('Players', PlayersSchema, 'players');
