import { createClient } from 'redis';
import BaseContext from '../di/BaseContext';

class RedisService extends BaseContext {
    private client: any;

    constructor(ctx) {
        super(ctx);
        this.client = createClient({
            url: this.di.config.redisUrl,
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    async saveCache(key, data, expiration = 86400) {
        await this.connect();
        const value = JSON.stringify(data)
        await this.client.set(key, value, {
            EX: expiration,
        });
    }

    async getCache(key) {
        await this.connect();
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    async deleteCache(key) {
        await this.connect();
        const result = await this.client.del(key);
        return result;
    }

    async close() {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }
}

export default RedisService;
