import threads from 'node:worker_threads';
import { githubService } from "../";
import fsp from "node:fs/promises";
import tar from 'tar';
import path from "node:path";

threads.parentPort.on('message', async ({ id, data }) => {
    const arrayBuffer = await githubService.getRepositoryContent(data.owner, data.repo);

    try {
        await fsp.mkdir('./tmp');
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }

    const tmpPath = './tmp';
    const repoPath = `${tmpPath}/${id}-${data.owner}-${data.repo}`;
    await fsp.mkdir(repoPath);
    await fsp.writeFile(`${repoPath}.tar`, Buffer.from(arrayBuffer));

    await extractTar(`${repoPath}.tar`, repoPath);
    const fileList = await getFileList(repoPath);
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

    threads.parentPort.postMessage({
        id,
        data: {
            ymlContent,
            totalFiles: fileList.length,
        },
    });
});

async function extractTar(file, cwd) {
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

async function getFileList(dir) {
    const entries = await fsp.readdir(dir);
    let ret = [];
    for (const entry of entries) {
        const fullpath = path.resolve(dir, entry);
        const info = await fsp.stat(fullpath);
        if (info.isDirectory()) {
            ret = [...ret, ...(await getFileList(fullpath))];
        } else {
            ret = [...ret, fullpath];
        }
    }
    return ret;
}