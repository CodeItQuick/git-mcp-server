import { getUserHistory } from './git-user-history';

const main = async () => {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node git-user-history-runner.js [username] [since-date]

Arguments:
  username     Optional. Username to search for (default: CodeItQuick)
  since-date   Required. Start date in YYYY-MM-DD format

Examples:
  node git-user-history-runner.js CodeItQuick 2024-01-01
  node git-user-history-runner.js 2024-01-01
  node git-user-history-runner.js "Ted M. Young" 2024-06-01

Note:
  Searches across all repositories for the specified user's commits.
`);
        return;
    }

    let sinceDate: string;

    // Parse arguments - flexible order
    if (args.length === 1) {
        // [since-date] only
        sinceDate = args[0];
    } else if (args.length === 2) {
        // [username] [since-date]
        sinceDate = args[1];
    } else {
        console.error('Error: Invalid number of arguments. Use --help for usage information.');
        process.exit(1);
    }

    try {
        const result = await getUserHistory({
            username: 'CodeItQuick',
            exact_date: sinceDate
        });

        console.log(result.content[0].text);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main();
