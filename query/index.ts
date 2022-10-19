import * as leancloud from "./leancloud";
import heexConfig, { DatabaseProvider } from "root/heex.config";
import {
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
} from "./types";

export type {
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
};

/**
 *
 * @param payload : a new comment has no trid (thread root id), a reply to an existing comment has trid
 * @returns
 */
export const createComment = async (payload: Object) => {
  let result: CreateCommentReturnType & CommentCountReturnType;
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      result = await leancloud.createComment(payload);
      break;
    default:
      result = {} as CreateCommentReturnType & CommentCountReturnType;
  }

  return result;
};

export const getCommentById = async (cid: number | string) => {
  let result;
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      result = await leancloud.getCommentById(cid);
      break;
    default:
      result = undefined;
  }

  return result;
};

export const getCommentCount = async (
  args: any
): Promise<{ count: number }> => {
  let result = { count: 0 };
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      const json = await leancloud.getCommentCount(args);
      result = { count: json.count };
      break;
    default:
      result = { count: 0 };
  }

  return result;
};

export const getComments = async (
  args: any
): Promise<GetCommentsReturnType> => {
  let result: GetCommentsReturnType = [];
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      result = await leancloud.getComments(args);
      break;
    default:
      result = [] as GetCommentsReturnType;
  }

  return result;
};
