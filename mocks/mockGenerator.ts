import { IMachine, MachineType } from "@/server/models/Machine";
const uuid = require("uuid");
import modelObj from "../migrationsJson/models.json";
import { countriesCodes, languages, scales } from "@/src/constants";
import { random } from "@/src/utils/random";
import slug from "slug";

let models = modelObj["models-data"].map((data) => {
  return slug(data["model"], "-");
});

export const mockDehydrator = () => {
  let guid = uuid.v4();
  let data: IMachine = {
    categories: [],
    guid,
    shortGuid: guid.slice(8),
    modelId: random(models),
    machineName: `TEST ${guid}`,
    costPerKwh: 1.5,
    country: random(countriesCodes),
    language: random(languages),
    scale: random(scales),
    timezone: "",
    machineType: MachineType.Dehydrator,
    weightScaleFeature: false,
    heatingIntensity: 0
  };

  return data;
};
