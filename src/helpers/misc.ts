import type { Resource, Setter } from "solid-js";
import type { BucketListing } from "./listing";

export const createCountString = (listing: Resource<BucketListing | null>) => {
  const folders = listing()?.folders.length
    ? `${listing()?.folders.length} ${
        listing()?.folders.length === 1 ? "folder" : "folders"
      }`
    : "";

  const files = listing()?.files.length
    ? `${listing()?.files.length} ${
        listing()?.files.length === 1 ? "file" : "files"
      }`
    : "";

  const join = folders.length >= 1 && files.length >= 1 ? " & " : "";

  return `${folders}${join}${files}`;
};

/**
 * Maps a URI fragment (/bar) to its relative path (/foo/lol/bar)
 */
export const getFragmentPaths = () => {
  const a = window.location.hash
    .split("/")
    .slice(1)
    .filter((_) => _.trim() !== "");

  const b = window.location.hash
    .split("/")
    .slice(1)
    .filter((_) => _.trim() !== "")
    .reduce<string[]>((acc, curr) => {
      const prev = acc.length > 0 ? acc[acc.length - 1] : "";

      acc.push(prev ? `${prev}/${curr}` : curr);

      return acc;
    }, []);

  return a.map((key, i) => [key, b[i]]);
};

export const inputListener = (
  {
    currentTarget: { value: term },
  }: KeyboardEvent & { currentTarget: HTMLInputElement },
  listing: Resource<BucketListing | null>,
  setListing: Setter<BucketListing | null | undefined>
): void => {
  const data = listing();
  if (!data) {
    return;
  }

  const _term = term.trim().toLowerCase();

  if (_term.length === 0) {
    setListing(data);
    return;
  }

  setListing({
    ...data,
    files: data.files.filter((f) => f.name.toLowerCase().includes(_term)),
    folders: data.folders.filter((f) => f.name.toLowerCase().includes(_term)),
  });
};
