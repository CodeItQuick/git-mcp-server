// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\commit-data-adapter.ts

export interface CommitData {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
    };
    author?: {
        login: string;
        id: number;
    };
    committer?: {
        login: string;
        id: number;
    };
    html_url: string;
    repository?: string;
    fetched_at?: Date;
}

export interface CommitDataRetriever {
    fetchCommits(repository: string): Promise<CommitData[]>;
}

export interface CommitDataStorage {
    storeCommits(commits: CommitData[], repository: string): Promise<void>;
}
