import {IListCommits} from "../../../src/batch-processing/github-commit/github-commit-retriever";

export const OctoKitListCommitterRateLimit: IListCommits = {
    repos: {
        listCommits: (params: {
            owner: string;
            repo: string;
            per_page?: number;
            page?: number;
        }) => {
            return Promise.reject(new Error("API rate limit exceeded") as any);
        }
    } as any
};
