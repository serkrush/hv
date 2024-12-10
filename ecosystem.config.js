module.exports = {
    apps: [
        {
            name: "dehydrator-app",
            script: "node_modules/next/dist/bin/next",
            instances: "max",
            exec_mode: "cluster",
            watch: false,
            time: true,
            log_date_format: "YYYY-MM-DD HH:mm Z",
            args: "start",
            max_memory_restart: "1G",
            env_local: {
                PORT: 4000,
                NODE_ENV: "local",
                BASE_URL: "http://localhost:4000",
                API_STRING: "/api",
                ENVIRONMENT: "prod",
            },
            env_production: {
                PORT: 4000,
                NODE_ENV: "prod",
                BASE_URL: "https://dehydrator.golden-team.org",
                API_STRING: "/api",
                ENVIRONMENT: "prod",
            },
            env_development: {
                PORT: 4000,
                NODE_ENV: "dev",
                BASE_URL: "https://dehydrator-dev.golden-team.org",
                API_STRING: "/api",
                ENVIRONMENT: "dev",
            }
        },
    ],
};
