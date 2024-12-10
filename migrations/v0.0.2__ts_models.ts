import { MigrateOptions } from "fireway";
import modelObj from '../migrationsJson/models.json'
import slug from "slug";

export async function migrate({ firestore }: MigrateOptions) {
//   modelObj["models-data"].forEach(async (modelData) => {
//     const id = slug(modelData["model"], "-");
//     await firestore
//       .collection("models")
//       .doc(id)
//       .set({ ...modelData, id });
//   });
}
