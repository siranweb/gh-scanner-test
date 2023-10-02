import { randomUUID } from 'node:crypto';

export class WorkersPool {
    pool = {};
    queue = [];
    processing = [];

    addWorker(worker) {
        this.pool[worker.threadId] = {
            worker,
            available: true
        }
        worker.on('message', (result) => {
            this.#processWorkerMessage(worker, result);
        });
    }

    async push(data) {
        const id = randomUUID();
        const promise = new Promise((resolve, reject) => {
           this.queue.push({ id, data, resolve, reject });
        });
        this.#tryProcessNext();
        return promise;
    }

    #tryProcessNext() {
        const next = this.queue[0];
        if (next) {
            const availablePoolItem = Object.values(this.pool).find(item => item.available);

            if (availablePoolItem) {
                this.processing.push(this.queue.shift());
                availablePoolItem.available = false;
                availablePoolItem.worker.postMessage({
                    id: next.id,
                    data: next.data,
                });
            }
        }
    }

    #processWorkerMessage(worker, result) {
        const index = this.processing.findIndex(item => item.id === result.id);
        const processingItem = this.processing[index];

        if (result.error) {
            processingItem.reject(result.error);
        } else {
            processingItem.resolve(result.data);
        }
        this.processing.splice(index, 1);

        this.pool[worker.threadId].available = true;
        this.#tryProcessNext();
    }
}