import Constants from 'expo-constants'

const { SNOWBALL_DB_URL, SNOWBALL_DB_ANON_KEY, RC_PUBLIC, } = Constants.expoConfig?.extra ?? {};

interface Environment {
    RC_PUBLIC: string;
    SNOWBALL_DB_URL: string;
    SNOWBALL_DB_ANON_KEY: string;
}

/**
 * Environment specifc configuration for the app.
 * This is used to configure the app for our environments: development, preview, production).
 * 
 * Save values in EAS secrets then run `eas env:pull` to pull secrets into .env.local file.
 */
export const Environment: Environment = {
    RC_PUBLIC: RC_PUBLIC ?? "",
    SNOWBALL_DB_URL: SNOWBALL_DB_URL ?? "",
    SNOWBALL_DB_ANON_KEY: SNOWBALL_DB_ANON_KEY ?? "",
};