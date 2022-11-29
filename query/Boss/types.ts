export type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = Omit<SignupPayload, "username">;

export type LoginReturnType = {
  jwt: string;
};

export interface IBossable {
  signup: (payload: SignupPayload) => Promise<string | undefined>;
  login: (payload: LoginPayload) => Promise<LoginReturnType | undefined>;
}
