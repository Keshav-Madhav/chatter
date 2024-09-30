import { ConvexError } from "convex/values";
import { MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUserDataById } from "./_utils";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx, _) => {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new ConvexError("Unauthorized")

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError("User not found")

    const conversationMemberships = await ctx.db.query("conversation_members")
      .withIndex("by_memberId", q => q.eq("memberId", currentUser._id))
      .collect();

    const conversations  = await Promise.all(conversationMemberships?.map(async (membership) => {
      const conversation = await ctx.db.get(
        membership.conversationId
      );
      if(!conversation) throw new ConvexError("Conversation not found")

      return conversation;
    }))

    const conversationsWithDetails = await Promise.all(conversations.map(async (conversation, i) => {
      const allConversationMembers = await ctx.db
        .query("conversation_members")
        .withIndex("by_conversationId", q => q.eq("conversationId", conversation?._id))
        .collect();

      const lastMessage = await getLastMessageDetails({ctx, conversationID: conversation?.lastMessage})

      const lastSeenMessage = conversationMemberships[i].lastSeenMessage ? 
        await ctx.db.get(conversationMemberships[i].lastSeenMessage) 
        : null

      const lastSeenMessageTime = lastSeenMessage ? lastSeenMessage._creationTime : -1;

      const unreadMessages = await ctx.db.query("messages")
        .withIndex("by_conversationId", q => q.eq("conversationId", conversation._id))
        .filter(q => q.gt(q.field("_creationTime"), lastSeenMessageTime))
        .filter(q => q.neq(q.field("senderId"), currentUser._id))
        .collect();

      if(conversation.isGroup){
        return {
          conversation, 
          unseenCount: unreadMessages.length,
          ...lastMessage
        }
      } else {
        const otherMember = allConversationMembers.filter(member => member.memberId !== currentUser._id)[0]
        const otherMemberData = await ctx.db.get(otherMember.memberId)

        return {
          conversation, 
          unseenCount: unreadMessages.length,
          otherMember: otherMemberData,
          lastMessage
        }
      }
    }))

    return conversationsWithDetails;
  }
})

const getLastMessageDetails = async ({ctx, conversationID}:{ctx: QueryCtx | MutationCtx; conversationID: Id<"messages"> | undefined}) => {
  if(!conversationID) return null

  const message = await ctx.db.get(conversationID)
  if(!message) return null

  const sender = await ctx.db.get(message.senderId);
  if(!sender) return null

  const content = getMessageContent(message.type, message.content[0])

  return {
    lastMessageSender: sender.username,
    lastMessageContent: content,
    lastMessageTime: message._creationTime
  }

}

const getMessageContent = (type:string, content:string) => {
  switch (type) {
    case "text":
      return content;
    case "image":
      return "📷 Image";
    case "pdf":
      return "📄 Document";
    case "audio":
      return "🔊 Audio";
    default:
      return "📎 Unknown Message";
  }
}