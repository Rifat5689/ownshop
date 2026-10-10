import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ownshop.merchant",
  appName: "OwnShop Merchant",
  webDir: "dist",
  android: {
    allowMixedContent: false,
    backgroundColor: "#f4f8fc",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_ownshop",
      iconColor: "#2874ff",
    },
  },
};

export default config;
