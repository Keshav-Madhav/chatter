import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isRouteActive = (pathname: string, path: string) => {
  if(pathname === '/'){
    return path === '/' || path.includes('chats')
  }

  return pathname === path;
}