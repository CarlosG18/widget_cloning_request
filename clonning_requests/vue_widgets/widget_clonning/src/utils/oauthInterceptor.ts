import OAuth from "oauth-1.0a";
import CryptoJS from "crypto-js";
import type { InternalAxiosRequestConfig } from "axios";

export interface OAuthCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  tokenSecret: string;
}

export function createOAuthInterceptor(credentials: OAuthCredentials) {
  const oauth = new OAuth({
    consumer: {
      key: credentials.consumerKey,
      secret: credentials.consumerSecret,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
    },
  });

  const token = {
    key: credentials.accessToken,
    secret: credentials.tokenSecret,
  };

  return (config: InternalAxiosRequestConfig) => {
    // Monta a URL completa para a assinatura do OAuth
    const url =
      config.baseURL && !config.url?.startsWith("http")
        ? new URL(config.url || "", config.baseURL).href
        : config.url || "";

    const requestData = {
      url: url,
      method: config.method?.toUpperCase() || "GET",
      data: config.data,
    };

    // Gera o header Authorization assinado
    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    config.headers.set("Authorization", authHeader["Authorization"]);

    return config;
  };
}
