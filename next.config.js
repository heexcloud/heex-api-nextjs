const fs = require("fs");
const filePath = "./.env";
if (process.env.NODE_ENV === "development") {
  if (fs.existsSync(filePath)) {
    require("dotenv").config();
  } else {
    throw new Error("Couldn't find .env file");
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
