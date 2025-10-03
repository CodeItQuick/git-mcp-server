import {IListCommits} from "../../../src/batch-processing/single-repository/github-commit/github-commit-supplier";

export const OctoKitListCommitterTwo: IListCommits = {
    repos: {
        listCommits: (params: {
            owner: string;
            repo: string;
            per_page?: number;
            page?: number;
        }) => {
            return Promise.resolve({
                data: [
                    {
                        sha: "abc123def456789",
                        commit: {
                            message: "Initial commit - Add basic project structure",
                            author: {
                                name: "John Developer",
                                email: "john.dev@example.com",
                                date: "2023-09-28T10:30:00Z"
                            },
                            committer: {
                                name: "John Developer",
                                email: "john.dev@example.com",
                                date: "2023-09-28T10:30:00Z"
                            }
                        },
                        author: {
                            login: "johndev",
                            id: 12345
                        },
                        committer: {
                            login: "johndev",
                            id: 12345
                        },
                        html_url: "https://github.com/owner/repo/commit/abc123def456789"
                    },
                    {
                        sha: "def789ghi012345",
                        commit: {
                            message: "Fix: Update dependency versions and resolve security issues",
                            author: {
                                name: "Jane Smith",
                                email: "jane.smith@example.com",
                                date: "2023-09-28T14:15:30Z"
                            },
                            committer: {
                                name: "Jane Smith",
                                email: "jane.smith@example.com",
                                date: "2023-09-28T14:15:30Z"
                            }
                        },
                        author: {
                            login: "janesmith",
                            id: 67890
                        },
                        committer: {
                            login: "janesmith",
                            id: 67890
                        },
                        html_url: "https://github.com/owner/repo/commit/def789ghi012345"
                    }
                ]
            } as any);
        }
    } as any
}