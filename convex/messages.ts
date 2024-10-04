import { ConvexError, v } from "convex/values";
import {  query } from "./_generated/server";
import { getUserDataById } from "./_utils";

export const get = query({
  args:{
    Id: v.id('conversations'),
  },
  handler : async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new ConvexError("Unauthorized")

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError("User not found")

    const membership = await ctx.db.query("conversation_members").withIndex("by_memberId_conversationId", q => q.eq("memberId", currentUser._id).eq("conversationId", args.Id)).unique();
    if(!membership) throw new ConvexError("Not a member of the conversation");

    const messages = await ctx.db.query("messages").withIndex("by_conversationId", q => q.eq("conversationId", args.Id)).order('desc').collect();

    const messageWithUsers = await Promise.all(messages.map(async message => {
      const sender = await ctx.db.get(message.senderId)

      if(!sender) throw new ConvexError("User not found")

      return {
        ...message,
        senderImage: sender.imageUrl,
        sendName: sender.username,
        isCurrentUser: sender._id === currentUser._id,
      }
    }))

    return messageWithUsers;
  },
})