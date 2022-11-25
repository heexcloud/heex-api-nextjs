import type { NextApiRequest, NextApiResponse } from "next";
import { middlewares, boss } from "root/query";
import jwt from "jsonwebtoken";
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
  } catch (err) {}
}

export default middlewares.cors(handler);
