import { env } from "@/lib/env";

export const features = {
  get stripe() {
    return process.env.NEXT_PUBLIC_ENABLE_STRIPE === "true";
  },
  get midtrans() {
    return process.env.NEXT_PUBLIC_ENABLE_MIDTRANS === "true";
  }
};
