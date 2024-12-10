import container from "server/di/container";

export default container.resolve("CategoryController").handler("api/categories/delete/file/:id/:name");

export const config = {
    api: {
        externalResolver: true
    }
}