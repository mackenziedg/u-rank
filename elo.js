module.exports = {
    Probability: function (r1, r2){
        return 1 / (1 + Math.pow(10, (r1-r2)/400));
    },

    EloUpdate: function (r1, r2, K, result){
        var p1 = this.Probability(r2, r1);
        var p2 = this.Probability(r1, r2);

        r1 = r1 + K * (1 - p1);
        r2 = r2 + K * (0 - p2);

        return [r1, r2];
    }

};
