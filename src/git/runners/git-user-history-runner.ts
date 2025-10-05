import { getUserHistory } from '../tools/git-user-history';

const main = async () => {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node git-user-history-runner.js [username] [since-date]

Arguments:
  start-date   Required. Start date in YYYY-MM-DD format
  end-date   Required. End date in YYYY-MM-DD format

Examples:
  node git-user-history-runner.js 2024-01-01
  node git-user-history-runner.js 2024-01-01 2024-02-01

Note:
  Searches across all repositories for the specified user's commits.
`);
        return;
    }

    let startDate: string, endDate: string;

    // Parse arguments - flexible order
    if (args.length === 1) {
        // [since-date] only
        startDate = args[0];
        const tempDate = new Date(args[0])
        tempDate.setDate(tempDate.getDate() + 7)
        endDate = tempDate.toISOString();
    } else if (args.length === 2) {
        // [username] [since-date]
        startDate = args[1];
        endDate = args[2];
    } else {
        console.error('Error: Invalid number of arguments. Use --help for usage information.');
        process.exit(1);
    }

    try {
        const result = await getUserHistory({
            username: 'CodeItQuick',
            start_date: startDate,
            end_date: endDate
        });

        console.log(result.content[0].text);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main();
