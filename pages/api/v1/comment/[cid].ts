import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";
import { query, type CommentType } from "root/query";
import { RESPONSE_CODE } from "root/utils";
import { isEmpty } from "lodash";

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

  const { cid } = req.query;

  if (cid === null || cid === undefined || Array.isArray(cid)) {
    res.status(200).json({
      data: null,
      code: RESPONSE_CODE.BAD_REQUEST_PARAM_MISSING,
      message: "cid param has to be a string",
    });
    return;
  }

  if (req.method === "GET") {
    const result = await query.databaseProvider.getCommentById(cid);

    if (isEmpty(result)) {
      res.status(200).json({
        data: null,
        code: RESPONSE_CODE.DATABASE_ERROR,
        message: "Leancloud config error or item not found",
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

  // thumbup an existing comment
  if (req.method === "POST" && req.body.operation === "thumbup") {
    const result = await query.databaseProvider.thumbupComment({
      objectId: cid,
      likes: req.body.likes,
    });

    const comment = await query.databaseProvider.getCommentById(
      (result as any).objectId
    );

    res.status(200).json({
      data: comment as CommentType,
      code: RESPONSE_CODE.GENERAL_SUCCESS,
      message: "comment thumbup-ed successfully",
    });
    return;
  }

  res.status(200).json({
    data: null,
    code: RESPONSE_CODE.GENERAL_SUCCESS,
    message: "Welcom to Heex!",
  });
}
