import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import type { Handler } from "./_types";

export const cors = (handler: Handler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // cors, allow any website to access this endpoint
    await NextCors(req, res, {
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      origin: "*",
      optionsSuccessStatus: 200,
    });

    return handler(req, res);
  };
};
