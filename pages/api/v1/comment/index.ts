import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "root/query";
import { type CreateCommentReturnType } from "root/query";
import { RESPONSE_CODE } from "root/utils";
import { isEmpty } from "lodash";
import { middlewares } from "root/query";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // create new create
  if (req.method === "POST") {
    const result: CreateCommentReturnType =
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

const determineWhichHandler = () => {
  const { cors, anonymous } = middlewares;

  if (process.env.AUTH_MODE === "anonymous") {
    return cors(anonymous(handler));
  }

  return handler;
};

export default determineWhichHandler();
