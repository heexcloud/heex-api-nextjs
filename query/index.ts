import { LeanCloudProvider } from "./leancloud";
import heexConfig, { DatabaseProvider } from "root/heex.config";
import {
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  IQueryable,
} from "./types";

export type {
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
};

class Query {
  get databaseProvider(): IQueryable {
    switch (heexConfig.databaseProvider) {
      case DatabaseProvider.leancloud:
        return new LeanCloudProvider();
      default:
        console.error("Unsupported databaseProvider");
    }
    return {} as IQueryable;
  }
}

export const query = new Query();
