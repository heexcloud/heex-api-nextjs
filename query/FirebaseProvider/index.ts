import { type FirebaseConfig } from "root/heex.config";
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
  ThumbupCommentFnType,
} from "../types";

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  collectionName: process.env.FIRESTORE_COLLECTION_NAME,
} as FirebaseConfig;

export class FirebaseProvider implements IQueryable {
  firebaseApp: App | undefined;
  firestore: Firestore;
  firestoreCollectionName: string;

  constructor() {
    if (firebaseAdmin.apps.length === 0) {
      this.firebaseApp = initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
    }

    this.firestore = getFirestore(this.firebaseApp!);
    this.firestoreCollectionName = firebaseConfig.collectionName;
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
          createdAt: Date.now(),
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

      const _limit =
        limit && Number.isInteger(parseInt(limit, 10))
          ? parseInt(limit, 10)
          : 25;

      const _offset =
        offset && Number.isInteger(parseInt(offset, 10))
          ? parseInt(offset, 10)
          : 0;

      const query = this.firestore
        .collection(this.firestoreCollectionName)
        .where("clientId", "==", clientId)
        .where("pageId", "==", _pageId)
        .orderBy("createdAt", "desc");

      let snapshot;
      if (_offset > 0) {
        const alreadyFetched = await query.limit(_offset).get();
        const startAfter = alreadyFetched.docs[alreadyFetched.docs.length - 1];
        snapshot = await query.startAfter(startAfter).limit(_limit).get();
      } else {
        snapshot = await query.limit(_limit).get();
      }

      const comments: CommentType[] = snapshot.docs.map(
        (doc) => doc.data() as CommentType
      );

      return { comments };
    } catch (err) {
      console.log("err :>> ", err);
    }

    return { comments: [] };
  };

  getCommentCount: GetCommentCountFnType = async ({ clientId, pageId }) => {
    try {
      const _pageId =
        pageId === "/"
          ? pageId
          : pageId.slice(-1) === "/"
          ? pageId.slice(0, pageId.length - 1)
          : pageId;

      const ref = this.firestore
        .collection(this.firestoreCollectionName)
        .where("clientId", "==", clientId)
        .where("pageId", "==", _pageId)
        .count();
      const count = (await ref.get()).data() as unknown as number;

      return { count } as CommentCountReturnType;
    } catch (err) {
      console.log("err :>> ", err);
    }

    return { count: 0 } as CommentCountReturnType;
  };

  getCommentById: GetCommentByIdFnType = async (cid) => {
    try {
      const docRef = this.firestore
        .collection(this.firestoreCollectionName)
        .doc(typeof cid === "string" ? cid : cid.toString());
      const doc = (await docRef.get()).data();
      return doc as CommentType;
    } catch (err) {
      console.log("err :>> ", err);
    }
    return {} as CommentType;
  };
  thumbupComment: ThumbupCommentFnType = async ({ cid, likes }) => {
    try {
      const docRef = this.firestore
        .collection(this.firestoreCollectionName)
        .doc(cid);
      const doc = (await docRef.get()).data();

      // await docRef.update({ likes: doc.likes ? doc.likes + 1 : 1 })
      await docRef.update({ likes });

      return doc as CommentType;
    } catch (err) {}

    return {} as CommentType;
  };
}
