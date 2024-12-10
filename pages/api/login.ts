import container from "server/di/container";

export default container.resolve("AuthController").handler("api/login");

export const config = {
    api: {
        externalResolver: true
    }
}