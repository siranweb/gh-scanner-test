export class GetRepositoriesListAction {
    constructor({ githubService }) {
        this.githubService = githubService;
    }

    async exec() {
        const repositories = await this.githubService.getRepositories();
        return repositories.map(repo => ({
            name: repo.name,
            size: repo.size,
            owner: repo.owner.login,
        }));
    }
}