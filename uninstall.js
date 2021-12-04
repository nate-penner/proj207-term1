const colors = require('colors');
const {spawn} = require('child_process');
const platform = process.platform;

const npmCmd = (platform === 'win32' ? 'npm.cmd' : 'npm');
const npm = spawn(npmCmd, ['uninstall', '-g']);

npm.stdout.on('data', (data) => {
    console.log(`${new Date(Date.now()).toISOString()} - [${colors.brightGreen('travelexperts')}] - ${data}`);
});
npm.stderr.on('data', (data) => {
    console.error(`${new Date(Date.now()).toISOString()} - [${colors.brightGreen('travelexperts')}] - ${data}`);
});
npm.on('close', (code) => {
    console.error(`${new Date(Date.now()).toISOString()} - [${colors.brightGreen('travelexperts')}] - npm exited with code ${code}`);
});