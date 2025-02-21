export const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

export const isValidPassword = (password) =>
  password.trim().length > 8 &&
  password.trim().length < 16 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);

export const isValidRole = (mapper, role) =>
  Object.values(mapper).includes(role);
