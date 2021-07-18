# S3 Bucket Listing

Provides a nice directory listing for some public S3 buckets. [Here's an example](https://public.nikhil.io).

## Usage

Look in `configs` and create a similar configuration (and remove the others.) To add an OpenGraph image for nice previews, see `assets/` for an editable [Acorn](https://flyingmeat.com/acorn/) version. See `src/` for CSS you can customize. It's all very simple 🤗

## Development

You will need [ParcelJS](https://parceljs.org/).

```bash
# Install dependencies
yarn

# Start development server. This will use `configs/env.local`
yarn start

# Build the local project
yarn build:local

# Build all projects prefixed with `env` in `configs`
yarn build:all

# Clean all builds
yarn clean
```

### TODO

* [ ] Proper typing and comments
* [ ] "Directory" nodes must be alphabetized (and intelligently)
* [ ] Parcel output [must not have hashes](https://github.com/parcel-bundler/parcel/issues/5894) (or have a filename that can be excluded)
* [ ] Fix table sorting
* [ ] Support initial prefix
* [ ] Support installing in a prefix (not just the root prefix)
* [ ] Rounded input corners on mobile 🤦‍♀️
* [ ] Footer with link to project
* [ ] PostHTML expressions for env var interpolation: title and description
