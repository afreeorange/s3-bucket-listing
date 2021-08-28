#!/bin/bash

CONFIG_FOLDER="configs"

echo ""
echo "🧹 Cleaning"
echo ""
yarn clean

# Save the local OG image
cp src/og-image.png og-image.png.backup

for ENV in $(find "$CONFIG_FOLDER" -type f -iname "env.*"); do
    SITE=${ENV##$CONFIG_FOLDER"/env."}
    echo ""
    echo "👉 Building site $SITE"
    echo ""

    # Copy over the OpenGraph image
    if [[ -f "$CONFIG_FOLDER/og-image.$SITE.png" ]]; then
        cp "$CONFIG_FOLDER/og-image.$SITE.png" src/index.og-image.png
    else
        echo "Using default OG Image"
        cp "$CONFIG_FOLDER/og-image.local.png" src/index.og-image.png
    fi

    # Copy over configs. Parcel uses these to inject the bucket names (and
    # other things.)
    cp "$ENV" .env
    
    # Build the site. Get the public URL first.
    PUBLIC_URL=$(grep PUBLIC_URL "configs/env.$SITE" | cut -d'"' -f2)
    yarn build:local --public-url "$PUBLIC_URL" --no-source-maps
    
    # Rename the dist to match the site
    mv dist "dist.$SITE"
done

# Restore the local OG image #CLEANLINESS
cp og-image.png.backup src/og-image.png
rm og-image.png.backup
