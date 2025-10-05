import {getCommitMessageLogs} from "../tools/git-message-logs";


getCommitMessageLogs({ number_days: 365, repository: "CodeItQuick/blackjack-ensemble-blue"}).then((result) => console.log(JSON.stringify(result)))