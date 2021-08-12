#!/bin/bash

CONFIG_FOLDER="configs"

# We don't care about deploying local stuff
for ENV in $(find "$CONFIG_FOLDER" -type f -iname "env.*" -and -not -name "env.local"); do
    SITE=${ENV##$CONFIG_FOLDER"/env."}
    echo ""
    echo "👉 Deploying site $SITE"
    echo ""

    if [[ ! -e "dist.$SITE" ]]; then
        echo "Could not find dist.$SITE" >&2
        echo "Did you build it?" >&2
        exit 1
    fi

    PREFIX=$(grep PREFIX "configs/env.$SITE" | cut -d'"' -f2)
    aws s3 sync "dist.$SITE"/ "s3://$SITE/$PREFIX" --profile nikhil.io
done
