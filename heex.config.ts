export enum DatabaseProvider {
  leancloud = "leancloud",
  firebase = "firebase",
  detaSh = "detaSh",
}

export type LeanCloudConfig = {
  appId: string;
  appKey: string;
  restApiServerUrl: string;
  leanStorageClass: string;
};

export type FirebaseConfig = {};

export type HeexConfig = {
  databaseProvider: DatabaseProvider;
  databaseConfig: LeanCloudConfig | FirebaseConfig;
};

const heexConfig: HeexConfig = {
  databaseProvider: DatabaseProvider.leancloud,
  databaseConfig: {
    appId: process.env.LEANCLOUD_APP_ID || "",
    appKey: process.env.LEANCLOUD_APP_KEY || "",
    restApiServerUrl: process.env.LEANCLOUD_REST_API_SERVER_URL || "",
    leanStorageClass: process.env.LEANCLOUD_LEAN_STORAGE_CLASS || "Comment",
  },
};

export default heexConfig;
