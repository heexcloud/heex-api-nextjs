import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";
import { query, GetCommentsReturnType } from "root/query";
import { RESPONSE_CODE } from "root/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: heexConfig.corsMethods,
    origin: heexConfig.corsOrigin,
    optionsSuccessStatus: 200,
  });

  if (req.method === "GET") {
    if (!req.query.pageId || typeof req.query.pageId !== "string") {
      res.status(200).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_PARAM_MISSING,
        message: "pageId is required",
      });
      return;
    }

    const result: GetCommentsReturnType =
      await query.databaseProvider.getComments({
        pageId: req.query.pageId as string,
        clientId: req.query.clientId as string,
      });

    res.status(200).json({
      data: result,
      code: RESPONSE_CODE.GENERAL_SUCCESS,
      message: "Get all comments for " + req.query.pageId + " successfully",
    });
    return;
  }

  res.status(200).json({
    data: null,
    code: RESPONSE_CODE.GENERAL_SUCCESS,
    message: "Welcom to Heex!",
  });
}
