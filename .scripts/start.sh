#!/bin/bash

# TODO: This does not work :/
trap cleanup_env INT
function cleanup_env() {
    echo " ... woo! Cleaning up."
    rm .env >>/dev/null 2>&1
    exit 0
}

echo ""
echo "📂 Copying local config"
echo ""
cp configs/env.local .env

yarn run clean
yarn run serve
