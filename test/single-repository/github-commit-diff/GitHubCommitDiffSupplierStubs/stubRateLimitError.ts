import {IGetCommit} from "../../../../src/batch-processing/single-repository/github-commit-diff/github-commit-diff-supplier";

export const OctoKitCommitDiffSupplierRateLimit: IGetCommit = {
    repos: {
        getCommit: (params: {
            owner: string;
            repo: string;
            ref: string;
        }) => {
            // Simulate a 403 rate limit error
            return Promise.reject(new Error("API rate limit exceeded"));
        }
    } as any
};
