import jsonwebtoken from "jsonwebtoken";
import { backend, frontend } from "../constants/config.js";
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

export const decodeJwt = (token) => decode(token);

export const createJwtEmailVerificationLink = (data) =>
  `${frontend}/auth/verify/${generateJwt(
    data,
    process.env.JWT_VERIFY_USER_KEY
  )}`;

export const createJwtInvitationLink = (data) =>
  `${frontend}/auth/team-invite/${generateJwt(
    data,
    process.env.JWT_CLIENT_INVITE_KEY,
    "7d"
  )}`;

export const createNextPageToken = (
  itemId = null,
  pageSize = 0,
  skipCount = 0
) => {
  if (!skipCount)
    return generateJwt(
      { itemId, skipCount: pageSize },
      process.env.JWT_PAGE_TOKEN_KEY
    );
  return generateJwt(
    { itemId, skipCount: skipCount + pageSize },
    process.env.JWT_PAGE_TOKEN_KEY
  );
};
