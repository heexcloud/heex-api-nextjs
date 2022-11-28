import { boss } from "root/query";

export const signup = async ({ username, email, password }) => {
  const result = await boss.password.signup({ username, email, password });
  if (result === undefined) {
    console.log("Register Boss failed");
  }
};
