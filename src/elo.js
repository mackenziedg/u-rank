function Probability(r1, r2){
    return 1 / (1 + 1 * Math.pow(10, (r1-r2)/400));
}

function EloUpdate(r1, r2, K, result){
    p1 = Probability(r2, r1);
    p2 = Probability(r1, r2);

    if (result == 1){
        r1 = r1 + K * (0 - p1);
        r2 = r2 + K * (1 - p2);
    }

    return [r1, r2];
}
