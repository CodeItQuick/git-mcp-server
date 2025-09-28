import { IListCommits } from "../../src/batch-processing/github-commit/github-commit-retriever";

export const OctoKitListCommitterMany: IListCommits = {
    repos: {
        listCommits: (params: {
            owner: string;
            repo: string;
            per_page?: number;
            page?: number;
        }) => {
            // Generate many commits (e.g., 5 commits to represent a "many" case)
            const commits = Array.from({ length: 5 }, (_, index) => ({
                sha: `commit${index + 1}sha${Math.random().toString(36).substr(2, 9)}`,
                commit: {
                    message: `Commit ${index + 1}: Feature implementation and bug fixes`,
                    author: {
                        name: `Developer ${index + 1}`,
                        email: `dev${index + 1}@example.com`,
                        date: `2023-09-${String(20 + index).padStart(2, '0')}T${String(10 + index).padStart(2, '0')}:${String(30 + index * 5).padStart(2, '0')}:00Z`
                    },
                    committer: {
                        name: `Developer ${index + 1}`,
                        email: `dev${index + 1}@example.com`,
                        date: `2023-09-${String(20 + index).padStart(2, '0')}T${String(10 + index).padStart(2, '0')}:${String(30 + index * 5).padStart(2, '0')}:00Z`
                    }
                },
                author: {
                    login: `dev${index + 1}`,
                    id: 10000 + index
                },
                committer: {
                    login: `dev${index + 1}`,
                    id: 10000 + index
                },
                html_url: `https://github.com/owner/repo/commit/commit${index + 1}sha${Math.random().toString(36).substr(2, 9)}`
            }));

            return Promise.resolve({
                data: commits
            } as any);
        }
    } as any
};
