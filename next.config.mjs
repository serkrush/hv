/** @type {import('next').NextConfig} */

import { ImageConfigContext } from 'next/dist/shared/lib/image-config-context.shared-runtime.js';
import config from './config.js';

const nextConfig = {
    reactStrictMode: false,
    publicRuntimeConfig: {
        BASE_URL: config.baseUrl,
        API_STRING: config.apiUrl,
        ENVIRONMENT: config.environment,
        OUT_OF_DATE_HASH_TIME: config.hashes.outOfDateHashTime,
        HASH_CLEANER_WORKING_INTERVAL: config.hashes.hashCleanerWorkingInterval,
        DEV: config.dev,
        SOCKET_HOST: config.socket.host,
        SOCKET_PORT: config.socket.port,
        SOCKET_ACTIVE: config.socket.active,
        firebaseConfig: config.firebaseConfig,
        devFirebaseConfig: config.devFirebaseConfig,
    },
    webpack: (
        config,
    ) => {
        config["optimization"]["minimize"] = false;
        config["optimization"]["minimizer"] = [];
        return config;
    },
};

export default nextConfig;
