import {getDirectoryLogs} from "../tools/git-directory-logs";

getDirectoryLogs({
    directory: "_drafts",
    repository: "CodeItQuick/blackjack-ensemble-blue"
}).then((result) => console.log(JSON.stringify(result)))
