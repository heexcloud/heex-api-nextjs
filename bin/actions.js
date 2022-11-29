import { boss } from "../query";

// !ATTENTION: this is not working
export const signup = async ({ username, email, password }) => {
  const result = await boss.databaseProvider.signup({
    username,
    email,
    password,
  });
  if (result === undefined) {
    console.log("Register Boss failed");
  }

  console.log("Register Boss success!");
};
