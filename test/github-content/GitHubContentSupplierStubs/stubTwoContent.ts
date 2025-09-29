import {IGetContent} from "../../../src/batch-processing/github-content/github-content-supplier";

export const OctoKitContentSupplierTwo: IGetContent = {
    repos: {
        getContent: (params: {
            owner: string;
            repo: string;
            path?: string;
        }) => {
            return Promise.resolve({
                data: [
                    {
                        name: "README.md",
                        path: "README.md",
                        sha: "abc123def456789",
                        size: 1024,
                        url: "https://api.github.com/repos/owner/repo/contents/README.md",
                        html_url: "https://github.com/owner/repo/blob/main/README.md",
                        git_url: "https://api.github.com/repos/owner/repo/git/blobs/abc123def456789",
                        download_url: "https://raw.githubusercontent.com/owner/repo/main/README.md",
                        type: "file",
                        content: "IyBQcm9qZWN0IFRpdGxlCgpUaGlzIGlzIGEgc2FtcGxlIFJFQURNRSBmaWxlLg==", // base64 encoded "# Project Title\n\nThis is a sample README file."
                        encoding: "base64"
                    },
                    {
                        name: "package.json",
                        path: "package.json",
                        sha: "def789ghi012345",
                        size: 512,
                        url: "https://api.github.com/repos/owner/repo/contents/package.json",
                        html_url: "https://github.com/owner/repo/blob/main/package.json",
                        git_url: "https://api.github.com/repos/owner/repo/git/blobs/def789ghi012345",
                        download_url: "https://raw.githubusercontent.com/owner/repo/main/package.json",
                        type: "file",
                        content: "ewogICJuYW1lIjogInNhbXBsZS1wcm9qZWN0IiwKICAidmVyc2lvbiI6ICIxLjAuMCIKfQ==", // base64 encoded package.json
                        encoding: "base64"
                    }
                ]
            } as any);
        }
    } as any
};
