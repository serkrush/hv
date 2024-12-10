const merge = require("lodash/merge");

if (typeof document !== 'undefined') {
    throw new Error('Do not import `config.js` from inside the client-side code. !!!!!!');
}

const isDev = process.env.ENVIRONMENT !== 'prod'? true : false;

const prodConfig = {
    dev: isDev,
    environment: process.env.ENVIRONMENT,
    baseUrl: process.env.BASE_URL,
    apiUrl:  process.env.API_STRING,
    siteName: "Benchfood",
    redisUrl: process.env.REDIS_URL,
    IGNORS: [
        "/favicon.ico",
        "/_next",
        "/static",
        "/sitemap.xml",
        "/robots.txt",
    ],
    logger: {
        excludeUrlPrefixes: [],
        timezone: 'America/Los_Angeles',
        dirPath: "./log",
    },
    mail: {
        transport: "gmail", // smtp, mail, gmail
        debug: "",
        from: {
            base: {
                email: "",
                name: "",
            },
        },
        smtp: {
            port: 587,
            host: "smtp.gmail.com",
            security: true,
            username: "some@email.com",
            password: "",
            server: "",
        },
        gmail: {
            username: "",
            password: "",
        },
    },
    socket: {
        key: process.env.SOCKET_KEY,
        active: process.env.SOCKET_ACTIVE,
        host: process.env.SOCKET_HOST,
        port: process.env.SOCKET_PORT,
    },
    hashes: {
        outOfDateHashTime: 10 * 60 * 1000, // 10 minutes in milliseconds
        hashCleanerWorkingInterval: 1 * 60 * 1000 // 1 minute in milliseconds
    },
    fcmTokenExpireTime: 30 * 24 * 60 * 60 * 1000, //30 days in milliseconds
    firebaseConfig: {
        apiKey: 'AIzaSyCecLSME266orHwcQBWI7rt2faRkmHek2U',
        authDomain: 'dehydrator-app.firebaseapp.com',
        projectId: 'dehydrator-app',
        storageBucket: 'dehydrator-app.appspot.com',
        messagingSenderId: '343628266929',
        appId: '1:343628266929:web:2768a87bb4fb58dcb15190',
        measurementId: 'G-EG78K1T8DH',
    },
    devFirebaseConfig: {
        apiKey: 'AIzaSyBeI1zUoK3m7iCNRSe5KBLnUoul5eW3SGw',
        authDomain: 'dehydrator-app-dev.firebaseapp.com',
        projectId: 'dehydrator-app-dev',
        storageBucket: 'dehydrator-app-dev.appspot.com',
        messagingSenderId: '1098470485769',
        appId: '1:1098470485769:web:1c49484230992e7944edd8',
    },
    mongodbUri: 'mongodb://localhost:27017',
    mongodbDatabase: 'testDatabase',
    // environment: 'dev', 
};

let localConfig = {};

if (isDev) {
    try {
        localConfig = require("./config.local.ts");
    } catch (ex) {
        console.log("ex", ex);
        console.log("config.local does not exist.");
    }
}

const xConfig = merge(prodConfig, localConfig ?? {});

console.log("isDev", xConfig.dev);

module.exports = xConfig;
