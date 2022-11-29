import { IBossable, LoginPayload, SignupPayload } from "../types";

export class LeanCloudProvider {
  async signup({ username, email, password }: SignupPayload) {}

  async login({ email, password }: LoginPayload) {}
}
