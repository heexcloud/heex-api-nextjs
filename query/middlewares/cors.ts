import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import heexConfig from "root/heex.config";

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

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
