import { IGetCommitListForUser } from "../../../../../src/batch-processing/multiple-repository/github-commit-diff/github-commit-diff-supplier";

export let OctoKitMultipleRepositoryCommitDiffSupplier: IGetCommitListForUser = {
    repos: {
        listForUser: () => {
            return Promise.resolve({
                data: [
                    {
                        full_name: "CodeItQuick/CodeItQuick.github.io",
                        fork: false
                    },
                    {
                        full_name: "CodeItQuick/blackjack-ensemble-blue",
                        fork: false
                    },
                    {
                        full_name: "CodeItQuick/forked-repo",
                        fork: true // This should be filtered out
                    }
                ]
            });
        },
        getCommit: (params: { ref: string; }) => {
            const mockCommitData = {
                sha: params?.ref,
                commit: {
                    message: `Test commit message for ${params?.ref}`,
                    author: {
                        name: "Test Author",
                        date: "2024-10-01T10:00:00Z"
                    }
                },
                files: [
                    {
                        filename: "test-file.ts",
                        status: "modified",
                        additions: 10,
                        deletions: 5,
                        changes: 15,
                        patch: "@@ -1,5 +1,10 @@\n-old code\n+new code"
                    }
                ],
                stats: {
                    additions: 10,
                    deletions: 5,
                    total: 15
                }
            };

            return Promise.resolve({ data: mockCommitData });
        }
    }
} as unknown as IGetCommitListForUser;
