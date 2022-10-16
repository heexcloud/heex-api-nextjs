import * as leancloud from "./leancloud";
import heexConfig, { DatabaseProvider } from "root/heex.config";

export const createComment = async (payload: Object) => {
  let result;
  switch (heexConfig.databaseProvider) {
    case DatabaseProvider.leancloud:
      result = await leancloud.createComment(payload);
      break;
    default:
      result = undefined;
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
