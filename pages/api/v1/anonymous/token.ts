import type { NextApiRequest, NextApiResponse } from "next";
import { middlewares } from "root/query";
import jwt from "jsonwebtoken";
import { RESPONSE_CODE } from "root/utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" || process.env.AUTH_MODE !== "anonymous") {
    res.status(400).json({
      data: null,
      code: RESPONSE_CODE.HTTP_METHOD_NOT_SUPPORTED,
      message: "http get only and anonymous mode only",
    });
    return;
  }

  try {
    const token = jwt.sign({ foo: "bar" }, process.env.JWT_TOKEN_SECRET!);
    res.status(200).json({
      data: { token },
      code: RESPONSE_CODE.CREATION_SUCCESS,
      message: "jwt token success",
    });
    return;
  } catch (err) {
    console.log("err :>> ", err);
  }

  res.status(500).json({
    data: null,
    code: RESPONSE_CODE.SERVER_UNKNOWN_ERROR,
    message: "jwt token failure",
  });
}

export default middlewares.cors(handler);
