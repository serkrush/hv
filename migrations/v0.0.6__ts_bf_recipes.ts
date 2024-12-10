import { MigrateOptions } from "fireway";
import recipesObject from "../migrationsJson/dehydrating-recipes.json";

export async function migrate({ firestore }: MigrateOptions) {
    const addRecipe = async ({ inputData, parentIds = [] as string[] }) => {
        const { categoriesPath } = inputData;

        let categories = [];
        for (let i = 0; i < categoriesPath.length; i++) {
            const path = categoriesPath[i];
            let ref = firestore.collection("categories");
            let tempCategory = null;
            for (let j = 0; j < path.length; j++) {
                const element = path[j];
                const pathElement = await ref
                    .where("category_name", "==", element)
                    .get();
                const category = pathElement?.docs?.map((item) => {
                    return { ...item.data(), id: item.ref.id };
                });
                if (category && category.length > 0) {
                    let id = category[0].id;
                    tempCategory = id;
                    ref = ref.doc(id).collection("categories");
                }
            }
            if (tempCategory != null) {
                categories.push(tempCategory);
            }
        }

        let data = {
            ...inputData,
            categories,
            machine_id: null,
            user_id: null,
        };

        delete data.categoriesPath;

        if(inputData?.id) {
            let ref = firestore.collection("recipes").doc(inputData.id);
            await ref.set(data);
        }
    };

    const recipes = recipesObject;

    for (let index = 0; index < recipes.length; index++) {
        const element = recipes[index];
        await addRecipe({ inputData: element });
    }
}
