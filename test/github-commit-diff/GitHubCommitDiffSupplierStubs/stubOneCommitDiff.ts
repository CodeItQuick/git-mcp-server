import { IGetCommit } from "../../../src/batch-processing/github-commit-diff/github-commit-diff-supplier";

export const OctoKitCommitDiffSupplierOne: IGetCommit = {
    repos: {
        getCommit: (params: {
            owner: string;
            repo: string;
            ref: string;
        }) => {
            return Promise.resolve({
                data: {
                    sha: "abc123def456789",
                    commit: {
                        message: "Add new feature with comprehensive tests",
                        author: {
                            name: "John Developer",
                            email: "john.dev@example.com",
                            date: "2023-09-28T10:30:00Z"
                        }
                    },
                    stats: {
                        additions: 150,
                        deletions: 25,
                        total: 175
                    },
                    files: [
                        {
                            filename: "src/feature.ts",
                            additions: 100,
                            deletions: 10,
                            changes: 110,
                            patch: "@@ -1,3 +1,103 @@\n+export class NewFeature {\n+  // implementation\n+}"
                        },
                        {
                            filename: "test/feature.test.ts",
                            additions: 50,
                            deletions: 15,
                            changes: 65,
                            patch: "@@ -1,2 +1,52 @@\n+describe('NewFeature', () => {\n+  // tests\n+});"
                        }
                    ]
                }
            } as any);
        }
    } as any
};
