import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDataById } from "./_utils";

export const get = query({
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

    const membership = await ctx.db.query("conversation_members").withIndex("by_memberId_conversationId", q => q.eq("memberId", currentUser._id).eq("conversationId", args.id)).unique();
    if(!membership) throw new ConvexError("Not a member of the conversation")

    const allConcersationMembers = await ctx.db.query("conversation_members").withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    if(!conversation.isGroup){
      const otherMemberId = allConcersationMembers.filter(member => member.memberId !== currentUser._id)[0] 
      const otherMember = await ctx.db.get(otherMemberId?.memberId);

      return{
        ...conversation,
        otherMember: {
          ...otherMember,
          lastSeenMessageId: membership.lastSeenMessage,
        },
        otherMembers: null,
      }
    } else{
      const otherMembers = await Promise.all(allConcersationMembers.filter(member => member.memberId !== currentUser._id).map(async member => {
        const memberInfo = await ctx.db.get(member.memberId)
        if(!memberInfo) throw new ConvexError("Member not found")

        return {
          username: memberInfo.username,
          lastSeenMessageId: member.lastSeenMessage,
          _id: member._id
        }
      }))

      return {
        ...conversation,
        otherMember: null,
        otherMembers,
      }
    }
  }
})

export const deleteGroup = mutation({
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
    if(!members) throw new ConvexError("Cannot delete conversation")

    const messages = await ctx.db.query("messages").withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    await ctx.db.delete(args.id)

    await Promise.all(messages.map(async message => {
      await ctx.db.delete(message._id)
    }))

    await Promise.all(members.map(async member => {
      await ctx.db.delete(member._id)
    }))
  }
})

export const leaveGroup = mutation({
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

    const member = await ctx.db.query("conversation_members").withIndex("by_memberId_conversationId", q => q.eq("memberId", currentUser._id).eq("conversationId", args.id)).unique();
    if(!member) throw new ConvexError("Not a member of the conversation")

    await ctx.db.delete(member._id)
  }
})

export const markAsRead = mutation({
  args: {
    conversationId: v.id('conversations'),
    messageId: v.id('messages')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new ConvexError("Unauthorized")

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError("User not found")

    const conversation = await ctx.db.get(args.conversationId)
    if(!conversation) throw new ConvexError("Conversation not found")

    const members = await ctx.db.query("conversation_members").withIndex("by_conversationId", q => q.eq("conversationId", args.conversationId)).collect();
    if(!members || members.length <=1) throw new ConvexError("Cannot delete conversation")

    const lastMessage = await ctx.db.get(args.messageId)

    await ctx.db.patch(members[0]._id, {
      lastSeenMessage: lastMessage? lastMessage._id : undefined,
    })
  }
})

export const getConversationMembers = query({
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

    const membership = await ctx.db.query("conversation_members").withIndex("by_memberId_conversationId", q => q.eq("memberId", currentUser._id).eq("conversationId", args.id)).unique();
    if(!membership) throw new ConvexError("Not a member of the conversation")

    const allConversationMembers = await ctx.db.query("conversation_members").withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    const members = await Promise.all(allConversationMembers.map(async member => {
      const memberInfo = await ctx.db.get(member.memberId)
      if(!memberInfo) throw new ConvexError("Member not found")

      return {
        username: memberInfo.username,
        imageUrl: memberInfo.imageUrl,
        email: memberInfo.email,
        _id: member._id
      }
    }))

    return {
      members,
      conversation
    }
  }
})