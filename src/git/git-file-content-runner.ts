import {getFileContent} from "./git-file-content.js";

getFileContent({ filename: "README.md", repository: "CodeItQuick/blackjack-ensemble-blue" }).then((result) => console.log(JSON.stringify(result)))
