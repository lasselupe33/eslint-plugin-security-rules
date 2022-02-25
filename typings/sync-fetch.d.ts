declare module "sync-fetch" {
  function fetch<T>(
    input: RequestInfo,
    init?: RequestInit & { timeout: number }
  ): Omit<Response, "json" | "text"> & {
    json: () => T;
    text: () => string;
  };

  export = fetch;
}
