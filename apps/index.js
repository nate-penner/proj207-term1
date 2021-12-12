/*
* apps/index.js
* Description:
*   This module provides a simple way to load all .js files in this directory (except this one)
*   as express routers, which are mounted to a base path based on the name of the file
* Author: Nate Penner
* Email: natepenner@gmail.com
* When: December 2021
* */
const fm = require('../utilities/fm');      // use a utility to easily grab all the file names
const path = require('path');               // for path operations

// Get all files in this directory, filtering out index.js and removing .js file extensions
const apps = fm.getFileNamesSync(__dirname)
    .filter(name => name !== 'index.js')
    .map(name => name.replace('.js', ''));

console.log(apps);

// Export the module
const api = module.exports = {};

// Mount the routers to the express app given
api.loadInto = function(expressApp) {
    console.log('Loading apps and mounting routers...')
    apps.forEach((appName) => {
        console.log(`Loading ${appName}...`)
        const app = require(path.join(__dirname, appName));
        console.log(`${appName} loaded. Mounting router...`);
        expressApp.use(`/${appName}`, app);
        console.log(`${appName} mounted to endpoint /${appName}`);
    });
};