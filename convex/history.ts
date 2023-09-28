import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { allowed } from "./rules";

export const addPage = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const origin = new URL(args.url).origin;
    if (!(await allowed(ctx.db, origin))) {
      return false;
    }
    const existing = await ctx.db
      .query("pages")
      .withIndex("url", (q) => q.eq("url", args.url))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastVisited: Date.now(),
      });
      return existing._id;
    } else {
      const pageId = await ctx.db.insert("pages", {
        ...args,
        origin,
        lastVisited: Date.now(),
      });
      // TODO: add embedding for pageId
    }
    return !existing;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.length) {
      return [];
    }
    const matches = await ctx.db
      .query("pages")
      .withSearchIndex("title", (q) => q.search("title", args.query))
      .take(10);
    const descriptionMatches = await ctx.db
      .query("pages")
      .withSearchIndex("description", (q) =>
        q.search("description", args.query)
      )
      .take(10);

    // de-dupe matching on the title and description.
    for (const match of descriptionMatches) {
      if (!matches.some((m) => m._id === match._id)) {
        matches.push(match);
      }
    }

    return matches;
  },
});

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("pages").order("desc").take(1000);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx, args) => {
    const pages = await ctx.db.query("pages").collect();
    for (const page of pages) {
      await ctx.db.delete(page._id);
    }
  },
});
