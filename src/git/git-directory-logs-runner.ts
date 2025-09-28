import {getDirectoryLogs} from "./git-directory-logs.js";

getDirectoryLogs({ directory: "_drafts" }).then((result) => console.log(JSON.stringify(result)))
