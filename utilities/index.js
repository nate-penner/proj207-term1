/*
* Some useful utilities
*
* Author: Nate Penner
* When: December 2021
* */
const api = module.exports = {};

api.randRange = (min, max) => {
    return min + Math.floor(Math.random() * (max - min + 1));
};
api.randSet = (generator, count) => {
    const set = [];
    for (let i = 0; i < count; i++)
        set.push(generator());

    return set;
};