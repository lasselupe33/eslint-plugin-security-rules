import readline from "readline";

import axios from "axios";

import { BackgroundResponse, FetchConfig } from "./fetch";

type Input = {
  url: string;
  config: FetchConfig;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", async (line) => {
  const { url, config } = JSON.parse(line) as Input;

  const response = await axios.request({
    ...config,
    validateStatus: () => true,
    url,
  });

  process.stdout.write(
    JSON.stringify({
      statusCode: response.status,
      data: response.data,
    } as BackgroundResponse<unknown>)
  );

  rl.close();
});

export {};
