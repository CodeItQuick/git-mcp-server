import {fetchAndStoreCommitDiffs} from './fetch-and-store-commit-diffs';
import {GithubCommitDiffSupplier} from "./github-commit-diff-supplier";
import dotenv from "dotenv";
import {Octokit} from "@octokit/rest";
dotenv.config();

// Configuration - can be made environment-based
const BLOG_TOKEN = process.env.BLOG_GITHUB_TOKEN || "";
const BLOG_REPOSITORY = "CodeItQuick/CodeItQuick.github.io";
const ENSEMBLE_TOKEN = process.env.ENSEMBLE_TOKEN_REPOSITORY || "";
const ENSEMBLE_REPOSITORY = "CodeItQuick/blackjack-ensemble-blue";
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "1200");

fetchAndStoreCommitDiffs(
    BLOG_REPOSITORY,
    new GithubCommitDiffSupplier(RATE_LIMIT_DELAY, new Octokit({ auth: BLOG_TOKEN })))
    .then((result: {
        content: {
            type: string;
            text: string;
        }[]
    }) => console.log(JSON.stringify(result)))
    // @ts-ignore
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
