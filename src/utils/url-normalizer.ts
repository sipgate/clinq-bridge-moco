export const urlNormalize = (url: string) => {
  return url.endsWith("/") ? url.slice(0, -1) : url;
};
