import tar from "tar";
import fsp from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export class ScanRepositoryAction {
    constructor({ githubService }) {
        this.githubService = githubService;
    }

    async exec(owner, repo) {
        const arrayBuffer = await this.githubService.getRepositoryContent(owner, repo);
        const id = randomUUID();

        try {
            await fsp.mkdir('./tmp');
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }

        const tmpPath = './tmp';
        const repoPath = `${tmpPath}/${id}-${owner}-${repo}`;
        await fsp.mkdir(repoPath);
        await fsp.writeFile(`${repoPath}.tar`, Buffer.from(arrayBuffer));

        await this.#extractTar(`${repoPath}.tar`, repoPath);
        const fileList = await this.#getFileList(repoPath);
        const ymlFilePath = fileList.find(path => path.endsWith('.yml'));

        let ymlContent = null;
        if (ymlFilePath) {
            ymlContent = await fsp.readFile(ymlFilePath);
        }

        await fsp.rm(repoPath, {
            recursive: true,
            force: true,
        });
        await fsp.rm(`${repoPath}.tar`);

        return {
            ymlContent,
            totalFiles: fileList.length,
        }
    }

    async #extractTar(file, cwd) {
        return new Promise((res, rej) => {
            tar.x({
                file,
                cwd,
            }, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            });
        })
    }

    async #getFileList(dir) {
        const entries = await fsp.readdir(dir);
        let acc = [];
        for (const entry of entries) {
            const fullPath = path.resolve(dir, entry);
            const info = await fsp.stat(fullPath);
            if (info.isDirectory()) {
                acc = [...acc, ...(await this.#getFileList(fullPath))];
            } else {
                acc = [...acc, fullPath];
            }
        }
        return acc;
    }
}