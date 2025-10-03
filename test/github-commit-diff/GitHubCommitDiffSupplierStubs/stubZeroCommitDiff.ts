import { IGetCommit } from "../../../src/batch-processing/single-repository/github-commit-diff/github-commit-diff-supplier";

export const OctoKitCommitDiffSupplierZero: IGetCommit = {
    repos: {
        getCommit: (params: {
            owner: string;
            repo: string;
            ref: string;
        }) => {
            // Return empty commit data to simulate no commit found
            return Promise.resolve({
                data: {
                    sha: params.ref,
                    commit: {
                        message: "Empty commit",
                        author: {
                            name: "No Author",
                            email: "no@example.com",
                            date: "2023-01-01T00:00:00Z"
                        }
                    },
                    stats: {
                        additions: 0,
                        deletions: 0,
                        total: 0
                    },
                    files: []
                }
            } as any);
        }
    } as any
};
