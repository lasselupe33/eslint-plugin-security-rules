import { execSync } from "child_process";
import path from "path";

import { AxiosRequestHeaders } from "axios";

export type FetchConfig = {
  method: "GET" | "POST";
  headers?: AxiosRequestHeaders;
  data?: Record<string, unknown>;
  timeout: number;
};

export type BackgroundResponse<T> = {
  statusCode: number;
  data: T;
};

/**
 * Allows fetching data from an external resource synchronously using a
 * background thread.
 *
 * This is required when using ESLint since rule implementations cannot be
 * async.
 */
export function syncFetch<T>(url: string, config: FetchConfig): T | undefined {
  try {
    const res = execSync(`node ${path.join(__dirname, "background.js")}`, {
      encoding: "utf8",
      input: JSON.stringify({
        url,
        config,
      }),
    });

    const { statusCode, data } = JSON.parse(res) as BackgroundResponse<T>;

    if (statusCode < 200 || statusCode > 299) {
      console.warn(statusCode, data);

      return undefined;
    }

    return data;
  } catch (err) {
    console.warn(err);

    return undefined;
  }
}
