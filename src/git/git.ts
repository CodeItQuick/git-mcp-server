import simpleGit from "simple-git";

const git = simpleGit();

git.log({ "--since": "7 days ago" }, (err) => console.log(err))
    .then(console.log)

export const getNumLogs = () => {

}