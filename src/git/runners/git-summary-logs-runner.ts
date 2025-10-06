import {getSummaryLogs} from "../tools/git-summary-logs";

getSummaryLogs({
    start_date: "2025-01-01",
    end_date: "2025-10-05",
    author: 'CodeItQuick'
}).then((result) => console.log(JSON.stringify(result)))
