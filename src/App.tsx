/** biome-ignore-all lint/style/useTemplate: Don't care */
/** biome-ignore-all lint/style/noNonNullAssertion: Don't care */

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
import {
  type BucketListing,
  fetchConfig,
  fetchListing,
} from "./helpers/listing";
import {
  createCountString,
  getFragmentPaths,
  inputListener,
} from "./helpers/misc";
import Tablesort from "./helpers/sort";
import { Files, Folders } from "./Tables";

import "./App.css";

const App = () => {
  /**
   * Location signal for hash-based routing
   */
  const [location, setLocation] = createSignal(
    window.location.hash.slice(1) || "/",
  );

  const handleHashChange = () => {
    setLocation(window.location.hash.slice(1) || "/");
  };

  window.addEventListener("hashchange", handleHashChange);
  onCleanup(() => window.removeEventListener("hashchange", handleHashChange));

  /**
   * Fetch config as a resource
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

  // Log config errors
  createEffect(() => {
    if (configError()) {
      console.error("Config error:", configError()?.message);
    }
  });

  /**
   * Derive the current prefix from config + location
   */
  const currentPrefix = createMemo(() => {
    const cfg = config();
    if (!cfg) return null;
    return location() === "/" ? cfg.prefix : location().replace("/", "");
  });

  /**
   * Config with current prefix for fetching listing
   */
  const configWithPrefix = createMemo(() => {
    const cfg = config();
    const prefix = currentPrefix();
    if (!cfg || prefix === null) return null;
    return { ...cfg, prefix };
  });

  /**
   * Fetch listing based on config with prefix
   */
  const [listing] = createResource(configWithPrefix, fetchListing);

  // Log listing errors
  createEffect(() => {
    if (listing.error) {
      console.error("Listing error:", listing.error?.message ?? listing.error);
    }
  });

  /**
   * Cached listing for search filtering
   */
  const [cachedListing, setCachedListing] = createSignal<
    BucketListing | null | undefined
  >(undefined);

  createEffect(() => {
    setCachedListing(listing());
  });

  /**
   * Derived loading/error states
   */
  const isLoading = () => config.loading || listing.loading;
  const hasError = () => configError() || listing.error;

  /**
   * Table sorting
   */
  let filesTable: HTMLTableElement | undefined;

  createEffect(() => {
    if (cachedListing()?.files.length && filesTable) {
      new Tablesort(filesTable);
    }
  });

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
                    cachedListing()?.folders.length === 0
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
                        config()?.deployDir ? config()?.deployDir + "/" : ""
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
                      onkeyup={(
                        e: KeyboardEvent & { currentTarget: HTMLInputElement },
                      ) => inputListener(e, listing, setCachedListing)}
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
                <Folders listing={listing} config={() => config()!} />
              </Show>

              <Show when={cachedListing()?.files.length}>
                <Files listing={listing} ref={filesTable} />
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
