import { drawDOM } from "./dom";
import { DEFAULT_BUCKET, DEFAULT_PREFIX } from "./constants";

(async () => {
  const bucket = process.env.BUCKET || DEFAULT_BUCKET;

  window.onload = () =>
    drawDOM(bucket, location.hash.substring(1).replace(/%20/g, " "));

  window.onhashchange = () =>
    drawDOM(bucket, location.hash.substring(1).replace(/%20/g, " "));
})();
