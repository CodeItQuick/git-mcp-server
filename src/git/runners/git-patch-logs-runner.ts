import {getPatchLogs} from "../tools/git-patch-logs";

getPatchLogs({ filename: "README.md", repository: "CodeItQuick/blackjack-ensemble-blue"}).then((result) => console.log(JSON.stringify(result)))
