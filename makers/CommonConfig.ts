import { Configuration } from "app-builder-lib";

export const CommonConfig: Partial<Configuration> = {
  appId: "bo.eckmoda.chatmanager",
  productName: "ECK Chat Manager",
  protocols: [
    {
      name: "whatsapp",
      role: "Viewer",
      schemes: ["whatsapp"],
    },
  ],
};
