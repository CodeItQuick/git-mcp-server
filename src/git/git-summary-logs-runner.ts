import {getSummaryLogs} from "./git-summary-logs";

getSummaryLogs({
    repository: "CodeItQuick/blackjack-ensemble-blue",
    start_date: "2025-01-01",
    end_date: "2025-10-05"
}).then((result) => console.log(JSON.stringify(result)))
