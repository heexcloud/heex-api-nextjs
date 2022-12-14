import type { NextApiRequest, NextApiResponse } from "next";
import { middlewares } from "root/query";
import { query } from "root/query";
import { RESPONSE_CODE } from "root/utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    if (!req.query.pageId || typeof req.query.pageId !== "string") {
      res.status(200).json({
        data: null,
        code: RESPONSE_CODE.BAD_REQUEST_PARAM_MISSING,
        message: "pageId is required",
      });
      return;
    }

    const result = await query.databaseProvider.getCommentCount({
      pageId: req.query.pageId as string,
      clientId: req.query.clientId as string,
    });

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

export default middlewares.cors(handler);
