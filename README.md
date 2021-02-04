# local-assets

CLI tool to extract local\* stylesheets, images, scripts, fonts and other subresources (assets) from a HTML document, and optionally copy them into a directory.

\*local here means resources under the same-origin and available in same directory as given HTML document.

## Motivation

While creating an auto-publish GitHub Action for W3C specifications (See [spec-prod](https://github.com/w3c/spec-prod/)), I wanted to find the minimal files needed by the specification. This ensures we do not deploy the specification when unrelated files (like metadata files, CI scripts etc.) get changed. We want to deploy only the main HTML file (the specification) and its dependencies (generally CSS files and images) to GitHub pages and/or https://w3.org.

Now, this works outside the W3C use-case also, so I created this tool as a CLI if other people also find it useful.

## Usage

This tool is meant to be used as a CLI, although you can also import it as a regular Node.js module.

You can install this tool as a CLI:

```bash
npm install --global local-assets
# Or, with yarn
yarn global add local-assets
```

Then, you can extract all local resources from `index.html` and copy them to `../all-the-files/` directory as:

```bash
local-assets index.html -o ../all-the-files/
```

If you do not wish to copy the assets and just list them out (on `stdout`):

```bash
local-assets index.html
```

For a more verbose output, set the `VERBOSE` environment variable. This will log additional information on `stderr`. The list of assets will be still be outputted to `stdout`.

```bash
VERBOSE=1 local-assets index.html
```

<details>
  <summary>Already got a Chromium based browser installed?</summary>

If you already have a Chromium based browser (Google Chrome, Microsoft Edge) installed, you can avoid re-downloading it by setting the `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` env variable before install. You would need to specify the location of your Chromium binary (`PUPPETEER_EXECUTABLE_PATH`) during CLI usage though. So:

```bash
# Install
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
npm install --global local-assets

# Use
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
# Or, export PUPPETEER_EXECUTABLE_PATH="$(which google-chrome)"
local-assets index.html
```

</details>

## How it works?

1. Use [puppeteer](https://github.com/puppeteer/puppeteer/) to open the HTML file/URL.
1. Use of the `document.querySelectorAll` APIs to find all subresources, and process them (this is done using the [subresource](https://github.com/sidvishnoi/subresources) package).
1. Filter out cross-origin subresources from above.
1. Filter out the resources not found in current directory.
1. Copy all other resources.
