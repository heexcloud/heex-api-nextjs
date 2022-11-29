import { IBossable, SignupPayload, LoginPayload } from "../types";
import { type FirebaseConfig } from "root/heex.config";
import firebaseAdmin from "firebase-admin";
import { App, initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { SignupErrorMessage } from "../constants";

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  collectionName: process.env.FIRESTORE_HEEX_BOSS_COLLECTION,
} as FirebaseConfig;

export class FirebaseProvider implements IBossable {
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
  async signup({ username, email, password }: SignupPayload) {
    try {
      const snapshot = await this.firestore
        .collection(this.firestoreCollectionName)
        .get();
      if (snapshot.size > 0) {
        throw new Error(SignupErrorMessage);
      }

      const bossId = nanoid();
      const docRef = this.firestore
        .collection(this.firestoreCollectionName)
        .doc(bossId);
      const passwordHash = await argon2.hash(password);
      await docRef.set({
        bossId,
        username,
        email,
        password: passwordHash,
        createdAt: Date.now(),
      });

      const token = jwt.sign(
        {
          username,
          email,
          bossId: bossId,
          expiresIn: "14d",
        },
        process.env.JWT_BOSS_TOKEN_SECRET!
      );

      return { token };
    } catch (err) {
      console.error("err :>> ", err);
      return (err as any).message;
    }
  }

  async login({ email, password }: LoginPayload) {
    try {
      const bossRef = this.firestore
        .collection(this.firestoreCollectionName)
        .where("email", "==", email);

      const snapshot = await bossRef.get();
      if (snapshot.docs.length !== 1) {
        throw new Error(`Boss already exists for ${email}`);
      }

      const boss = snapshot.docs[0].data();

      const match = await argon2.verify(boss.password, password);

      if (match) {
        const token = jwt.sign(
          {
            username: boss.username,
            email: boss.email,
            bossId: boss.bossId,
            expiresIn: "14d",
          },
          process.env.JWT_BOSS_TOKEN_SECRET!
        );
        return { token };
      }
    } catch (err) {
      console.error("err :>> ", err);
    }
  }
}
