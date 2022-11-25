import { LeanCloudProvider } from "./LeanCloudProvider";
import { FirebaseProvider } from "./FirebaseProvider";
import { DatabaseProvider } from "root/heex.config";
import {
  CommentType,
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  ThumbupCommentFnType,
  IClientQueryable,
  IBossQueryable,
} from "./types";

import { bossQuery } from "./BossQuery";

import * as middlewares from "./middlewares";

export type {
  CommentType,
  CreateCommentReturnType,
  CommentCountReturnType,
  GetCommentsReturnType,
  ThumbupCommentFnType,
};

class Query {
  get databaseProvider(): IClientQueryable {
    switch (process.env.DATABASE_PROVIDER) {
      case DatabaseProvider.leancloud:
        return new LeanCloudProvider();
      case DatabaseProvider.firebase:
        return new FirebaseProvider();
      default:
        console.error("Unsupported databaseProvider");
    }
    return {} as IClientQueryable;
  }
}

export const query = new Query();
export { middlewares };

class Boss {
  get databaseProvider(): IBossQueryable {
    switch (process.env.DATABASE_PROVIDER) {
      case DatabaseProvider.leancloud:
        return new bossQuery.LeanCloudProvider();
      case DatabaseProvider.firebase:
        return new bossQuery.FirebaseProvider();
      default:
        console.error("Unsupported databaseProvider");
    }
    return {} as IBossQueryable;
  }
}

export const boss = new Boss();
