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

export type FirebaseConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  collectionName: string;
};
