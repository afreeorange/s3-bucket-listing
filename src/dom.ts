import u from "umbrellajs";
import { debounce } from "./helpers";
import Tablesort from "tablesort";

import { getBucketListing } from "./network";
import { Listing } from "./types";
import { DEBOUNCE_INTERVAL_IN_MS } from "./constants";

const inputListener = (
  { target: { value: term } }: any, // TODO: What's the correct type here?
  listing: Listing
): void => {
  if (term.length === 0) {
    return drawBucketListing(listing);
  }

  const _term = term.toLowerCase();
  const results = {
    ...listing,
    files: listing.files.filter((f) => f.name.toLowerCase().includes(_term)),
    folders: listing.folders.filter((f) =>
      f.name.toLowerCase().includes(_term)
    ),
  };

  return drawBucketListing(results);
};

export const updateDocumentMetaData = ({ bucket, prefix }: Listing) => {
  u("title").text(`${bucket}/${prefix ? prefix : ""}`);
  u("meta[property='og:title']").text(`${bucket}/${prefix ? prefix : ""}`);
};

const drawBucketListing = ({ bucket, prefix, files, folders }: Listing) => {
  // Only draw this when we're away from the root prefix.
  const topLink = prefix
    ? `
          <tr>
            <td>
              <strong>
                <a href="/">(top)</a>
              </strong>
            </td>
          </tr>
          `
    : "";

  u("h1 a").text(bucket);

  u("#folders tbody").html(
    [
      topLink,
      ...folders.map(
        (f) => `
            <tr>
              <td>
                <strong>
                  <a href="!#${f.name}">${f.name.replace(prefix, "")}
                  </a>
                </strong>
              </td>
            </tr>
          `
      ),
    ].join("")
  );

  // Don't display the table headings when JavaScript is disabled
  if (files.length > 0) {
    u("#files thead").html(`
          <tr>
            <th data-sort-default>Name</th>
            <th>Last Modified</th>
            <th>Size</th>
          </tr>
        `);
  } else {
    u("#files thead").html("");
  }

  u("#files tbody").html(
    files
      .filter((f) => f.name !== `${prefix}`)
      .map(
        (f) => `
              <tr>
                <td>
                  <a href="https://${bucket}/${f.name}">${f.name
          .replace(prefix, "")
          .replace("/", "")}</a>
                </td>
                <td data-sort="${f.lastModified}">
                  ${f.lastModifiedHuman} <span>${f.lastModified}</span>
                </td>
                <td data-sort="${f.size}">${f.sizeHuman}</td>
              </tr>
          `
      )
      .join("")
  );
};

export const drawDOM = async (bucket, prefix) => {
  let listing;

  try {
    listing = await getBucketListing(bucket, prefix);
  } catch (error) {
    u("h1 a").text("Uh oh... something went wrong 😔");
    u("#folders").html(error);
    u("#files").html("");

    throw Error("Something went wrong...");
  }

  document.querySelector("input").addEventListener(
    "keyup",
    // TODO: This blows up the bundle size!
    debounce((e) => inputListener(e, listing), DEBOUNCE_INTERVAL_IN_MS)
    // (e) => inputListener(e, listing)
  );

  drawBucketListing(listing);
  updateDocumentMetaData(listing);
  new Tablesort(document.getElementById("files"));
};
