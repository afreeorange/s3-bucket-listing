export type S3Prefix = {
  name: string;
};

export type S3Object = {
  name: string;
  lastModified: string;
  lastModifiedHuman: string;
  size: string;
  sizeHuman: string;
};

export type Listing = {
  folders: S3Prefix[];
  files: S3Object[];
  bucket: string;
  prefix: string;
};
