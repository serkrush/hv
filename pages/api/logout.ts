import container from "server/di/container";

export default container.resolve("AuthController").handler("api/logout");


export const config = {
    api: {
        externalResolver: true,
    },
};