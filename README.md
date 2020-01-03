S3 Bucket Listing
=================

Zero-dependency JS that provides a nice directory listing for some public S3 buckets. [Here's an example](http://public.nikhil.io).

### Usage

Create `s3-bucket-listing.config.json`. See `configs` for examples. Then drop these three files into an S3 bucket:

* `index.html`
* `s3-bucket-listing.css`
* `s3-bucket-listing.js`

I run this and [inline the styles and scripts](https://www.npmjs.com/package/inline-source-cli) to get a single file 🤗

```bash
inline-source --compress false --root ./ index.html > build.html
```
