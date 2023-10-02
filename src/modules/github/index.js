import {fileURLToPath} from "node:url";
import path from "node:path";
import { Octokit } from "octokit";
import fetch from "node-fetch";
import { Worker, isMainThread } from "node:worker_threads";
import { GithubService } from "./services/github.service.js";
import { GetRepositoriesListAction } from "./actions/get-repositories-list.action.js";
import { GetRepositoryDetailsAction } from "./actions/get-repository-details.action.js";
import { ScanRepositoryAction } from "./actions/scan-repository.action.js";
import { WorkersPool } from "../../infra/workers-pool.js";
import { config } from "../../config.js";
import { GithubResolver } from "./graphql/github.resolver.js";

const __filename = fileURLToPath(import.meta.url);

const octokit = new Octokit({
    auth: config.github.token,
    request: {
        fetch
    }
});

const scanRepositoryPath = path.join(__filename, '../workers/scan-repository.worker.js');
const scanRepositoryWorkersPool = new WorkersPool();
if (isMainThread) {
    scanRepositoryWorkersPool.addWorker(new Worker(scanRepositoryPath));
    scanRepositoryWorkersPool.addWorker(new Worker(scanRepositoryPath));
}

export const githubService = new GithubService(octokit);
export const getRepositoriesListAction = new GetRepositoriesListAction({ githubService });
export const scanRepositoryAction = new ScanRepositoryAction({ scanRepositoryWorkersPool });
export const getRepositoryDetailsAction = new GetRepositoryDetailsAction({ githubService, scanRepositoryAction });
export const githubResolver = new GithubResolver({ getRepositoriesListAction, getRepositoryDetailsAction });