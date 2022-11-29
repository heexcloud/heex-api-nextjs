import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { RESPONSE_CODE } from "root/utils";
import type { Handler } from "./_types";

export const boss = (handler: Handler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers["x-heex-boss"];
      jwt.verify(token as string, process.env.JWT_BOSS_TOKEN_SECRET!);
      return handler(req, res);
    } catch (e) {
      res.status(401).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_NOT_AUTHORIZED,
        message: "Boss JWT token is invalid or expired",
      });
    }
  };
};
