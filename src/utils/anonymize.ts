export const anonymizeKey = (apiKey: string) =>
  `******${apiKey.substr(apiKey.length - 10)}`;
