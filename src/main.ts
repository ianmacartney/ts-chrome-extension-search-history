import "./style.css";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const app = document.querySelector<HTMLDivElement>("#app")!;
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);
client.onUpdate(api.history.list, {}, (pages) => {
  app.innerHTML = `
  <h1>Chrome History Extension</h1>
  ${pages
    .map((page) => `<p><a href=${page.url}>${page.title}</a></p>`)
    .join("")}
`;
});
