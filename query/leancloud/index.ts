import heexConfig, { type LeanCloudConfig } from "root/heex.config";
import fetch from "node-fetch";
import {
  CreateCommentFnType,
  CreateCommentReturnType,
  GetCommentCountFnType,
  CommentCountReturnType,
  GetCommentsFnType,
  GetCommentsReturnType,
  CommentType,
} from "../types";

const databaseConfig = heexConfig.databaseConfig as LeanCloudConfig;
const BASE_URL = databaseConfig.restApiServerUrl;
const LEAN_STORAGE_CLASS = databaseConfig.leanStorageClass;

const COMMENT_CLASS_BASE_URL = `${BASE_URL}/1.1/classes/${LEAN_STORAGE_CLASS}`;

const CQL_BASE_URL = `${BASE_URL}/1.1/cloudQuery`;

/**
 *
 * @param payload : a thread has no tid, a reply has tid, or a toId
 * @returns
 */
export const createComment: CreateCommentFnType = async (payload) => {
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

export const getCommentById = async (cid: number | string) => {
  try {
    const response = await fetch(`${COMMENT_CLASS_BASE_URL}/${cid}`, {
      headers: {
        "X-LC-Id": databaseConfig.appId,
        "X-LC-Key": databaseConfig.appKey,
      },
    });

    const json = await response.json();

    if ((json as any).error) {
      throw new Error((json as any).error);
    }

    return json;
  } catch (err) {
    console.error(err);
  }

  return undefined;
};

export const getCommentCount: GetCommentCountFnType = async ({ pageId }) => {
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

export const getComments: GetCommentsFnType = async ({ pageId }) => {
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

    const response1 = await fetch(apiUrl1, {
      headers,
    });

    const json1 = (await response1.json()) as { results: CommentType[] };

    const replyIds: string[] = json1.results.map(
      (c: CommentType) => `"${c.objectId}"`
    );

    const queryParams2 = new URLSearchParams({
      cql: `select * from ${databaseConfig.leanStorageClass} where tid in (${replyIds}) order by -createdAt`,
    });

    const apiUrl2 = CQL_BASE_URL + "?" + queryParams2;

    const response2 = await fetch(apiUrl2, {
      headers,
    });

    const json2 = await response2.json();

    const result = json1.results.map((c) => {
      const _c = { ...c, replies: [] as CommentType[] };
      _c.replies = (json2 as any).results.filter(
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
