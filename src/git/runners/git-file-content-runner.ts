import {getFileContent} from "../tools/git-file-content";

getFileContent({
    filename: "README.md",
    repository: "CodeItQuick/blackjack-ensemble-blue"
}).then((result) => console.log(JSON.stringify(result)))
