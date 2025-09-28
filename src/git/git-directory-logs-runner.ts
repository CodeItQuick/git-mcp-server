import {getDirectoryLogs} from "./git-directory-logs.js";

getDirectoryLogs({ directory: "_drafts", repository: "CodeItQuick/blackjack-ensemble-blue" }).then((result) => console.log(JSON.stringify(result)))
