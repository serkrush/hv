import {MigrateOptions} from 'fireway';
import categoriesObj from '../migrationsJson/categories.json';

export async function migrate({firestore}: MigrateOptions) {
    // const addCategory = async ({inputData, parentIds = [] as string[]}) => {
    //     let data = {
    //         category_name: inputData['category_name'],
    //         recipe_process: 'recipe',
    //         user_id: null,
    //         machine_id: null,
    //     };
    //     if (parentIds.length > 0) {
    //         data['parent_id'] = parentIds[parentIds.length - 1];
    //     } else {
    //         data['parent_id'] = null;
    //     }

    //     let ref = firestore.collection('categories');
    //     for (let index = 0; index < parentIds.length; index++) {
    //         const element = parentIds[index];
    //         if (element) {
    //             ref = ref.doc(element).collection('categories');
    //         }
    //     }

    //     const newCategory = await ref.add(data);

    //     if (inputData['categories']) {
    //         const inputSubs = inputData['categories'];
    //         inputSubs.forEach(element => {
    //             addCategory({
    //                 inputData: element,
    //                 parentIds: [...parentIds, newCategory.id],
    //             });
    //         });
    //     }
    // };

    // const mainCategories = categoriesObj['categories-data'];

    // for (let index = 0; index < mainCategories.length; index++) {
    //     const element = mainCategories[index];
    //     await addCategory({inputData: element});
    // }
}
