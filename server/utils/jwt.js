import jsonwebtoken from "jsonwebtoken";
const { sign, verify } = jsonwebtoken;

export const createJwtToken = (data, privateKey) => sign(data, privateKey);

export const verfyJwtToken = (token, privateKey) =>
  verify(token, privateKey, (error, decodedData) => {
    if (!error) return decodedData;
  });
