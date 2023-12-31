export class GetRepositoryDetailsAction {
    constructor({ githubService, scanRepositoryActionPool }) {
        this.githubService = githubService;
        this.scanRepositoryActionPool = scanRepositoryActionPool;
    }

    async exec(owner, repo, options = { scan: false }) {
        const repository = await this.githubService.getRepository(owner, repo);
        const webhooks = await this.githubService.getRepositoryWebhooks(owner, repo);

        let totalFiles = null;
        let ymlContent = null;

        if (options.scan) {
            const scanResult = await this.scanRepositoryActionPool.push(owner, repo);
            totalFiles = scanResult.totalFiles;
            ymlContent = scanResult.ymlContent;
        }

        return {
            name: repository.name,
            size: repository.size,
            owner: repository.owner.login,
            private: repository.private,
            totalFiles,
            ymlContent: ymlContent ? Buffer.from(ymlContent).toString('utf-8') : null,
            activeWebhooks: webhooks.filter(webhook => webhook.active).map(webhook => webhook.name),
        };
    }
}