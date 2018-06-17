var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlayersSchema = new Schema({
    name: String,
    url: String,
    score: Number,
    bling: [String],
    active: Boolean,
    img_path: String,
    stats: {
        'FG%': Number,
        PER: Number,
        TRB: Number,
        AST: Number,
        'eFG%': Number,
        PTS: Number,
        'FT%': Number,
        '3PT%': Number,
        WS: Number,
        G: Number
    }
});

module.exports = mongoose.model('Players', PlayersSchema, 'players');
