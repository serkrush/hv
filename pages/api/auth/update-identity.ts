import container from "server/di/container";

export default container.resolve("AuthController").handler("api/auth/update-identity");

export const config = {
    api: {
        externalResolver: true
    }
}