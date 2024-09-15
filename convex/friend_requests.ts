import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDataById } from "./_utils";

export const get = query({
  args:{},
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) throw new ConvexError('Unauthorized')

    const user = await getUserDataById({ctx, clerkId: identity.subject})
    if(!user) throw new ConvexError('User not found')

    const friendRequests = await ctx.db.query('friend_requests').withIndex('by_receiver', q=>q.eq('receiver', user._id)).collect()

    const requestWithSender = await Promise.all(friendRequests.map(async request=>{
      const sender = await ctx.db.get(request.sender)
      if(!sender) throw new ConvexError('Sender not found')

      return {
        ...request,
        sender
      }
    }))

    return requestWithSender;
  }
})