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
    const { clientId, comment, pageId, createdAt, tid } = payload || {};

    if (!payload || !comment || !clientId || !pageId) {
      return {} as CreateCommentReturnType;
    }

    try {
      // if tid , it's a reply
      if (tid) {
        // find the comment first,
        let thread: CommentType | undefined;
        let replies: Omit<CommentType, "replies">[];

        const threadRef = this.firestore
          .collection(this.firestoreCollectionName)
          .doc(tid);

        thread = (await threadRef.get()).data() as CommentType | undefined;
        if (thread === undefined) {
          throw new Error("it should find the comment");
        }

        replies = thread.replies || [];

        const replyObjectId = nanoid();

        const _pageId =
          pageId === "/"
            ? pageId
            : pageId.slice(-1) === "/"
            ? pageId.slice(0, pageId.length - 1)
            : pageId;

        replies.push({
          ...payload,
          pageId: _pageId,
          objectId: replyObjectId,
        });

        await threadRef.update({ replies });

        return {
          objectId: replyObjectId,
          createdAt: payload.createdAt,
        } as CreateCommentReturnType;
      }

      // else, add the comment as a thread

      const objectId = nanoid();
      const docRef = this.firestore
        .collection(this.firestoreCollectionName)
        .doc(objectId);

      const _pageId =
        pageId === "/"
          ? pageId
          : pageId.slice(-1) === "/"
          ? pageId.slice(0, pageId.length - 1)
          : pageId;

      await docRef.set({
        ...payload,
        pageId: _pageId,
        objectId,
      });

      return { objectId, createdAt } as CreateCommentReturnType;
    } catch (err) {
      console.log("err :>> ", err);
    }

    return {} as CreateCommentReturnType;
  };

  getComments: GetCommentsFnType = async (params) => {
    const { pageId, clientId, limit, offset } = params;
    if (!clientId || !pageId) {
      return { comments: [] };
    }
    try {
      const _pageId =
        pageId === "/"
          ? pageId
          : pageId.slice(-1) === "/"
          ? pageId.slice(0, pageId.length - 1)
          : pageId;

      const startAt =
        offset && Number.isInteger(parseInt(offset, 10))
          ? parseInt(offset, 10) + 1
          : 1;

      const _limit =
        limit && Number.isInteger(parseInt(limit, 10))
          ? parseInt(limit, 10)
          : 25;

      const snapshot = await this.firestore
        .collection(this.firestoreCollectionName)
        .where("clientId", "==", clientId)
        .where("pageId", "==", _pageId)
        .orderBy("createdAt", "desc")
        .startAt(startAt)
        .endAt(startAt - 1 + _limit)
        .get();

      const comments: CommentType[] = snapshot.docs.map(
        (doc) => doc.data() as CommentType
      );

      return { comments };
    } catch (err) {
      console.log("err :>> ", err);
    }

    return { comments: [] };
  };
  getCommentCount: GetCommentCountFnType = async ({ clientId, pageId }) => {};
  getCommentById: GetCommentByIdFnType = async (cid) => {};
  thumbupComment: ThumbupCommentFnType = async ({ cid, likes }) => {};
}
