import "./style.css";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);

const clearButton = document.querySelector<HTMLButtonElement>("#clear")!;
clearButton.addEventListener("click", async () => {
  await client.mutation(api.history.clear, {});
  clearButton.replaceWith(document.createTextNode("Cleared ✅"));
});
