import {getNumLogs} from "./git-message-logs.js";


getNumLogs({ number_days: 60}).then((result) => console.log(JSON.stringify(result)))