import { View, Text, ScrollView } from 'react-native';

const TermsAndConditions = () => {
  return (
    <ScrollView className="p-4 mb-150">
    <Text className="text-gray-600 mb-4">Last updated: March 23, 2025</Text>
      
      <Text className="text-lg font-semibold mt-4">Usage Restrictions</Text>
      <Text className="text-base mt-2">
        By downloading or using the app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app. You’re not allowed to copy or modify the app, any part of the app, or our trademarks in any way.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">Modifications & Charges</Text>
      <Text className="text-base mt-2">
        Moment Labs reserves the right to make changes to the app or to charge for its services at any time. We will never charge you without making it clear what you’re paying for.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">Security & Data Storage</Text>
      <Text className="text-base mt-2">
        The Snowball app stores and processes personal data including and limted to Email. We recommend that you do not jailbreak or root your phone, as it could compromise security and affect app functionality.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">Internet & Data Usage</Text>
      <Text className="text-base mt-2">
        Certain functions require an active internet connection. If you lack Wi-Fi or data, the app may not function fully. Additional charges from your network provider may apply if you use the app outside of a Wi-Fi zone.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">Liability Disclaimer</Text>
      <Text className="text-base mt-2">
      Moment Labs cannot be held responsible for issues caused by device battery failure, reliance on third-party information, or any indirect loss from using the app.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">App Updates & Termination</Text>
      <Text className="text-base mt-2">
        We may update the app and its requirements, and you must accept updates to continue using it. We may also terminate the app's availability at any time without prior notice.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">Changes to Terms</Text>
      <Text className="text-base mt-2">
        These terms may be updated periodically. Changes will be posted on this page. Effective date: 2025-04-01.
      </Text>
      
      <Text className="text-lg font-semibold mt-4">Contact Us</Text>
      <Text className="text-base mt-2 pb-20">
        If you have any questions, contact Moment Labs at snowball@momentlabs.com or through the Feedback Portal.
      </Text>
    </ScrollView>
  );
};

export default TermsAndConditions;