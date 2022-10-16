enum Database {
  leancloud = "leancloud",
  detaSh = "detaSh",
}

enum CorsMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export type HeexConfig = {
  corsOrigin: string | string[];
  corsMethods: CorsMethod[];
  databaseProvider: Database;
  databaseConfig: {
    // for leancloud
    appId?: string;
    appKey?: string;
    restApiServerUrl?: string;
    leanStorageClass?: string;
  };
};

const heexConfig: HeexConfig = {
  corsOrigin: ["*"],
  corsMethods: [
    CorsMethod.GET,
    CorsMethod.POST,
    CorsMethod.PUT,
    CorsMethod.DELETE,
    CorsMethod.OPTIONS,
  ],
  databaseProvider: Database.leancloud,
  databaseConfig: {
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    restApiServerUrl: process.env.LEANCLOUD_REST_API_SERVER_URL,
    leanStorageClass: process.env.LEANCLOUD_LEAN_STORAGE_CLASS,
  },
};

export default heexConfig;
