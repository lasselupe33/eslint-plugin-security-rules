export type SanitationOptions = {
  sanitation: {
    package: string;
    method: string;
    usage: string;
  };
};

export type NoXssOptions = [SanitationOptions];
