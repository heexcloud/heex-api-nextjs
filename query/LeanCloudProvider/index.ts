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
  getComments: GetCommentsFnType = async (params) => {
    const { pageId, clientId, limit, offset } = params;
    if (!clientId || !pageId) {
      return { comments: [] };
    }
    try {
      const _pageId =
        pageId === "/"
          ? pageId
          : pageId.slice(-1) === "/"
          ? pageId.slice(0, pageId.length - 1)
          : pageId;

      const queryParams1 = new URLSearchParams({
        where: JSON.stringify({
          $and: [
            { $or: [{ tid: { $exists: false } }, { tid: "" }] },
            { $or: [{ pageId: _pageId }] },
            { $or: [{ clientId }] },
          ],
        }),
        order: "-createdAt",
        limit: limit || "25",
      });

      if (offset) {
        // leancloud use skip, not offset
        queryParams1.append("skip", offset);
      }

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

  getCommentCount: GetCommentCountFnType = async ({ clientId, pageId }) => {
    try {
      if (!clientId || !pageId) {
        return { count: 0 };
      }

      const pageIdQuery = [{ pageId }];

      // if the last char is /, remove it; else, add it to the end
      // make sure it queries both (with or without trailing slash)
      if (pageId !== "/") {
        if (pageId.slice(-1) === "/") {
          pageIdQuery.push({
            pageId: pageId.substring(0, pageId.lastIndexOf("/")),
          });
        } else {
          pageIdQuery.push({
            pageId: pageId + "/",
          });
        }
      }

      const queryParams = new URLSearchParams({
        count: "1",
        limit: "0",
        where: JSON.stringify({
          $and: [
            { $or: [{ tid: { $exists: false } }, { tid: "" }] },
            { $or: pageIdQuery },
            { $or: [{ clientId }] },
          ],
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
    } catch (err) {
      console.error("err :>> ", err);
    }

    return { count: 0 };
  };

  // 3 types of comments: a whole new comment, a new reply to a thread, a new reply to a thread's reply
  createComment: CreateCommentFnType = async (payload) => {
    const { comment, clientId, pageId } = payload || {};
    try {
      if (!payload || !comment || !clientId || !pageId) {
        return {} as CreateCommentReturnType;
      }

      const _pageId =
        pageId === "/"
          ? pageId
          : pageId[pageId.length - 1] === "/"
          ? pageId.slice(0, pageId.length - 1)
          : pageId;

      const createResponse = await fetch(COMMENT_CLASS_BASE_URL, {
        method: "POST",
        headers: {
          "X-LC-Id": databaseConfig.appId,
          "X-LC-Key": databaseConfig.appKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          pageId: _pageId,
        }),
      });

      const json = await createResponse.json();
      return json as CreateCommentReturnType;
    } catch (err) {
      console.error(err);
    }
    return {} as CreateCommentReturnType;
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

        // 2. get all replies of the above comment (replies)
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

  thumbupComment: ThumbupCommentFnType = async ({ cid, likes }) => {
    try {
      const response = await fetch(`${COMMENT_CLASS_BASE_URL}/${cid}`, {
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
