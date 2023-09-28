import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  DatabaseReader,
  MutationCtx,
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

export const set = mutation({
  args: {
    origin: v.string(),
    allowed: v.boolean(),
  },
  handler: async (ctx, { origin, allowed }) => {
    const existing = await ctx.db
      .query("rules")
      .withIndex("origin", (q) => q.eq("origin", origin))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { allowed });
    } else {
      await ctx.db.insert("rules", { origin, allowed });
    }
    if (!allowed) {
      // Take advantage of the fact that URLs are prefixed by their origin.
      // Use the index on the URL to sort, and delete all pages until we find
      // one that doesn't start with the target origin.
      const asyncResults = ctx.db
        .query("pages")
        .withIndex("url", (q) => q.gte("url", origin));
      for await (const result of asyncResults) {
        if (!result.url.startsWith(origin)) {
          break;
        }
        // Very defensive: it's possible this origin is a prefix of another.
        if (result.origin === origin) {
          await ctx.db.delete(result._id);
        }
      }
    }
  },
});

export async function allowed(db: DatabaseReader, origin: string) {
  return (
    await db
      .query("rules")
      .withIndex("origin", (q) => q.eq("origin", origin))
      .unique()
  )?.allowed;
}

export const get = query({
  args: { origin: v.string() },
  handler: async (ctx, args) => {
    return await allowed(ctx.db, args.origin);
  },
});
