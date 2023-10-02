export class ScanRepositoryAction {
    constructor({ scanRepositoryWorkersPool }) {
        this.scanRepositoryWorkersPool = scanRepositoryWorkersPool;
    }

    async exec(owner, repo) {
        return this.scanRepositoryWorkersPool.push({ owner, repo });
    }
}