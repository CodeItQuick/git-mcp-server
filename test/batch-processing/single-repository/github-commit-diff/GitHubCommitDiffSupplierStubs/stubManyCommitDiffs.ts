import { IGetCommit } from "../../../../../src/batch-processing/single-repository/github-commit-diff/github-commit-diff-supplier";

export const OctoKitCommitDiffSupplierMany: IGetCommit = {
    repos: {
        getCommit: (params: {
            owner: string;
            repo: string;
            ref: string;
        }) => {
            // Generate different commit diff data based on the ref (SHA)
            const commitIndex = parseInt(params.ref.slice(-1)) || 1;

            return Promise.resolve({
                data: {
                    sha: params.ref,
                    commit: {
                        message: `Commit ${commitIndex}: Multiple file changes and improvements`,
                        author: {
                            name: `Developer ${commitIndex}`,
                            email: `dev${commitIndex}@example.com`,
                            date: `2023-09-${String(20 + commitIndex).padStart(2, '0')}T${String(10 + commitIndex).padStart(2, '0')}:00:00Z`
                        }
                    },
                    stats: {
                        additions: 50 + (commitIndex * 20),
                        deletions: 10 + (commitIndex * 5),
                        total: 60 + (commitIndex * 25)
                    },
                    files: Array.from({ length: 2 + commitIndex }, (_, fileIndex) => ({
                        filename: `src/file${commitIndex}-${fileIndex}.ts`,
                        additions: 20 + (fileIndex * 10),
                        deletions: 5 + (fileIndex * 2),
                        changes: 25 + (fileIndex * 12),
                        patch: `@@ -1,${5 + fileIndex} +1,${25 + fileIndex * 12} @@\n+// Changes for commit ${commitIndex}, file ${fileIndex}`
                    }))
                }
            } as any);
        }
    } as any
};
