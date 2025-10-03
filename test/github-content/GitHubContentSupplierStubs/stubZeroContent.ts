import {IGetContent} from "../../../src/batch-processing/single-repository/github-content/github-content-supplier";

export const OctoKitContentSupplierZero: IGetContent = {
    repos: {
        getContent: (params: {
            owner: string;
            repo: string;
            path?: string;
        }) => {
            return Promise.resolve({
                data: []
            } as any);
        }
    } as any
};
