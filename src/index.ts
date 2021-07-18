import { drawDOM } from "./dom";
import { DEFAULT_BUCKET, DEFAULT_PREFIX } from "./constants";
import { BucketConfiguration } from "./types";

(async () => {
  const bucket = process.env.BUCKET || DEFAULT_BUCKET;
  const prefix = process.env.PREFIX || DEFAULT_PREFIX;

  window.onload = () =>
    drawDOM(bucket, prefix);

  window.onhashchange = () =>
    drawDOM(bucket, location.hash.substring(1).replace(/%20/g, " "));
})();
