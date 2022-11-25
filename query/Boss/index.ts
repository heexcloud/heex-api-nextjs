import { DatabaseProvider } from "root/heex.config";
import { IBossable } from "../types";
import { FirebaseProvider } from "./FirebaseProvider";
import { LeanCloudProvider } from "./LeanCloudProvider";

export class Boss {
  get databaseProvider(): IBossable {
    switch (process.env.DATABASE_PROVIDER) {
      case DatabaseProvider.leancloud:
        return new LeanCloudProvider();
      case DatabaseProvider.firebase:
        return new FirebaseProvider();
      default:
        console.error("Unsupported databaseProvider");
    }
    return {} as IBossable;
  }
}
