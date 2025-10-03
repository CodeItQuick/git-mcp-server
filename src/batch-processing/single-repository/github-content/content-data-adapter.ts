export interface FileContent {
    path: string;
    name: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: string;
    content?: string;
    encoding?: string;
    repository: string;
    fetched_at: Date;
}

export interface ContentDataRetriever {
    fetchRepositoryContent(repository: string): Promise<FileContent[]>;
}

export interface ContentDataStorage {
    storeContent(content: FileContent[], repository: string): Promise<void>;
}
