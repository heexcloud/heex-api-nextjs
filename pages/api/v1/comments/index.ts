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

  const { pageId, clientId, limit, offset } = req.query;

  if (req.method === "GET") {
    if (!pageId || !clientId || !limit) {
      res.status(200).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_PARAM_MISSING,
        message: "pageId, clientId and limt are required",
      });
      return;
    }

    const result: GetCommentsReturnType =
      await query.databaseProvider.getComments({
        pageId: pageId as string,
        clientId: clientId as string,
        limit: limit as string | undefined,
        offset: offset as string | undefined,
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
