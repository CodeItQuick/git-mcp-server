import {fetchAndStoreCommitDiffs} from './github-retrieval-commit-diff.js';

fetchAndStoreCommitDiffs()
    .then((result: {
        content: {
            type: string;
            text: string;
        }[]
    }) => console.log(JSON.stringify(result)))
    // @ts-ignore
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
