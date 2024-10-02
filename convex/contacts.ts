import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDataById } from "./_utils";

export const get = query({
  args:{},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new ConvexError("Unauthorized")

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError("User not found")
      
    const contacts1 = await ctx.db.query("contacts").withIndex("by_user1", q => q.eq("user1", currentUser._id)).collect();
    const contacts2 = await ctx.db.query("contacts").withIndex("by_user2", q => q.eq("user2", currentUser._id)).collect();

    const contacts = contacts1.concat(contacts2)

    const contactsInfo = await Promise.all(contacts.map(async contact => {
      const contactUser = await ctx.db.get(contact.user1 === currentUser._id ? contact.user2 : contact.user1)
      if(!contactUser) throw new ConvexError("User not found")

      return contactUser
    }))

    return contactsInfo
  }
})

export const creategroup = mutation({
  args:{
    name: v.string(),
    members: v.array(v.id('users')),
  },
  handler : async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new ConvexError("Unauthorized")

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError("User not found")

    const conversationId = await ctx.db.insert("conversations", {
      name: args.name,
      isGroup: true,
    });

    await Promise.all(
      [...args.members, currentUser._id].map(async memberId => 
        ctx.db.insert("conversation_members", {
          conversationId,
          memberId,
        }
      ))
    )
  },
})