import { execSync } from "child_process";
import fs from "fs";
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
    const file = fs.existsSync(path.join(__dirname, "background.js"))
      ? path.join(__dirname, "background.js")
      : // When run with jest, then files will be resolved relative to the source
        // folder, however the background script will always only exist in the
        // lib folder.
        path.join(
          __dirname,
          "..",
          "..",
          "..",
          "lib",
          "utils",
          "sync-fetch",
          "background.js"
        );

    const res = execSync(`node ${file}`, {
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
