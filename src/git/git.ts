import simpleGit, {DefaultLogFields, LogResult, SimpleGit} from "simple-git";

let git: SimpleGit | { log: (params: any) => Promise<LogResult<DefaultLogFields>> } = { log: async (params: any) => { return Promise.resolve({} as any) } };

export const init = (gitObj: { log: () => {} }) => git = gitObj as SimpleGit;

export const getNumLogs = async (days: { number_days: number } | undefined ) => {

    const gitLogs: LogResult<DefaultLogFields> = await git.log({ "--since": `${days?.number_days || 7} days ago` }, (err: unknown) => console.log(err));
    const gitMessageLogs = gitLogs.all.map((log: { message: string | undefined }, idx) => `#${idx + 1}: ${log?.message}`);
    return {
        content: [{
            type: "text",
            text: `The following commits have been made in the past ${days?.number_days || 7}: ` +
                gitMessageLogs.join(', ')
        }]
    };
};