# S3 Bucket Listing

Zero-dependency JS that provides a nice directory listing for some public S3 buckets. [Here's an example](http://public.nikhil.io).

## Usage

TODO: Finish this section

## Development

You will need [ParcelJS](https://parceljs.org/).

```bash
# Install dependencies
yarn

# Start development server
yarn start

# Build
yarn build

# Clean builds
yarn clean
```

### TODO

* [ ] "Directory" nodes must be alphabetized (and intelligently)
* [ ] Parcel output [must not have hashes](https://github.com/parcel-bundler/parcel/issues/5894) (or have a filename that can be excluded)
* [ ] Fix table sorting
* [ ] Support initial prefix
* [ ] Support installing in a prefix (not just the root prefix)
