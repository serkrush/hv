import container from "server/di/container";

export default container.resolve("AuthController").handler("api/register");

export const config = {
    api: {
        externalResolver: true,
    },
};