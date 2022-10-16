import heexConfig from "root/heex.config";
import fetch from "node-fetch";
import {
  CreateCommentReturnType,
  GetAllCommentCountReturnType,
} from "../types";

const BASE_URL = heexConfig.databaseConfig.restApiServerUrl || "";
const LEAN_STORAGE_CLASS =
  heexConfig.databaseConfig.leanStorageClass || "Comment";

const COMMENT_CLASS_BASE_URL = `${BASE_URL}/1.1/classes/${LEAN_STORAGE_CLASS}`;

/**
 *
 * @param payload : a root comment has no rid, a reply has rid
 * @returns
 */
export const createComment = async (
  payload: Object
): Promise<CreateCommentReturnType> => {
  try {
    const response = await fetch(COMMENT_CLASS_BASE_URL, {
      method: "POST",
      headers: {
        "X-LC-Id": heexConfig.databaseConfig.appId || "",
        "X-LC-Key": heexConfig.databaseConfig.appKey || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    return json as CreateCommentReturnType;
  } catch (err) {
    console.error(err);
  }
  return {} as CreateCommentReturnType;
};

export const getCommentById = async (cid: number | string) => {
  try {
    const response = await fetch(`${COMMENT_CLASS_BASE_URL}/${cid}`, {
      headers: {
        "X-LC-Id": heexConfig.databaseConfig.appId || "",
        "X-LC-Key": heexConfig.databaseConfig.appKey || "",
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

export const getAllCommentCount =
  async (): Promise<GetAllCommentCountReturnType> => {
    try {
      const response = await fetch(
        `${COMMENT_CLASS_BASE_URL}?count=1&limit=0`,
        {
          headers: {
            "X-LC-Id": heexConfig.databaseConfig.appId || "",
            "X-LC-Key": heexConfig.databaseConfig.appKey || "",
          },
        }
      );

      const json = await response.json();
      return json as GetAllCommentCountReturnType;
    } catch (e) {
      console.error(e);
    }

    return { result: [], count: 0 };
  };
