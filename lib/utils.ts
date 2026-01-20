import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProfileComplete(user: any) {
  if (!user) return false;

  const hasName = !!user.name;
  const hasPhone = !!user.phone;
  const hasAddress = user.addresses && user.addresses.length > 0 &&
    user.addresses[0].street &&
    user.addresses[0].city &&
    user.addresses[0].state &&
    user.addresses[0].pincode;

  return !!(hasName && hasPhone && hasAddress);
}
