import slugify from "slugify";

export const getPagination = (params) => {
  const limit = 20;
  const page = Number(params.page) || 1;
  const skip = (page - 1) * limit;

  return { limit, skip };
};

export const createSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true
  });
};