import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { RESPONSE_CODE } from "root/utils";

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export const anonymous = (handler: Handler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // apply this middleware when post, i.e., write something into db
    if (req.method === "GET") {
      return handler(req, res);
    }

    try {
      const token = req.headers["x-heex"];
      jwt.verify(token as string, process.env.JWT_TOKEN_SECRET!);
      return handler(req, res);
    } catch (e) {
      res.status(401).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_NOT_AUTHORIZED,
        message: "JWT token is invalid",
      });
    }
  };
};
