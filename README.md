# Chrome Extension with TypeScript and Vite HMR (Vanilla JS)

Create a Chrome Extension using TypeScript and auto-reloading code via Vite.

This repo is a good starting point for developers looking to build a simple
extension with vanilla html, css and typescript.

It uses https://crxjs.dev/ to provide Vite HMR, allowing you to develop your
extension like you would a website, with the content changing as you save your
files.

It uses [Convex](https://convex.dev) as the backend: realtime database,
serverless functions, and more.

## Features

- On www.google.com/search, it adds a sidebar to show you previous pages you've
visited with the title / description matching your search terms.
Search results will update in realtime as you visit & index other sites.

- On every other page, it adds the title, url, and description
to a database "pages" table  of the database, if allowed.

- It checks allowed status by looking in a "rules" table.
If a page is on an origin without a rule, it adds buttons to always or never
index that page. By default, it doesn't index it.

- If you reject an origin, it will clear the database of data from that origin.

- If you have many tabs open from a single origin, clicking a button on one
to allow / disallow indexing an origin will update all pages automatically.

- There is an [options page](https://developer.chrome.com/docs/extensions/mv3/options/)
to clear your page history.

- You can click the extension icon to see a popup of recent pages, which also
update in realtime, thanks to Convex.

## Set up (for development)

### 1. Run your extension frontend & backend

```
npm i
npm run dev
```
This will run `vite` and `npx convex dev`, which syncs your functions in the
[convex](./convex/) folder to your Convex development backend.
On your first run, you'll be prompted to make a new Convex backend.

### 2. Install your extension into Chrome / Arc

Navigate to [chrome://extensions](chrome://extensions).

Drag your `dist` folder onto the page, and confirm the installation.

**Note:** If you make changes to your manifest, you need to re-install by
removing the extension and dragging the folder in again. For most changes to
html, css, and TypeScript, however, you shouldn't need to re-install it.

# Manifest.json configuration

## Run a content script on every page

Add this to your [manifest.json](./manifest.json) to run
[content.ts](./src/content.ts) on every page except Google search:

```
  "content_scripts": [
	...[optional] other content scripts
	{
      "matches": ["https://*/*"],
      "exclude_matches": ["https://www.google.com/search*"],
      "js": ["src/content.ts"]
    }
  ]
```

## Open a popup window by clicking the extension

Open a popup window when the user clicks on your extension with
by adding this to your [manifest.json](./manifest.json):
```
	"action": { "default_popup": "index.html" },
```

## Show an options page

Give you extension options by adding this line:
```
	"options_ui": { "page": "options.html" },
```

## Overriding the new tab, history, or bookmark manager

Add this to your [manifest.json](./manifest.json) to replace one of the default
pages:
```
	"chrome_url_overrides" : {
		"bookmarks" | "history" | "newtab" : "index.html"
	},
```

## Adding a side panel

You can put your extension page in a side panel instead of a popup by adding
this to your [manifest.json](./manifest.json)
```
  "permissions": ["sidePanel"],
  "side_panel": { "default_path": "index.html" },
```
For more info on how to programatically open these and more, refer to
[the docs](https://developer.chrome.com/docs/extensions/reference/sidePanel/).

## Run a service worker in the background

To add a service worker, add:
```
	"background": {
	    "service_worker": "src/background.ts",
	    "type": "module"
	},
```
