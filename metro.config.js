// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adding this metro config and this line to fix issue with supabase
// https://github.com/supabase/supabase-js/issues/1403
// https://github.com/supabase/supabase-js/issues/1400
config.resolver.unstable_enablePackageExports = false; 

module.exports = config;
