import heexConfig, { type LeanCloudConfig } from "root/heex.config";
import fetch from "node-fetch";
import {
  CreateCommentFnType,
  CreateCommentReturnType,
  GetCommentCountFnType,
  CommentCountReturnType,
  GetCommentsFnType,
  GetCommentsReturnType,
} from "../types";

const databaseConfig = heexConfig.databaseConfig as LeanCloudConfig;

const BASE_URL = databaseConfig.restApiServerUrl;
const LEAN_STORAGE_CLASS = databaseConfig.leanStorageClass;

const COMMENT_CLASS_BASE_URL = `${BASE_URL}/1.1/classes/${LEAN_STORAGE_CLASS}`;

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
      return { result: [], count: 0 };
    }

    return json as CommentCountReturnType;
  } catch (e) {
    console.error(e);
  }

  return { result: [], count: 0 };
};

export const getComments: GetCommentsFnType = async ({ pageId }) => {
  try {
    const queryParams = new URLSearchParams({
      where: JSON.stringify({
        $or: [{ tid: { $exists: false } }, { tid: "" }],
        pageId,
      }),
      limit: "100",
      order: "-createdAt",
    });

    const apiUrl = COMMENT_CLASS_BASE_URL + "?" + queryParams;

    const response = await fetch(apiUrl, {
      headers: {
        "X-LC-Id": databaseConfig.appId,
        "X-LC-Key": databaseConfig.appKey,
      },
    });

    const json = await response.json();
    return json as GetCommentsReturnType;
  } catch (e) {
    console.error(e);
  }

  return { comments: [] };
};
