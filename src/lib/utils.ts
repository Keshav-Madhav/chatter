import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {format, differenceInHours, differenceInDays, differenceInWeeks} from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isRouteActive = (pathname: string, path: string) => {
  if(pathname === '/'){
    return path === '/' || path.includes('chats')
  }

  return pathname === path;
}

export const getFormattedTimeStamp = (timeStamp: number) => {
  const now = new Date();
  const date = new Date(timeStamp);

  if(differenceInHours(now, date) < 24){
    return format(date, 'HH:mm')
  } else if(differenceInDays(now, date) < 7){
    return format(date, 'EEE')
  } else if(differenceInWeeks(now, date) < 4){
    return format(date, "'Week' w")
  } else {
    return format(date, 'MMM')
  } 
}

export const pluralize = (word:string, length: number ) => {
  return length > 1 ? `${word}s` : word
}