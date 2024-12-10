import { verify } from "../utils/token";
import container from "../di/container";
import { ErrorCode } from "@/src/constants";

const sendError = (res, message, code = 400) => {
  if (typeof res.status != "undefined") {
    return res.status(code).json({
      error: {
        message: message,
        code,
      },
    });
  } else {
    return {
      props: {
        error: {
          message: message,
          code,
        },
      },
    };
  }
};

const authTokenCheck = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return sendError(res, "No token provided", 401);
    }
    const [scheme, token] = authorizationHeader?.split(" ");
    if (!token) {
      return sendError(res, "No token provided", 401);
    }
    const payload = verify(token);
    const uid = payload["uid"];
    if (uid) {
      const UserService = container.resolve("UserService");
      const user = await UserService.findUserInfo(uid);
      if (user != null) {
        req.user = user;
        next();
      } else {
        throw new Error(ErrorCode.NoUserForId);
      }
    } else {
      throw new Error(ErrorCode.TokenNotVerify);
    }
  } catch (error) {
    sendError(res, error.message, 401);
  }
};

export default authTokenCheck;
