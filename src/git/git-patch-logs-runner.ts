import {getPatchLogs} from "./git-patch-logs.js";


getPatchLogs({ number_days: 60}).then((result) => console.log(JSON.stringify(result)))
