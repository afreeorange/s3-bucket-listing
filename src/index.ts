import { drawDOM } from "./dom";
import { DEFAULT_BUCKET, DEFAULT_PREFIX } from "./constants";

(async () => {
  const bucket = process.env.BUCKET || DEFAULT_BUCKET;
  const prefix = process.env.PREFIX;

  const initialPrefix = prefix
    ? prefix
    : location.hash.substring(1).replace(/%20/g, " ");

  window.onload = () => drawDOM(bucket, initialPrefix);

  window.onhashchange = () =>
    drawDOM(bucket, location.hash.substring(1).replace(/%20/g, " "));
})();
