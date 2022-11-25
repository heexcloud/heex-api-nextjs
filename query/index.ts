import { LeanCloudProvider } from "./LeanCloudProvider";
import { FirebaseProvider } from "./FirebaseProvider";
import { DatabaseProvider } from "root/heex.config";
import {
  CommentType,
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  ThumbupCommentFnType,
  IQueryable,
} from "./types";

import { Boss } from "./Boss";

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
    switch (process.env.DATABASE_PROVIDER) {
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

export const boss = new Boss();
