import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";
import * as query from "root/query";
import {
  type CreateCommentReturnType,
  type CommentsCountReturnType,
} from "root/query";
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

  if (req.method === "POST") {
    const result: CreateCommentReturnType & CommentsCountReturnType =
      await query.createComment({
        ...req.body,
        ACL: { "*": { read: true } },
      });

    if (isEmpty(result)) {
      res.status(500).json({
        data: null,
        code: RESPONSE_CODE.DATABASE_ERROR,
        message: "Leancloud error",
      });
      return;
    }

    res.status(201).json({
      data: result,
      code: RESPONSE_CODE.CREATION_SUCCESS,
      message: "comment created successfully",
    });
    return;
  }

  res.status(200).json({
    data: null,
    code: RESPONSE_CODE.GENERAL_SUCCESS,
    message: "Welcom to Heex!",
  });
}
