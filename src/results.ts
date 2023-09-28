import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);

// Show pages we've visited matching the current search
const url = new URL(document.location.href);
const query = url.searchParams.get("q") ?? "";
let rhs = document.querySelector("#rhs");
let parent = document.querySelector("#history-results");
client.onUpdate(api.history.search, { query }, async (matches) => {
  if (!matches.length) {
    parent?.remove();
  } else {
    if (!rhs) {
      rhs = document.createElement("div");
      rhs.id = "rhs";
      document.querySelector("#rcnt")?.appendChild(rhs);
    }
    if (!parent) {
      parent = document.createElement("div");
      parent.id = "history-results";
      rhs.prepend(parent);
    }
    const html = `
		<div>
		<h2>Results from History</h2>
		${matches
      .map((match) => `<p><a href=${match.url}>${match.title}</a></p>`)
      .join("")}
		</div>
		`;
    const node = new DOMParser().parseFromString(html, "text/html").body
      .firstElementChild!;
    parent.replaceChildren(node);
  }
});
