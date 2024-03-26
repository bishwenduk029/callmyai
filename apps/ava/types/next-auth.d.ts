import { User } from "next-auth"
import { JWT } from "next-auth/jwt"
import { NextApiRequest } from 'next';
import { SignInCallback } from 'next-auth';


type UserId = string

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId
  }
}

// Define your Subscription type
type Subscription = {
  name: string
  status: string
  endsAt: Date
  planId: number
  modelName: string
}

// Extend the User interface from next-auth with additional fields
interface ExtendedUser extends User {
  id: UserId
  subscription?: Subscription // Make subscription optional
}

// Extend the Session interface from next-auth
declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }

  interface SignInCallbackParams {
    req: NextApiRequest;
  }
}
