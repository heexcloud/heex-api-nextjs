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
    const { clientId, comment, pageId, email, username } = payload || {};

    if (!payload || !comment || !clientId || !pageId || !email || !username) {
      return {} as CreateCommentReturnType;
    }

    try {
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

      const _createdAt = payload.createdAt || Date.now();
      await docRef.set({
        clientId,
        clientName: payload.clientName || "",
        username,
        email,
        pageId: _pageId,
        comment,
        createdAt: _createdAt,
        objectId,
        likes: payload.likes || 0,
        tid: payload.tid || "", // empty string means this is a thread, otherwise, it's a reply
        rid: payload.rid || "", // rid is reply id, so, the newly created comment is a reply's reply
        at: payload.at || "",
        replies: [] as Omit<CommentType, "replies">[],
      });

      return { objectId, createdAt: _createdAt } as CreateCommentReturnType;
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
        .where("tid", "==", "")
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

      const queryReplies = this.firestore
        .collection(this.firestoreCollectionName)
        .where(
          "tid",
          "in",
          comments.map((c) => c.objectId)
        )
        .orderBy("createdAt", "desc");

      const replySnapshot = await queryReplies.get();

      if (replySnapshot.docs && replySnapshot.docs.length > 0) {
        const replies = replySnapshot.docs.map(
          (doc) => doc.data() as Omit<CommentType, "replies">
        );

        replies.forEach((reply) => {
          const index = comments.findIndex((c) => c.objectId === reply.tid);
          if (index > -1) {
            comments[index].replies?.push(reply);
          }
        });
      }

      return { comments } as GetCommentsReturnType;
    } catch (err) {
      console.log("err :>> ", err);
    }

    return { comments: [] } as GetCommentsReturnType;
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
        .where("tid", "==", "")
        .count();
      const count = (await ref.get()).data() as CommentCountReturnType;

      return count;
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
      const comment = (await docRef.get()).data() as CommentType;

      if (comment) {
        const repliesSnapshot = await this.firestore
          .collection(this.firestoreCollectionName)
          .where("tid", "==", comment.objectId)
          .orderBy("createdAt", "desc")
          .get();

        const replies = repliesSnapshot.docs.map(
          (r) => r.data() as CommentType
        );

        comment.replies = replies;
      }

      return comment;
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

      await docRef.update({ likes });
      const doc = (await docRef.get()).data();

      return doc as CommentType;
    } catch (err) {}

    return {} as CommentType;
  };
}
