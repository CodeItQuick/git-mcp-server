import simpleGit from "simple-git";

const git = simpleGit();

git.log(undefined, (err) => console.log(err))
    .then(console.log)