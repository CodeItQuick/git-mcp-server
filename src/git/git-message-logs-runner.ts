import {getCommitMessageLogs} from "./git-message-logs.js";


getCommitMessageLogs({ number_days: 365}).then((result) => console.log(JSON.stringify(result)))