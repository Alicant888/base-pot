import { fallback, http } from "viem";

export function createRpcTransport(urls: string[]) {
  const uniqueUrls = [...new Set(urls.map((url) => url.trim()).filter(Boolean))];

  if (uniqueUrls.length === 0) {
    return http();
  }

  if (uniqueUrls.length === 1) {
    return http(uniqueUrls[0]);
  }

  return fallback(uniqueUrls.map((url) => http(url)));
}
