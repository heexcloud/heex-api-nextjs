import { LeanCloudProvider } from "./LeanCloudProvider";
import { FirebaseProvider } from "./FirebaseProvider";
import heexConfig, { DatabaseProvider } from "root/heex.config";
import {
  CommentType,
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  ThumbupCommentFnType,
  IQueryable,
} from "./types";

import * as middlewares from "./middlewares";

export type {
  CommentType,
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  ThumbupCommentFnType,
};

class Query {
  get databaseProvider(): IQueryable {
    switch (heexConfig.databaseProvider) {
      case DatabaseProvider.leancloud:
        return new LeanCloudProvider();
      case DatabaseProvider.firebase:
        return new FirebaseProvider();
      default:
        console.error("Unsupported databaseProvider");
    }
    return {} as IQueryable;
  }
}

export const query = new Query();
export { middlewares };
