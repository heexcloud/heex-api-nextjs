import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";
import { query } from "root/query";
import {
  type CreateCommentReturnType,
  type CommentCountReturnType,
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

  // create new create
  if (req.method === "POST") {
    const result: CreateCommentReturnType & CommentCountReturnType =
      await query.databaseProvider.createComment({
        ...req.body,
        ACL: { "*": { read: true, write: true } },
      });

    if (isEmpty(result)) {
      res.status(200).json({
        data: null,
        code: RESPONSE_CODE.DATABASE_ERROR,
        message: "Failed to create comment: database error or bad request",
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
