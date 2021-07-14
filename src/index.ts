import { drawDOM } from "./dom";

(() => {
  const bucket = "lolzil.la";

  window.onload = () =>
    drawDOM(bucket, location.hash.substring(1).replace(/%20/g, " "));

  window.onhashchange = () =>
    drawDOM(bucket, location.hash.substring(1).replace(/%20/g, " "));
})();

//   const bootstrap = () => {
//     fetch("https://public.nikhil.io/s3-bucket-listing.config.json")
//   };
