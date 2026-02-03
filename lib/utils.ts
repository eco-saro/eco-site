import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProfileComplete(user: any) {
  if (!user) return false;

  // Only check if user has at least one address with basic fields
  const hasAddress = user.addresses && user.addresses.length > 0 &&
    user.addresses[0].street &&
    user.addresses[0].city &&
    user.addresses[0].pincode;

  return !!hasAddress;
}
