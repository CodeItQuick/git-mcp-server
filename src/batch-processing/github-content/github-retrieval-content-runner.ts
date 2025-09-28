import { fetchAndStoreRepositoryContent } from './github-retrieval-content.js';

fetchAndStoreRepositoryContent("CodeItQuick/CodeItQuick.github.io")
    .then((result: {
    content: {
        type: string;
        text: string;
    }[]}) => console.log(JSON.stringify(result)))
    // @ts-ignore
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
