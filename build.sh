#!/bin/bash
set -eu -o pipefail

Version="1.0.0"

yarn install --immutable
yarn build --sourcemap false

if [ "$1" = "win-x64" ]; then
    export WINEPREFIX=/.wine64 # Workaround: Base image seems to have 32-bit setup in .wine, so use 64-bit prefix
    yarn package --platform=win32 --arch=x64 \
                 --app-version="$Version"
else
    echo "Unsupported platform $1" && exit 1
fi
