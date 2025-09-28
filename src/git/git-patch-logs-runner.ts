import {getPatchLogs} from "./git-patch-logs.js";

getPatchLogs({ filename: "README.md" }).then((result) => console.log(JSON.stringify(result)))
