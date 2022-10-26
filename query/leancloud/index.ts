import heexConfig, { type LeanCloudConfig } from "root/heex.config";
import fetch from "node-fetch";
import {
  CreateCommentFnType,
  CreateCommentReturnType,
  GetCommentCountFnType,
  CommentCountReturnType,
  GetCommentsFnType,
  GetCommentsReturnType,
  GetCommentByIdFnType,
  CommentType,
  IQueryable,
  GetCommentByIdReturnType,
  ThumbupCommentFnType,
} from "../types";

const databaseConfig = heexConfig.databaseConfig as LeanCloudConfig;
const BASE_URL = databaseConfig.restApiServerUrl;
const LEAN_STORAGE_CLASS = databaseConfig.leanStorageClass;

const COMMENT_CLASS_BASE_URL = `${BASE_URL}/1.1/classes/${LEAN_STORAGE_CLASS}`;

const CQL_BASE_URL = `${BASE_URL}/1.1/cloudQuery`;

export class LeanCloudProvider implements IQueryable {
  getComments: GetCommentsFnType = async ({ pageId }) => {
    try {
      const queryParams1 = new URLSearchParams({
        where: JSON.stringify({
          $or: [{ tid: { $exists: false } }, { tid: "" }],
          pageId,
        }),
        limit: "25",
        order: "-createdAt",
      });

      const headers = {
        "X-LC-Id": databaseConfig.appId,
        "X-LC-Key": databaseConfig.appKey,
      };

      const apiUrl1 = COMMENT_CLASS_BASE_URL + "?" + queryParams1;

      //1. get all comments (threads)
      const response1 = await fetch(apiUrl1, {
        headers,
      });

      const threads = (await response1.json()) as { results: CommentType[] };

      const threadIds: string[] = threads.results.map(
        (c: CommentType) => `"${c.objectId}"`
      );

      const queryParams2 = new URLSearchParams({
        cql: `select * from ${databaseConfig.leanStorageClass} where tid in (${threadIds}) order by -createdAt`,
      });

      const apiUrl2 = CQL_BASE_URL + "?" + queryParams2;

      // 2. get all replies of the above comments (replies)
      const response2 = await fetch(apiUrl2, {
        headers,
      });

      const replies = await response2.json();

      const result = threads.results.map((c) => {
        const _c = { ...c, replies: [] as CommentType[] };
        _c.replies = (replies as any).results.filter(
          (__c: CommentType) => __c.tid === c.objectId
        );

        return _c;
      });

      return { comments: result } as GetCommentsReturnType;
    } catch (e) {
      console.error(e);
    }

    return { comments: [] };
  };

  getCommentCount: GetCommentCountFnType = async ({ pageId }) => {
    try {
      const queryParams = new URLSearchParams({
        count: "1",
        limit: "0",
        where: JSON.stringify({
          $or: [{ tid: { $exists: false } }, { tid: "" }],
          pageId,
        }),
      });

      const apiUrl = COMMENT_CLASS_BASE_URL + "?" + queryParams;
      const response = await fetch(apiUrl, {
        headers: {
          "X-LC-Id": databaseConfig.appId,
          "X-LC-Key": databaseConfig.appKey,
        },
      });

      const json = await response.json();

      if ((json as any).error) {
        return { count: 0 };
      }

      return json as CommentCountReturnType;
    } catch (e) {
      console.error(e);
    }

    return { count: 0 };
  };

  createComment: CreateCommentFnType = async (payload) => {
    try {
      const createResponse = await fetch(COMMENT_CLASS_BASE_URL, {
        method: "POST",
        headers: {
          "X-LC-Id": databaseConfig.appId,
          "X-LC-Key": databaseConfig.appKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const queryParams = new URLSearchParams({
        count: "1",
        limit: "0",
        where: JSON.stringify({
          $or: [{ tid: { $exists: false } }, { tid: "" }],
          pageId: payload.pageId,
        }),
      });
      const apiUrl = COMMENT_CLASS_BASE_URL + "?" + queryParams;

      const countResponse = await fetch(apiUrl, {
        headers: {
          "X-LC-Id": databaseConfig.appId,
          "X-LC-Key": databaseConfig.appKey,
        },
      });

      const json = (await createResponse.json()) as CreateCommentReturnType;
      const count = (await countResponse.json()) as CommentCountReturnType;
      return { ...json, ...count };
    } catch (err) {
      console.error(err);
    }
    return {} as CreateCommentReturnType & CommentCountReturnType;
  };

  getCommentById: GetCommentByIdFnType = async (cid) => {
    try {
      const response = await fetch(`${COMMENT_CLASS_BASE_URL}/${cid}`, {
        headers: {
          "X-LC-Id": databaseConfig.appId,
          "X-LC-Key": databaseConfig.appKey,
        },
      });

      //1. get the comment
      const json = await response.json();

      if ((json as any).error) {
        return {} as GetCommentByIdReturnType;
      }
      // if the comment has tid, then, it's a reply
      // otherwise, it's a thread/comment

      const comment = json as CommentType;

      if (!comment.tid) {
        const queryParams = new URLSearchParams({
          cql: `select * from ${databaseConfig.leanStorageClass} where tid in ("${comment.objectId}") order by -createdAt`,
        });

        const apiUrl = CQL_BASE_URL + "?" + queryParams;

        // 2. get all replies of the above comments (replies)
        const response = await fetch(apiUrl, {
          headers: {
            "X-LC-Id": databaseConfig.appId,
            "X-LC-Key": databaseConfig.appKey,
          },
        });

        const json = await response.json();
        return {
          ...comment,
          replies: (json as any).results,
        } as GetCommentByIdReturnType;
      }

      return comment;
    } catch (err) {
      console.error(err);
    }

    return {} as CommentType;
  };

  thumbupComment: ThumbupCommentFnType = async ({ objectId, likes }) => {
    try {
      const response = await fetch(`${COMMENT_CLASS_BASE_URL}/${objectId}`, {
        method: "PUT",
        headers: {
          "X-LC-Id": databaseConfig.appId,
          "X-LC-Key": databaseConfig.appKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ likes }),
      });

      //1. get the comment
      const json = (await response.json()) as CommentType;
      return json;
    } catch (err) {
      console.error("err :>> ", err);
    }

    return {} as CommentType;
  };
}
