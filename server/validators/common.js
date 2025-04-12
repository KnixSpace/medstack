export const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

export const isValidPassword = (password) =>
  password.trim().split(/\s+/).length === 1 &&
  password.trim().length > 8 &&
  password.trim().length < 16 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);

export const isValidRole = (mapper, role) =>
  Object.values(mapper).includes(role);

export const isValidQueries = (querystring, validQueries = []) => {
  const query = Object.fromEntries(
    querystring.split("&").map((q) => q.split("="))
  );

  if (!Object.keys(query).every((q) => validQueries.includes(q))) {
    return null;
  }
  return query;
};

export const isValidImageUrl = (url) =>
  /^https:\/\/res\.cloudinary\.com\/([a-zA-Z0-9_-]+)\/image\/upload(\/[a-zA-Z0-9_-]+)*\/([a-zA-Z0-9_-]+)\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|ico)$/i.test(
    url.trim()
  );
