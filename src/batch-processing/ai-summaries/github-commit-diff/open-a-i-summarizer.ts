export interface CommitData {
    sha: string;
    repository: string;
    patch?: string;
    commit_message?: string;
    author?: string;
    date?: string;
}

export interface CommitSummary {
    sha: string;
    repository: string;
    summary: string;
    original_message?: string;
    author?: string;
    date?: string;
    created_at: Date;
}

export interface IAISummarizer {
    summarizeCommit(commit: CommitData): Promise<string>;
}

/**
 * GitHub AI API client for summarizing commit diffs
 */
export class OpenAISummarizer implements IAISummarizer {
    private githubToken: string;
    private delayMs: number;
    private model: string;

    constructor(
        githubToken: string,
        delayMs: number = 1000,
        model: string = "codellama"
    ) {
        this.githubToken = githubToken;
        this.delayMs = delayMs;
        this.model = model;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async summarizeCommit(commit: CommitData): Promise<string> {
        const diffText = commit.patch || "No diff available";
        const message = commit.commit_message || "No commit message";

        const prompt = `Summarize this git commit in three concise lines (max 300 characters):
Commit Message: ${message}
Author: ${commit.author || 'Unknown'}

Diff:
${diffText.substring(0, 8000)}

Provide only the three-line summary, nothing else.`;

        try {
            console.log(prompt);
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    stream: false
                })
            }).then(x => x.json());

            // if (!response.ok) {
            //     const errorText = await response.text();
            //     throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
            // }

            const summary = JSON.stringify(response);

            console.log('summary')
            console.log(summary)
            console.log('summary')
            return response.response;

        } catch (error) {
            console.error(`Error summarizing commit ${commit.sha.substring(0, 7)}:`, error);
            throw error;
        }
    }
}
