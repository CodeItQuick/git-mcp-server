import {IListCommits} from "../../../../src/batch-processing/single-repository/github-commit/github-commit-supplier";

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
