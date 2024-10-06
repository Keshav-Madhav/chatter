'use client'

import { ClerkProvider, SignInButton, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Authenticated, ConvexReactClient, Unauthenticated } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaSignalMessenger } from "react-icons/fa6";

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
          <div className="bg-slate-900 w-svw h-dvh grid place-content-center">
            <div className="grid place-content-center mb-5 ">
              <FaSignalMessenger className="text-primary-main" size={100} />
            </div>

            <Card className="bg-slate-800 w-[350px] border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Authenticate</CardTitle>
              </CardHeader>

              <CardContent className="text-white">
                <SignInButton/>
              </CardContent>
            </Card>
          </div>
        </Unauthenticated>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
export default ConvexClerkProvider