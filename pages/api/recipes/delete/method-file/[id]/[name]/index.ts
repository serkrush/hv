import container from "server/di/container";

export default container.resolve("RecipeController").handler("api/recipes/delete/method-file/:id/:name");

export const config = {
    api: {
        externalResolver: true,
    },
};