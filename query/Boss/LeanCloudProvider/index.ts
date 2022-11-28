import { IBossable, LoginPayload, SignupPayload } from "../types";

export class LeanCloudProvider implements IBossable {
  async signup({ username, email, password }: SignupPayload) {}

  async login({ email, password }: LoginPayload) {}
}
