import type { NextApiRequest, NextApiResponse } from "next";
import { middlewares } from "root/query";
import { query, GetCommentsReturnType } from "root/query";
import { RESPONSE_CODE } from "root/utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { pageId, clientId, limit, offset } = req.query;

    if (!pageId || !clientId) {
      res.status(200).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_PARAM_MISSING,
        message: "pageId and clientId are required",
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

export default middlewares.cors(handler);
