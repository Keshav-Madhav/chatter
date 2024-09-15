'use client'

import { ClerkProvider, SignInButton, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Authenticated, ConvexReactClient, Unauthenticated } from "convex/react";

type Props = {
  children: React.ReactNode;
}
const ConvexClerkProvider = ({ children }: Props) => {
  const convexURL = process.env.NEXT_PUBLIC_CONVEX_URL!;
  if (!convexURL) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
  }

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  if (!clerkPublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  const convex = new ConvexReactClient(convexURL);

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk
        client={convex}
        useAuth={useAuth}
      >
        <Authenticated>
          {children}
        </Authenticated>

        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
export default ConvexClerkProvider