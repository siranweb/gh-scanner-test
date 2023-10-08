import { randomUUID } from 'node:crypto';

export class ActionsPool {
    pool = {};
    queue = [];
    processing = [];

    addAction(action) {
        const actionPoolId = randomUUID();
        this.pool[actionPoolId] = {
            action,
            actionPoolId,
            available: true
        }
    }

    async push(...data) {
        const id = randomUUID();
        const promise = new Promise((resolve, reject) => {
           this.queue.push({ id, data, resolve, reject });
        });
        this.#tryProcessNext();
        return promise;
    }

    async #tryProcessNext() {
        const next = this.queue[0];
        if (next) {
            const availablePoolItem = Object.values(this.pool).find(item => item.available);

            if (availablePoolItem) {
                this.processing.push(this.queue.shift());
                availablePoolItem.available = false;
                availablePoolItem.action.exec(...next.data)
                    .then(result => this.#processResult(next.id, availablePoolItem.actionPoolId, result))
                    .catch(error => this.#processError(next.id, availablePoolItem.actionPoolId, error));
            }
        }
    }

    #processError(taskId, actionPoolId, error) {
        const index = this.processing.findIndex(item => item.id === taskId);
        const processingItem = this.processing[index];
        processingItem.reject(error);
        this.processing.splice(index, 1);
        this.pool[actionPoolId].available = true;

        this.#tryProcessNext();
    }

    #processResult(taskId, actionPoolId, result) {
        const index = this.processing.findIndex(item => item.id === taskId);
        const processingItem = this.processing[index];
        processingItem.resolve(result);
        this.processing.splice(index, 1);
        this.pool[actionPoolId].available = true;

        this.#tryProcessNext();
    }
}