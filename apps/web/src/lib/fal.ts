import * as fal from "@fal-ai/serverless-client";
 
fal.config({
  proxyUrl: "/api/bots/images",
});

export const falClient = fal;