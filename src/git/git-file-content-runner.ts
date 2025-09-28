import {getFileContent} from "./git-file-content.js";

getFileContent({ filename: "README.md" }).then((result) => console.log(JSON.stringify(result)))
