import { humanBytes, timeSince, xmlToJson } from "./helpers";
import { Listing, S3Object } from "./types";

const makeFileObject = (rawFileObject: any): S3Object => ({
  name: rawFileObject["Key"]["#text"],
  lastModified: rawFileObject["LastModified"]["#text"],
  lastModifiedHuman: timeSince(rawFileObject["LastModified"]["#text"]),
  size: rawFileObject["Size"]["#text"],
  sizeHuman: humanBytes(rawFileObject["Size"]["#text"]),
});

/**
 * Just get the listing.
 *
 * @param bucket
 * @param delimiter
 * @param prefix
 * @returns
 */
const getListingText = async (
  bucket: string,
  prefix: string | null = "",
  delimiter: string = "/"
): Promise<string> =>
  await (
    await fetch(
      `https://s3.amazonaws.com/${bucket}?delimiter=${delimiter}&prefix=${prefix}`
    )
  ).text();

/**
 * Turn the raw listing text (which is unparsed XML) to JSON
 * @param listingText
 * @returns
 */
const turnListingToJSON = (listingText: string): Object =>
  xmlToJson(new DOMParser().parseFromString(listingText, "application/xml"));

/**
 * Create a `Listing` object we can parse
 *
 * @param rawListingObject
 * @returns
 */
const createListing = (rawListingObject: Object): Listing => {
  let folders = [];
  try {
    folders = rawListingObject["ListBucketResult"]["CommonPrefixes"].map(
      (p) => ({
        name: p["Prefix"]["#text"],
      })
    );
  } catch (error) {
    console.info("No folders at this prefix");
  }

  let files = [];
  try {
    /**
     * We do this check because the XML -> JSON function returns an object if
     * there is only one child in a sub-tree and an array if there are more
     * than one (and I am too lazy to modify the original function.)
     */
    if (Array.isArray(rawListingObject["ListBucketResult"]["Contents"])) {
      files = rawListingObject["ListBucketResult"]["Contents"].map((p) =>
        makeFileObject(p)
      );
    } else {
      files.push(
        makeFileObject(rawListingObject["ListBucketResult"]["Contents"])
      );
    }
  } catch (error) {
    console.info("No files at this prefix");
  }

  let prefix;
  try {
    prefix = rawListingObject["ListBucketResult"]["Prefix"]["#text"];
  } catch (error) {
    prefix = "";
  }

  return {
    folders,
    files,
    bucket: rawListingObject["ListBucketResult"]["Name"]["#text"],
    prefix,
  };
};

/**
 * Put everything together here.
 *
 * @param bucket S3 bucket to fetch a listing for
 * @returns An object of type `Listing` that has the files and folders at that
 *  prefix.
 */
export const getBucketListing = async (
  bucket: string,
  prefix: string | null = "",
  delimiter: string = "/"
): Promise<Listing> =>
  createListing(
    turnListingToJSON(await getListingText(bucket, prefix, delimiter))
  );
