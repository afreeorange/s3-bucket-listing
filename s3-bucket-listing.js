(() => {
    const DO_NOT_RENDER = [
        "index.html",
        "s3-bucket-listing.config.json",
        "s3-bucket-listing.js",
        "s3-bucket-listing.css"
    ];
    const S3_ATTRIBUTES_OF_INTEREST = ["Key", "Size", "LastModified"];
    const SORT_KEY = S3_ATTRIBUTES_OF_INTEREST[2];
    const TITLE_REGEX = /(.*)\s\-\s(.*)/;

    const humanBytes = bytes => {
        const sizes = ["bytes", "KiB", "MiB", "GiB", "TiB"];
        if (bytes == 0) {
            return 0;
        }
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    };

    const timeSince = date => {
        let _date = date;
        let secondsElapsed = 0;
        const now = new Date();
        const intervals = {
            year: 31536000,
            month: 2592000,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        let intervalType = "";
        let intervalTypePlural = "";
        let intervalsElapsed = 0;

        if (typeof date !== "object") {
            _date = new Date(date);
        }

        secondsElapsed = Math.floor((now - _date) / 1000);

        for (interval in intervals) {
            intervalsElapsed = Math.floor(secondsElapsed / intervals[interval]);
            if (intervalsElapsed >= 1) {
                intervalType = interval;
                break;
            }
        }

        console.log(intervalsElapsed)

        if (intervalsElapsed > 1) {
            intervalTypePlural = "s";
        }

        return `${intervalsElapsed} ${intervalType}${intervalTypePlural} ago`;
    };

    /**
     * TODO: Raise an `Error` when key is not in object...
     */
    const sortObjectByKey = (obj, key = "Key", desc = true) => {
        return obj.sort((a, b) => {
            if (a[key] < b[key]) {
                return desc ? -1 : 1;
            } else if (a[key] > b[key]) {
                return desc ? 1 : -1;
            }
            return 0;
        });
    };

    const xmlFolderListingToObject = xmlFolderListing => {
        let _list_of_folders = [];

        for (contentNode of xmlFolderListing) {
            _list_of_folders.unshift(
                contentNode.getElementsByTagName("Prefix")[0].childNodes[0]
                    .nodeValue
            );
        }

        return _list_of_folders;
    };

    /**
     * Take an `HTMLCollection` of the files in the upstream response and
     * turn it into a JS object we can manipulate <3
     */
    const xmlFileListingToObject = xmlFileListing => {
        let _map_of_s3_objects = [];

        for (let contentNode of xmlFileListing) {
            let _s3_object = {};

            for (let attribute of S3_ATTRIBUTES_OF_INTEREST) {
                _s3_object[attribute] = contentNode.getElementsByTagName(
                    attribute
                )[0].childNodes[0].nodeValue;
            }

            _map_of_s3_objects.unshift(_s3_object);
        }

        return _map_of_s3_objects;
    };

    /**
     * Get the XML response and turn it into
     * a map. No filtering occurs here.
     */
    const getS3Contents = (bucket, prefix) =>
        fetch(`${bucket}${prefix}`)
            .then(response => {
                if (!response.ok) {
                    document.getElementById("error").style.display = "block";
                    console.log(response.statusText);
                }
                return response.text();
            })
            .then(rawXML => {
                parsedXML = new DOMParser().parseFromString(
                    rawXML,
                    "application/xml"
                );

                let folders = parsedXML.getElementsByTagName("CommonPrefixes");
                let files = parsedXML.getElementsByTagName("Contents");

                return {
                    folders: xmlFolderListingToObject(folders),
                    files: sortObjectByKey(
                        xmlFileListingToObject(files),
                        SORT_KEY,
                        false
                    ),
                    objectCount: folders.length + files.length,
                    prefix: prefix
                };
            });

    const getBucketPrefix = () => location.hash.substring(3);

    const createHTMLLink = (text, url, htmlMode = false) => {
        let shebang = htmlMode ? "#!" : "";

        let a = document.createElement("a");
        a.appendChild(document.createTextNode(text));
        a.setAttribute("href", `${shebang}/${url}`);

        return a;
    };

    const getHigherLevelPrefix = prefix => {
        let splits = prefix.split("/");
        return splits.length <= 2 ? "" : `${splits[0]}/`;
    };

    const drawListing = (table, data) => {
        // Draw a link to the upper level if not the main index page
        if (data.prefix !== "") {
            let row = table.insertRow();

            let boldRow = document.createElement("strong");
            boldRow.appendChild(
                createHTMLLink("..", getHigherLevelPrefix(data.prefix), true)
            );

            // Name of object/path
            row.insertCell().appendChild(
                createHTMLLink("..", getHigherLevelPrefix(data.prefix), true)
            );
            row.insertCell().appendChild(document.createTextNode(""));
            row.insertCell().appendChild(document.createTextNode(""));
            row.insertCell().appendChild(document.createTextNode(""));
        }

        // Draw all the folders first
        for (let folder of data.folders) {
            let row = table.insertRow();

            let boldRow = document.createElement("strong");
            boldRow.appendChild(
                createHTMLLink(
                    folder.replace(decodeURI(data.prefix), ""),
                    folder,
                    true
                )
            );

            row.insertCell().appendChild(boldRow);
            row.insertCell().appendChild(document.createTextNode(""));
            row.insertCell().appendChild(document.createTextNode(""));
            row.insertCell().appendChild(document.createTextNode(""));
        }

        // Draw files next. Direct links!
        for (file of data.files) {
            if (DO_NOT_RENDER.indexOf(file.Key) === -1 && escape(file.Key) !== data.prefix) {
                let row = table.insertRow();
                row.insertCell().appendChild(
                    createHTMLLink(
                        file.Key.replace(decodeURI(data.prefix), ""),
                        file.Key
                    )
                );
                row.insertCell().appendChild(
                    document.createTextNode(file.LastModified)
                );
                row.insertCell().appendChild(
                    document.createTextNode(`${timeSince(file.LastModified)}`)
                );
                row.insertCell().appendChild(
                    document.createTextNode(humanBytes(file.Size))
                );
            }
        }
    };

    const updateDocumentTitleWith = prefix => {
        const currentTitle = document.querySelector("title").innerText;
        const documentTitle = currentTitle.replace(TITLE_REGEX, "$1");
        const strippedPrefix = prefix.replace("#!/", "");

        if (prefix === "/" || prefix === "#!/") {
            document.querySelector("title").innerText = documentTitle;
        } else {
            document.querySelector(
                "title"
            ).innerText = `${documentTitle} - ${strippedPrefix}`;
        }
    };

    const showBucketListingAtPrefix = (bucket, prefix) => {
        const bucketPrefix = getBucketPrefix();
        const tbody = document.getElementsByTagName("tbody")[0];
        tbody.innerHTML = ""; // I'm tired and don't care.

        getS3Contents(bucket, getBucketPrefix()).then(data =>
            drawListing(tbody, data)
        );

        updateDocumentTitleWith(prefix);
    };

    const customizeListing = config => {
        document.querySelector("title").innerText = config.title;
        document
            .querySelector('meta[property="og:title"]')
            .setAttribute("content", config.title);
        document
            .querySelector('meta[property="og:description"]')
            .setAttribute("content", config.description);
        document
            .querySelector(".listing-title")
            .setAttribute("href", `https://${config.bucket}`);
        document.querySelector(".listing-title").innerText = config.bucket;

        return true;
    };

    const bootstrap = () => {
        fetch("/s3-bucket-listing.config.json")
            .then(response => {
                return response.json();
            })
            .then(config => {
                customizeListing(config);
                window.bucketLocation = `https://s3.amazonaws.com/${
                    config.bucket
                }?delimiter=/&prefix=`;
                showBucketListingAtPrefix(window.bucketLocation, "/");
            })
            .catch(e => {
                document.getElementById("error").style.display = "block";
                console.error("Could not find config file 😕");
                console.log(e);
            });
    };

    window.onload = () => bootstrap();
    window.onhashchange = () =>
        showBucketListingAtPrefix(window.bucketLocation, location.hash);
})(window, document);
