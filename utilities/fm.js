/*
* A File Manager API for NodeJS
* */

const fs = require('fs');

const api = module.exports = {};

api.getFileNames = function(path, callback) {
    fs.readdir(path, {withFileTypes: true}, (err, entries) => {
        entries = entries
            .filter(entry => entry.isFile())
            .map(file => file.name);

        callback(entries);
    });
};
api.getFolderNames = function(path, callback) {
    fs.readdir(path, {withFileTypes: true}, (err, entries) => {
        entries = entries.filter(entry => entry.isDirectory())
            .map(dir => dir.name);

        callback(entries);
    });
};

api.getFileNamesSync = function(path) {
    let files = fs.readdirSync(path, {withFileTypes: true});
    files = files
        .filter(entry => entry.isFile())
        .map(file => file.name);

    return files;
};

api.getFolderNamesSync = function(path) {
    let folders = fs.readdirSync(path, {withFileTypes: true});
    folders = folders
        .filter(entry => entry.isDirectory())
        .map(dir => dir.name);

    return folders;
};