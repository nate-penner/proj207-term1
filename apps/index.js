const fm = require('../utilities/fm');
const path = require('path');

const apps = fm.getFileNamesSync(__dirname)
    .filter(name => name !== 'index.js')
    .map(name => name.replace('.js', ''));

console.log(apps);
const api = module.exports = {};

// Mount the routers to the express app
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