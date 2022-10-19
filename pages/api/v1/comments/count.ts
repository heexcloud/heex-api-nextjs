import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";
import * as query from "root/query";
import { RESPONSE_CODE } from "root/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // cors, allow any website to access this endpoint
  await NextCors(req, res, {
    methods: heexConfig.corsMethods,
    origin: heexConfig.corsOrigin,
    optionsSuccessStatus: 200,
  });

  if (req.method === "GET") {
    const result = await query.getCommentsCount();

    res.status(200).json({
      data: result,
      code: RESPONSE_CODE.GENERAL_SUCCESS,
      message: "comment count is " + result.count,
    });
    return;
  }

  res.status(200).json({
    data: null,
    code: RESPONSE_CODE.GENERAL_SUCCESS,
    message: "Welcom to Heex!",
  });
}
