import { Link, Meta, Title } from "@solidjs/meta";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import packageJson from "../package.json";
import { fetchConfig, fetchListing } from "./helpers/listing";
import {
  createCountString,
  filterListing,
  getFragmentPaths,
} from "./helpers/misc";
import Tablesort from "./helpers/sort";
import { Files, Folders } from "./Tables";

import "./App.css";

const App = () => {
  /**
   * ----------- URI/Hash Changes -----------
   */
  const { hash } = window.location;
  const [location, setLocation] = createSignal(hash.slice(1) || "/");

  const handleHashChange = () => {
    setLocation(window.location.hash.slice(1) || "/");
  };

  window.addEventListener("hashchange", handleHashChange);
  onCleanup(() => window.removeEventListener("hashchange", handleHashChange));

  /**
   * ----------- Bucket Configuration -----------
   */

  const [configError, setConfigError] = createSignal<Error | null>(null);
  const [config] = createResource(async () => {
    try {
      return await fetchConfig();
    } catch (e) {
      setConfigError(e as Error);
      return null;
    }
  });

  // Derive the current prefix from config + location
  const currentPrefix = createMemo(() => {
    const cfg = config();
    if (!cfg) return null;
    return location() === "/" ? cfg.prefix : location().replace("/", "");
  });

  // Config with current prefix for fetching listing
  const configWithPrefix = createMemo(() => {
    const cfg = config();
    const prefix = currentPrefix();
    if (!cfg || prefix === null) return null;
    return { ...cfg, prefix };
  });

  /**
   * ----------- Bucket Listing -----------
   */

  // Fetch listing based on config with prefix
  const [listing] = createResource(configWithPrefix, fetchListing);

  /**
   * ----------- Search -----------
   */
  const [searchTerm, setSearchTerm] = createSignal("");

  // Reset search when listing changes
  createEffect(() => {
    listing();
    setSearchTerm("");
  });

  // Filtered listing based on search term
  const cachedListing = createMemo(() =>
    filterListing(searchTerm(), listing()),
  );

  /**
   * ----------- Table Sorting -----------
   */
  let filesTable: HTMLTableElement | undefined;

  createEffect(() => {
    if (cachedListing()?.files.length && filesTable) {
      new Tablesort(filesTable);
    }
  });

  /**
   * ----------- Loading and Error States -----------
   */

  const isLoading = () => config.loading || listing.loading;
  const hasError = () => configError() || listing.error;

  /**
   * ----------- Now the fun part: Draw things! 🎨 -----------
   */

  return (
    <>
      <Title>{config()?.bucket}</Title>

      <Show when={config()?.favicon}>
        <Link rel="favicon" href={config()?.favicon} />
      </Show>

      <Show when={config()?.ogImage}>
        <Meta property="og:image" content={config()?.ogImage} />
      </Show>

      <div
        classList={{
          wrapper: true,
          loading: isLoading(),
          error: Boolean(hasError()),
        }}
        style={{
          "--color-background": config()?.colorBackground ?? undefined,
          "--color-foreground": config()?.colorForeground ?? undefined,
          "--color-highlight": config()?.colorHighlight ?? undefined,
          "--color-hover": config()?.colorHover ?? undefined,
        }}
      >
        <header>
          <h1>
            <Switch>
              <Match when={isLoading()}>
                <listing-loading>loading</listing-loading>
              </Match>
              <Match when={hasError()}>
                <span>Oh no.</span>
              </Match>
              <Match when={config()}>
                <a href="/" title="Go to the root of this bucket">
                  {config()?.bucket}
                </a>
                {getFragmentPaths().map(([fragment, path]) => (
                  <>
                    <em>/</em>
                    <a href={`#/${path}/`}>{fragment}</a>
                  </>
                ))}
              </Match>
            </Switch>
          </h1>
        </header>

        <main>
          <Switch>
            <Match when={hasError()}>
              <typical-message>
                <h2>Something terrible happened. Sorry.</h2>
                {/* <p>{configError()?.message || listing.error?.message}</p> */}
              </typical-message>
            </Match>

            <Match when={!isLoading() && listing() && config()}>
              <Show when={listing()?.truncated}>
                <truncated-listing>
                  This is a truncated listing.
                </truncated-listing>
              </Show>

              <Switch>
                <Match
                  when={
                    cachedListing()?.files.length === 0 &&
                    cachedListing()?.folders.length === 0 &&
                    searchTerm().length === 0
                  }
                >
                  <typical-message>
                    <h2>Nothing at that path&hellip;</h2>
                  </typical-message>
                </Match>

                <Match
                  when={
                    cachedListing()?.folders.length === 1 &&
                    cachedListing()?.folders[0].name === "/"
                  }
                >
                  <typical-message>
                    <a
                      href={`/${
                        config()?.deployDir ? `${config()?.deployDir}/` : ""
                      }#/${cachedListing()?.folders[0].path}`}
                      title="Go here instead"
                    >
                      Go here instead
                    </a>
                    .
                  </typical-message>
                </Match>

                <Match when={true}>
                  <search-listing>
                    <input
                      autofocus
                      placeholder={`search ${createCountString(listing)}`}
                      type="search"
                      value={searchTerm()}
                      onInput={(e) => setSearchTerm(e.currentTarget.value)}
                    />
                  </search-listing>
                </Match>
              </Switch>

              <Show
                when={
                  cachedListing()?.folders.length &&
                  cachedListing()?.folders[0].name !== "/"
                }
              >
                <Folders
                  listing={cachedListing}
                  config={() => config() ?? null}
                />
              </Show>

              <Show when={cachedListing()?.files.length}>
                <Files listing={cachedListing} ref={filesTable} />
              </Show>
            </Match>
          </Switch>
        </main>

        <footer>
          <a
            href="https://github.com/afreeorange/s3-bucket-listing"
            title="View this listing's source code on Github"
          >
            <span>v{packageJson.version}</span>
          </a>
        </footer>
      </div>
    </>
  );
};

export default App;
