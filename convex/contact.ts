import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDataById } from "./_utils";

export const block = mutation({
  args: {
    id: v.id('conversations')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new ConvexError("Unauthorized")

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError("User not found")

    const conversation = await ctx.db.get(args.id)
    if(!conversation) throw new ConvexError("Conversation not found")

    const members = await ctx.db.query("conversation_members").withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();
    if(!members || members.length !==2) throw new ConvexError("Cannot delete conversation")

    const contact = await ctx.db.query('contacts').withIndex('by_conversationId', q => q.eq('conversationId', args.id)).unique();
    if(!contact) throw new ConvexError("Contact not found")

    const messages = await ctx.db.query("messages").withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    await ctx.db.delete(args.id)
    await ctx.db.delete(contact._id)
    await Promise.all(members.map(async member => {
      await ctx.db.delete(member._id)
    }))
    await Promise.all(messages.map(async message => {
      await ctx.db.delete(message._id)
    }));
  }
})