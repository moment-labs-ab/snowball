import { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";
import 'dotenv/config';

// Replace these with your EAS project ID and project slug.
// You can find them at https://expo.dev/accounts/[account]/projects/[project].
const EAS_PROJECT_ID = "eb86886a-eab6-4bf6-ae7b-361c433b9cd8";
const PROJECT_SLUG = "snowball";
const OWNER = "momentlabs";

// App production config
const APP_NAME = "Snowball";
const BUNDLE_IDENTIFIER = "com.momentlabs.snowball";
const PACKAGE_NAME = "com.momentlabs.snowball";
const ICON = "./assets/images/icon.png";
const ADAPTIVE_ICON = "./assets/images/icon.png";
const SCHEME = "com.momentlabs.snowball";

export default ({ config }: ConfigContext): ExpoConfig => {
  const { name, bundleIdentifier, icon, adaptiveIcon, packageName, scheme } =
    getDynamicAppConfig(
      (process.env.APP_ENV as "development" | "preview" | "production") ||
        "development"
    );

  return {
    ...config,
    name: name,
    owner: OWNER,
    version, // Automatically bump your project version with `npm version patch`, `npm version minor` or `npm version major`.
    slug: PROJECT_SLUG, // Must be consistent across all environments.
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    icon: icon,
    scheme: scheme,
    platforms: ["ios", "android"],
    splash: {
      image: "./assets/app_icons/splash-icon-light.png", // Change hard coded path
      imageWidth: 150,
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSUserNotificationUsageDescription:
          "Enable notifications to remind you about your habits!",
        NSCameraUsageDescription:
          "Camera access is required by some features or external libraries.",
      },
      icon: {
        dark: "./assets/app_icons/ios-dark.png",
        light: "./assets/app_icons/ios-light.png",
        tinted: "./assets/app_icons/ios-tinted.png",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/app_icons/android-icon.png",
        monochromeImage: "./assets/app_icons/android-icon.png",
        backgroundColor: "#ffffff",
      },
      package: packageName,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    runtimeVersion: "1.0.0",
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: EAS_PROJECT_ID,
      },
        SNOWBALL_DB_URL: process.env.SNOWBALL_DB_URL,
        SNOWBALL_DB_ANON_KEY: process.env.SNOWBALL_DB_ANON_KEY,
        RC_PUBLIC: process.env.RC_PUBLIC,
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-notifications"
      /*[
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],*/
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
  };
};

// Dynamically configure the app based on the environment.
// Update these placeholders with your actual values.
export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  console.log("⚙️ Building app for environment:", process.env.APP_ENV);

  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
      scheme: SCHEME,
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: ICON,
      adaptiveIcon: ICON,
      scheme: `${SCHEME}-prev`,
    };
  }

  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    icon: ICON,
    adaptiveIcon: ICON,
    scheme: `${SCHEME}-dev`,
  };
};