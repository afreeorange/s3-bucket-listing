import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "truncated-listing": JSX.HTMLAttributes<HTMLElement>;
      "search-listing": JSX.HTMLAttributes<HTMLElement>;
      "typical-message": JSX.HTMLAttributes<HTMLElement>;
      "listing-loading": JSX.HTMLAttributes<HTMLElement>;
    }
  }
}
