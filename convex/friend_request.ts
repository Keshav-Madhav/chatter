import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDataById } from "./_utils";

export const create = mutation({
  args:{
    email: v.string(),
  },
  handler: async(ctx, args) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized')

    if(args.email === identity.email) throw new ConvexError('You cannot send friend request to yourself')

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError('User not found')

    const receiver = await ctx.db.query('users').withIndex('by_email', q=>q.eq('email', args.email)).unique()
    if(!receiver) throw new ConvexError('Receiver not found')

    const requestExists = await ctx.db.query('friend_requests').withIndex('by_receiver_sender', q=>q.eq('receiver', receiver._id).eq('sender', currentUser._id)).unique() 
    if(requestExists) throw new ConvexError('You already sent a request to this user')

    const requestRecieved = await ctx.db.query('friend_requests').withIndex('by_receiver_sender', q=>q.eq('receiver', currentUser._id).eq('sender', receiver._id)).unique()
    if(requestRecieved) throw new ConvexError('You already have a request from this user')

    const contact1 = await ctx.db.query('contacts').withIndex('by_user1', q=>q.eq('user1', currentUser._id)).collect()
    const contact2 = await ctx.db.query('contacts').withIndex('by_user2', q=>q.eq('user2', currentUser._id)).collect()
    if(contact1.some(c=>c.user2 === receiver._id) || contact2.some(c=>c.user1 === receiver._id)) throw new ConvexError('User is already your friend.')

    const request = await ctx.db.insert('friend_requests', {
      sender: currentUser._id,
      receiver: receiver._id
    });

    return request;
  }
})

export const decline = mutation({
  args:{
    requestId: v.id('friend_requests'),
  },
  handler: async(ctx, args) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized')

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError('User not found')

    const currentRequest = await ctx.db.get(args.requestId);
    if(!currentRequest || currentRequest.receiver !== currentUser._id) throw new ConvexError('Request not found')

    await ctx.db.delete(args.requestId);
  }
})

export const accept = mutation({
  args:{
    requestId: v.id('friend_requests'),
  },
  handler: async(ctx, args) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized')

    const currentUser = await getUserDataById({ctx, clerkId: identity.subject})
    if(!currentUser) throw new ConvexError('User not found')

    const currentRequest = await ctx.db.get(args.requestId);
    if(!currentRequest || currentRequest.receiver !== currentUser._id) throw new ConvexError('Request not found')

    const conversationId = await ctx.db.insert('conversations', {
      isGroup: false,
    })

    await ctx.db.insert('contacts', {
      user1: currentUser._id,
      user2: currentRequest.sender,
      conversationId: conversationId
    })

    await ctx.db.insert('conversation_members', {
      memberId: currentUser._id,
      conversationId: conversationId
    })
    await ctx.db.insert('conversation_members', {
      memberId: currentRequest.sender,
      conversationId: conversationId
    })

    await ctx.db.delete(currentRequest._id);
  }
})