/*
* Sets up args for ease of use
* Author: Nate Penner
* When: December 2021
* */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

module.exports = yargs(hideBin(process.argv)).argv;