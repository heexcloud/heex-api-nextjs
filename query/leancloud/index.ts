import heexConfig from "root/heex.config";
import fetch from "node-fetch";

const BASE_URL = heexConfig.databaseConfig.restApiServerUrl || "";
const LEAN_STORAGE_CLASS =
  heexConfig.databaseConfig.leanStorageClass || "Comment";

const CREATE_COMMENT_URL = `${BASE_URL}/1.1/classes/${LEAN_STORAGE_CLASS}`;
const GET_COMMENT_URL = `${BASE_URL}/1.1/classes/${LEAN_STORAGE_CLASS}`;

export const createComment = async (payload: Object) => {
  try {
    const response = await fetch(CREATE_COMMENT_URL, {
      method: "POST",
      headers: {
        "X-LC-Id": heexConfig.databaseConfig.appId || "",
        "X-LC-Key": heexConfig.databaseConfig.appKey || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    return json;
  } catch (err) {
    console.error(err);
  }
  return undefined;
};

export const getCommentById = async (id?: number | string) => {
  try {
    const response = await fetch(`${GET_COMMENT_URL}/${id}`, {
      headers: {
        "X-LC-Id": heexConfig.databaseConfig.appId || "",
        "X-LC-Key": heexConfig.databaseConfig.appKey || "",
      },
    });

    const json = await response.json();
    return json;
  } catch (err) {
    console.error(err);
  }

  return undefined;
};
