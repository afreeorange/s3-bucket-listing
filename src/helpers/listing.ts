/** biome-ignore-all lint/style/noNonNullAssertion: Fuck it. */

/**
 * Request S3 for a listing from a bucket at the given prefix. Transform the
 * response into an object that's friendly and helpful and nice to our app as
 * it renders things 🤗
 *
 * That's what everything here does.
 */

const REQUIRED_CONFIG_KEYS = ["bucket", "prefix", "ignoreRegexes"] as const;

const OPTIONAL_CONFIG_KEYS = [
  "colorBackground",
  "colorForeground",
  "colorHighlight",
  "colorHover",
  "favicon",
  "ogImage",
  "deployDir",
  "pageTitle",
] as const;

const BUCKET_CONFIG_KEYS = [
  ...REQUIRED_CONFIG_KEYS,
  ...OPTIONAL_CONFIG_KEYS,
] as const;

export type BucketConfig = {
  [K in (typeof BUCKET_CONFIG_KEYS)[number]]: K extends `color${string}`
    ? string | undefined // If key starts with "color", make it optional-ish
    : K extends "ignoreRegexes"
    ? string[] // Specific type for the regex array
    : string; // Default for everything else
};

export type BucketListing = {
  truncated: boolean;
  folders: {
    name: string;
    path: string;
  }[];
  files: {
    name: string;
    path: string;
    size: number;
    lastModified: Date;
    eTag: string;
  }[];
  bucket: string;
  prefix: string;
  delimiter: string;
};

const createListing = (xmlListing: XMLDocument): BucketListing => {
  const ret: BucketListing = {
    bucket: xmlListing.querySelector("Name")?.textContent || "bucket", // This won't happen.
    delimiter: xmlListing.querySelector("Delimiter")?.textContent || "/",
    files: [],
    folders: [],
    prefix: xmlListing.querySelector("Prefix")?.textContent || "",
    truncated: xmlListing.querySelector("IsTruncated")?.textContent === "true",
  };

  // Files. `o` for Object
  for (const o of xmlListing.querySelectorAll("Contents")) {
    ret.files.push({
      name: o.querySelector("Key")!.textContent!.replace(ret.prefix, ""),
      path: o.querySelector("Key")!.textContent!,
      eTag: o.querySelector("ETag")!.textContent!,
      lastModified: new Date(o.querySelector("LastModified")!.textContent!),
      size: Number(o.querySelector("Size")!.textContent!),
    });
  }

  /**
   * Filter out the prefix. Leads to empty paths with blank prefixes.
   */
  ret.files = ret.files.filter((_) => _.path !== ret.prefix);

  // Folders. `p` for Prefix
  for (const p of xmlListing.querySelectorAll("CommonPrefixes > Prefix")) {
    ret.folders.push({
      name: p!.textContent!.replace(ret.prefix, ""),
      path: p!.textContent!,
    });
  }

  return ret;
};

export const fetchConfig = async () => {
  const req = await fetch("index.json");
  let config: BucketConfig;

  // Attempt to fetch and parse config
  if (!req.ok) {
    throw new Error("Could not fetch configuration.");
  }

  // Try to parse as JSON
  try {
    config = await req.json();
  } catch (e) {
    throw new Error(
      `Error parsing bucket configuration. Is it valid JSON? Error: ${e}`
    );
  }

  // Check for presence of required keys
  if (!REQUIRED_CONFIG_KEYS.every((k) => k in config)) {
    throw new Error("Error parsing configuration: missing keys.");
  }

  // Sanitize
  config = {
    ...config,
    bucket: config.bucket.trim(),
    prefix: config.prefix.trim(),
  };

  config = {
    ...config,

    bucket: config.bucket.endsWith("/")
      ? config.bucket.substring(0, config.bucket.length - 1)
      : config.bucket,

    // prefix: config.prefix.endsWith("/")
    //   ? config.prefix === "/"
    //     ? ""
    //     : config.prefix.substring(0, config.prefix.length - 1)
    //   : config.prefix,
  };

  // All done!
  return config;
};

export const fetchListing = async ({
  bucket,
  dummy,
  ignoreRegexes,
  prefix,
  deployDir,
}: BucketConfig & {
  dummy?: boolean;
}): Promise<BucketListing | null> => {
  const listing =
    bucket !== ""
      ? createListing(
          await new DOMParser().parseFromString(
            await (
              await fetch(
                !dummy
                  ? `https://s3.amazonaws.com/${bucket}?delimiter=/&prefix=${prefix}`
                  : "/dummy.xml"
              )
            ).text(),
            "application/xml"
          )
        )
      : null;

  if (ignoreRegexes && listing) {
    const regexes = ignoreRegexes.map((r) => new RegExp(r));
    listing.files = listing.files.filter(
      (f) => !regexes.some((r) => r.test(f.name))
    );
    listing.folders = listing.folders.filter(
      (f) => !regexes.some((r) => r.test(f.name))
    );
  }

  return listing;
};
