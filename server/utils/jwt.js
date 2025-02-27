import jsonwebtoken from "jsonwebtoken";
const { sign, verify, decode } = jsonwebtoken;

export const createJwtToken = (data, privateKey, expiresIn = null) => {
  const options = {};
  if (expiresIn) options.expiresIn = expiresIn;
  return sign(data, privateKey, options);
};

export const verfyJwtToken = (token, privateKey) =>
  verify(token, privateKey, (error, decodedData) => {
    if (!error) return decodedData;
  });

export const decodeJwt = (token, privateKey) => decode(token);
