import {IGetContent } from "../../../../../src/batch-processing/single-repository/github-content/github-content-supplier";

export const OctoKitContentSupplierMany: IGetContent = {
    repos: {
        getContent: (params: {
            owner: string;
            repo: string;
            path?: string;
        }) => {
            // Generate many content items (e.g., 5 files to represent a "many" case)
            const contentItems = Array.from({ length: 5 }, (_, index) => ({
                name: `file${index + 1}.ts`,
                path: `src/file${index + 1}.ts`,
                sha: `content${index + 1}sha${Math.random().toString(36).substr(2, 9)}`,
                size: 256 + (index * 128),
                url: `https://api.github.com/repos/owner/repo/contents/src/file${index + 1}.ts`,
                html_url: `https://github.com/owner/repo/blob/main/src/file${index + 1}.ts`,
                git_url: `https://api.github.com/repos/owner/repo/git/blobs/content${index + 1}sha${Math.random().toString(36).substr(2, 9)}`,
                download_url: `https://raw.githubusercontent.com/owner/repo/main/src/file${index + 1}.ts`,
                type: "file",
                content: Buffer.from(`export class File${index + 1} {\n  // Implementation for file ${index + 1}\n}`).toString('base64'),
                encoding: "base64"
            }));

            return Promise.resolve({
                data: contentItems
            } as any);
        }
    } as any
};
