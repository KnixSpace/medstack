import jsonwebtoken from "jsonwebtoken";
const { sign, verify, decode } = jsonwebtoken;

export const generateJwt = (data, privateKey, expiresIn = null) => {
  const options = {};
  if (expiresIn) options.expiresIn = expiresIn;
  return sign(data, privateKey, options);
};

export const verifyJwt = (token, privateKey) =>
  verify(token, privateKey, (error, decodedData) => {
    if (!error) return decodedData;
  });

export const decodeJwt = (token, privateKey) => decode(token);
