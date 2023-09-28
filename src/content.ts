import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);

async function indexPage() {
  // Add current page to history
  const description =
    (
      document.querySelectorAll('meta[property="og:description"]')[0] ||
      document.querySelectorAll('meta[name="twitter:description"]')[0] ||
      document.querySelectorAll('meta[name="description"]')[0]
    )?.getAttribute("content") ?? undefined;
  const url = document.location.href;
  const added = await client.mutation(api.history.addPage, {
    title: document.title,
    url,
    description,
  });
  if (added) {
    console.log(`Added ${url} to history.`);
  }
}

const origin = document.location.origin;
const statusDiv = new DOMParser().parseFromString(
  `<div style="position: fixed; bottom: 0; right: 0; z-index: 100;"></div>`,
  "text/html"
).body.firstElementChild!;

client.onUpdate(api.rules.get, { origin }, async (allowed) => {
  if (allowed === null) {
    for (const allowed of [true, false]) {
      const button = document.createElement("button");
      button.innerText = `${allowed ? "Always" : "Never"} index ${origin}`;
      button.onclick = async () => {
        await client.mutation(api.rules.set, { origin, allowed });
      };
      statusDiv.appendChild(button);
    }

    document.body.appendChild(statusDiv);
  } else {
    statusDiv.replaceChildren(
      document.createTextNode(
        `${allowed ? "Always" : "Never"} indexing ${origin}`
      )
    );
    if (allowed) {
      // Wait for the page to settle down before indexing.
      setTimeout(indexPage, 2000);
    }
  }
});
