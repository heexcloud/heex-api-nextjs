import type { NextApiRequest, NextApiResponse } from "next";
import { middlewares, boss } from "root/query";
import { RESPONSE_CODE } from "root/utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(400).json({
      data: null,
      code: RESPONSE_CODE.HTTP_METHOD_NOT_SUPPORTED,
      message: "http post method only",
    });
    return;
  }

  try {
    const { email, password } = req.body;
    const result = await boss.databaseProvider.login({ email, password });

    if (!result) {
      throw new Error("Login failed");
    }

    res.status(200).json({
      data: result,
      code: RESPONSE_CODE.GENERAL_SUCCESS,
      message: "login success",
    });
  } catch (err) {
    let message = "Unknown Error";
    if (err instanceof Error) message = err.message;
    console.error("err :>> ", err);

    res.status(200).json({
      data: null,
      code: RESPONSE_CODE.GENERAL_SUCCESS,
      message: "login failed: " + message,
    });
  }
}

export default middlewares.cors(handler);
