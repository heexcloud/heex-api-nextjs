import firebaseAdmin from "firebase-admin";
import { App, initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import {
  CreateCommentFnType,
  CreateCommentReturnType,
  GetCommentCountFnType,
  CommentCountReturnType,
  GetCommentsFnType,
  GetCommentsReturnType,
  GetCommentByIdFnType,
  CommentType,
  IQueryable,
  GetCommentByIdReturnType,
  ThumbupCommentFnType,
} from "../types";

export class FirebaseProvider implements IQueryable {
  firebaseApp: App;
  serviceAccount: JSON;
  firestore: Firestore;
  firestoreCollectionName: string;

  constructor() {
    this.serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
    this.firebaseApp = initializeApp(
      // @ts-ignore
      firebaseAdmin.credential.cert(this.serviceAccount)
    );
    this.firestore = getFirestore(this.firebaseApp);
    this.firestoreCollectionName = process.env.FIRESTORE_COLLECTION_NAME!;
  }

  createComment: CreateCommentFnType = async (payload) => {
    const {
      clientId,
      clientName,
      email,
      username,
      comment,
      pageId,
      createdAt,
    } = payload || {};

    if (!payload || !comment || !clientId || !pageId) {
      return {} as CreateCommentReturnType & CommentCountReturnType;
    }

    try {
      const objectId = nanoid();
      const docRef = this.firestore
        .collection(this.firestoreCollectionName)
        .doc(objectId);

      const _pageId =
        pageId === "/"
          ? pageId
          : pageId[pageId.length - 1] === "/"
          ? pageId.slice(0, pageId.length - 1)
          : pageId;

      await docRef.set({
        email,
        username,
        comment,
        clientId,
        clientName,
        pageId: _pageId,
        createdAt,
        objectId,
      });

      return { objectId, createdAt } as CreateCommentReturnType;
    } catch (err) {
      console.log("err :>> ", err);
    }

    return {} as CreateCommentReturnType;
  };

  getComments: GetCommentsFnType = async (params) => {};
  getCommentCount: GetCommentCountFnType = async ({ clientId, pageId }) => {};
  getCommentById: GetCommentByIdFnType = async (cid) => {};
  thumbupComment: ThumbupCommentFnType = async ({ cid, likes }) => {};
}
