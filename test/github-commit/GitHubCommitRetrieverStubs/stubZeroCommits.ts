import { IListCommits } from "../../../src/batch-processing/github-commit/github-commit-supplier";

export const OctoKitListCommitterZero: IListCommits = {
    repos: {
        listCommits: (params: {
            owner: string;
            repo: string;
            per_page?: number;
            page?: number;
        }) => {
            return Promise.resolve({
                data: []
            } as any);
        }
    } as any
};
