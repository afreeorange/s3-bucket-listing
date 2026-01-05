# S3 Bucket Listing

Provides a nice directory listing for some public S3 buckets I have. [Here's an example](https://public.nikhil.io). Download the latest build via:

```bash
wget https://public.nikhil.io/index.html
```

## Development

```bash
# Install dependencies
pnpm i

# Start dev server
pnpm dev

# Check and Fix
pnpm check
pnpm fix

# Build. Deployable is dist/index.html
pnpm build
```

## Deployment

Copy `index.html` to some bucket and configure `index.json`. Here's the bare, required config:

```json
{
  "bucket": "foo.nikhil.io",
  "prefix": "",
  "ignoreRegexes": []
}
```

Here's a full example. It loads objects from a prefix other than the root prefix, is deployed at a prefix other than the root, and customizes colors, images, and the page title.

```json
{
  "bucket": "foo.nikhil.io",
  "prefix": "things/",
  "ignoreRegexes": [],
  "colorBackground": "darkblue",
  "colorForeground": "white",
  "colorHighlight": "#336699",
  "colorHover": "#ff3300",
  "favicon": "/my-favicon.png", // Default is /favicon.ico
  "ogImage": "/og-image.foobar.png", // Default is /og-image.png
  "deployDir": "list",
  "pageTitle": "My Bucket"
}
```

- The `ignoreRegexes` should not contain `/` delimiters.
- If you want to show the root prefix, set `prefix` to an empty string (i.e. `""`)
- To deploy to a folder other than the bucket root, set `deployDir` (no trailing slashes).
- `index.json` must be co-located with `index.html`
- `prefix` needs to be an empty string if root. Must end in `/` if not.

### TODO

- [ ] Debounce?
- [x] Errors
- [x] Loading
- [x] `grep -v` for listing
- [x] 404
- [x] Customizable colors
- [x] Deal with truncated listings. You always get 1,000 keys.
- [x] Favicon
- [x] Filter/Search
- [x] OG Image
- [x] Responsive
- [x] Segments
- [x] Sort
- [x] Track changes to routes

## References, Resources

- [Tailwind Colors](https://tailwindcss.com/docs/colors)
- [S3 ListObjects Request Syntax](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html#API_ListObjects_RequestSyntax)
- [IBM Workplace Design](https://www.ibm.com/design/workplace/interior-architecture/color/)
- [Awesome SolidJS](https://github.com/one-aalam/awesome-solid-js?tab=readme-ov-file#helpers)

## License

MIT
