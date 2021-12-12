// Sets up process.argv for ease of use with yargs

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

module.exports = yargs(hideBin(process.argv)).argv;