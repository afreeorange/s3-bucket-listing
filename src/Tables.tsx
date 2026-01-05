/** biome-ignore-all lint/style/noNonNullAssertion: Fuck it */
import type { Accessor, Resource } from "solid-js";
import type { BucketConfig, BucketListing } from "./helpers/listing";
import humanSize from "./helpers/filesize";
import { timeAgo } from "./helpers/time";

export const Folders = ({
  listing,
  config,
}: {
  listing: Resource<BucketListing | null>;
  config: Accessor<BucketConfig | null>;
}) => (
  <table data-listing="folders">
    <thead>
      <tr>
        <th data-label="name">
          {(listing()?.folders.length ?? 0) > 1 ? "Folders" : "Folder"}
        </th>
      </tr>
    </thead>
    <tbody>
      {listing()?.folders.map((_) => (
        <tr>
          <td colspan={3}>
            <strong>
              <a
                href={`/${
                  config()?.deployDir ? `${config()?.deployDir}/` : ""
                }#/${_.path}`}
                title={`View the contents of the folder named '${_.name}'`}
              >
                {_.name}
              </a>
            </strong>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const Files = ({
  listing,
  ref,
}: {
  listing: Resource<BucketListing | null>;
  ref?: HTMLTableElement;
}) => (
  <table data-listing="files" ref={ref}>
    <thead>
      <tr>
        <th data-label="name">File</th>
        <th data-label="last-modified">Last Modified</th>
        <th data-label="size">Size</th>
        <th data-label="short-summary">Age,Size</th>
      </tr>
    </thead>
    <tbody>
      {listing()?.files.map((_) => (
        <tr>
          <td data-label="name">
            <span>
              <a href={`/${_.path}`}>{_.name}</a>
            </span>
          </td>
          <td data-sort={_.lastModified.getTime()} data-label="last-modified">
            <span>{timeAgo(_.lastModified)}</span>{" "}
            <time>{_.lastModified.toUTCString()}</time>
          </td>
          <td data-sort={_.size} data-label="size">
            {humanSize(_.size, {
              binary: true,
              maximumFractionDigits: 0,
            })}
          </td>
          <td data-label="short-summary">
            {timeAgo(_.lastModified, true)},
            {humanSize(_.size, {
              binary: true,
              maximumFractionDigits: 0,
            }).replace(" ", "")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
