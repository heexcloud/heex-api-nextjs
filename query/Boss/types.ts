export type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = Omit<SignupPayload, "username">;

export type LoginReturnType = {
  token: string;
};

export interface IBossable {
  signup: (payload: SignupPayload) => Promise<{ token: string } | string>;
  login: (payload: LoginPayload) => Promise<LoginReturnType | undefined>;
}
