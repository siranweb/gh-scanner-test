import { Octokit } from "octokit";
import fetch from "node-fetch";
import { GithubService } from "./services/github.service.js";
import { GetRepositoriesListAction } from "./actions/get-repositories-list.action.js";
import { GetRepositoryDetailsAction } from "./actions/get-repository-details.action.js";
import { ScanRepositoryAction } from "./actions/scan-repository.action.js";
import { ActionsPool } from "../../infra/actions-pool.js";
import { config } from "../../config.js";
import { GithubResolver } from "./graphql/github.resolver.js";

const octokit = new Octokit({
    auth: config.github.token,
    request: {
        fetch
    }
});
export const githubService = new GithubService(octokit);

const scanRepositoryAction = new ScanRepositoryAction({ githubService });
const scanRepositoryActionPool = new ActionsPool();
scanRepositoryActionPool.addAction(scanRepositoryAction);
scanRepositoryActionPool.addAction(scanRepositoryAction);

export const getRepositoriesListAction = new GetRepositoriesListAction({ githubService });
export const getRepositoryDetailsAction = new GetRepositoryDetailsAction({ githubService, scanRepositoryActionPool });
export const githubResolver = new GithubResolver({ getRepositoriesListAction, getRepositoryDetailsAction });