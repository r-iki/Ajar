export const features = {
  get stripe() {
    return process.env.NEXT_PUBLIC_ENABLE_STRIPE === "true";
  },
  get doku() {
    return process.env.NEXT_PUBLIC_ENABLE_DOKU !== "false";
  },
};

