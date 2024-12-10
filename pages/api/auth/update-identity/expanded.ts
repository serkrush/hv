import container from "server/di/container";

export default container.resolve("AuthController").handler("api/auth/update-identity/expanded");

export const config = {
    api: {
        externalResolver: true
    }
}