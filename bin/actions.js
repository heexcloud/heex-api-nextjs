const signup = async ({ username, email, password }) => {
  try {
    const passwordHash = await argon2.hash(password);
    console.log("passwordHash :>> ", passwordHash);
  } catch (err) {
    //...
  }
};

module.exports = {
  signup,
};
