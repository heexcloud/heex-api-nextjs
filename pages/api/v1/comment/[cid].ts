import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";
import { leancloud } from "root/query";
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
    const { cid } = req.query;

    if (cid === null || cid === undefined || Array.isArray(cid)) {
      res.status(400).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_PARAM_MISSING,
        message: "cid param missing",
      });
      return;
    }

    const result = await leancloud.getCommentById(cid);

    if (result === undefined) {
      res.status(500).json({
        data: null,
        code: RESPONSE_CODE.DATABASE_ERROR,
        message: "Leancloud error",
      });
      return;
    }

    res.status(200).json({
      data: result,
      code: RESPONSE_CODE.GENERAL_SUCCESS,
      message: "comment retrieved successfully",
    });
    return;
  }

  res.status(200).json({
    data: null,
    code: RESPONSE_CODE.GENERAL_SUCCESS,
    message: "Welcom to Heex!",
  });
}
