import getServiceAccountKey from "@/src/utils/serviceAccount";
import * as jwt from "jsonwebtoken";

const serviceAccount = getServiceAccountKey();
const secret = serviceAccount.privateKeyId;

export const generateMachineToken = (payload) => {
  return jwt.sign(payload, secret)
}

export const generate = (payload, time: number | string = "30d") => {
  const expiresIn = time;
  return jwt.sign(payload, secret, { expiresIn });
};

export const verify = (token) => {
  return jwt.verify(token, secret);
};
