import {IGetContent} from "../../../../../src/batch-processing/single-repository/github-content/github-content-supplier";

export const OctoKitContentSupplierRateLimit: IGetContent = {
    repos: {
        getContent: (params: {
            owner: string;
            repo: string;
            path?: string;
        }) => {
            // Simulate a 403 rate limit error
            return Promise.reject(new Error("API rate limit exceeded"));
        }
    } as any
};
