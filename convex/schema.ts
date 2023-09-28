import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pages: defineTable({
    description: v.optional(v.string()),
    title: v.string(),
    url: v.string(),
    origin: v.string(),
    lastVisited: v.number(),
  })
    .index("url", ["url"])
    .searchIndex("title", {
      searchField: "title",
    })
    .searchIndex("description", {
      searchField: "description",
    }),

  rules: defineTable({
    origin: v.string(),
    allowed: v.boolean(),
  }).index("origin", ["origin"]),
});
