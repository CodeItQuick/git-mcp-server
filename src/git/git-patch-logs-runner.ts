import {getPatchLogs} from "./git-patch-logs.js";

getPatchLogs({ filename: "README.md", repository: "CodeItQuick/blackjack-ensemble-blue"}).then((result) => console.log(JSON.stringify(result)))
