import { getRepositoryHistory } from './git-repository-history';

const main = async () => {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node git-repository-history-runner.js [username] [exact-date]

Arguments:
  username     Optional. Username to search for (default: CodeItQuick)
  exact-date   Required. Date in YYYY-MM-DD format

Examples:
  node git-repository-history-runner.js CodeItQuick 2024-01-01
  node git-repository-history-runner.js 2024-01-01
  node git-repository-history-runner.js "Ted M. Young" 2024-06-01

Note:
  Searches across all repositories to find which ones the user was active in on the specified date.
`);
        return;
    }

    let exactDate: string;

    // Parse arguments - flexible order
    if (args.length === 1) {
        // [exact-date] only
        exactDate = args[0];
    } else if (args.length === 2) {
        // [username] [exact-date]
        exactDate = args[1];
    } else {
        console.error('Error: Invalid number of arguments. Use --help for usage information.');
        process.exit(1);
    }

    try {
        const result = await getRepositoryHistory({
            username: 'CodeItQuick',
            since_date: exactDate
        });

        console.log(result.content[0].text);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main();

