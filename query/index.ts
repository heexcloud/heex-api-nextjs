import * as leancloud from "./leancloud";
import heexConfig, { DatabaseProvider } from "root/heex.config";
import {
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  CommentType,
  CreateCommentFnType,
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
export const createComment: CreateCommentFnType = async (payload) => {
  let result = {} as CreateCommentReturnType & CommentCountReturnType;
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      result = await leancloud.createComment(payload);
      break;
    default:
      console.log("Unsupported databaseProvider");
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
      console.log("Unsupported databaseProvider");
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
      console.log("Unsupported databaseProvider");
  }

  return result;
};

export const getComments = async (
  args: any
): Promise<GetCommentsReturnType> => {
  let result: GetCommentsReturnType = {
    comments: [] as CommentType[],
  };
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      const json = await leancloud.getComments(args);
      result.comments = (json as any).results;
      break;
    default:
      console.log("Unsupported databaseProvider");
  }

  return result;
};
