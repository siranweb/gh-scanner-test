export class GithubService {
    constructor(octokit) {
        this.client = octokit;
    }

    async getRepositories() {
        const result = await this.client.request('GET /user/repos', {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        if (result.status >= 400) {
            throw new Error('Unable to get repositories');
        }

        return result.data;
    };

    async getRepository(owner, repo) {
        const result = await this.client.request('GET /repos/{owner}/{repo}', {
            owner: owner,
            repo: repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        if (result.status >= 400) {
            throw new Error('Unable to get repository');
        }

        return result.data;
    };

    async getRepositoryWebhooks(owner, repo) {
        const result = await this.client.request('GET /repos/{owner}/{repo}/hooks', {
            owner,
            repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        if (result.status >= 400) {
            throw new Error('Unable to get repository webhooks');
        }

        return result.data;
    }

    async getRepositoryContent(owner, repo) {
        const result = await this.client.request('GET /repos/{owner}/{repo}/tarball', {
            owner,
            repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        if (result.status >= 400) {
            throw new Error('Unable to get repository webhooks');
        }

        return result.data;
    }
}