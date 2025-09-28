import {init, getNumLogs} from './git.js'
const simpleGit = require("simple-git");

init(simpleGit())

getNumLogs({ number_days: 7}).then((result) => console.log(JSON.stringify(result)))