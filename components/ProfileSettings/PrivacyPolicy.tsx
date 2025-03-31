import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const PrivacyPolicy: React.FC = () => {
  return (
    <ScrollView className="p-4 mb-150">
      <Text className="text-gray-600 mb-4">Last updated: March 23, 2025</Text>
      
      <Text className="text-lg font-semibold mt-4">Introduction</Text>
      <Text className="text-base mt-2">
        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your
        information when You use the Service and tells You about Your privacy rights and how the law protects You.
      </Text>
      
      <Text className="text-base mt-2">
        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection
        and use of information in accordance with this Privacy Policy.
      </Text>

      <Text className="text-lg font-bold mb-2">Interpretation and Definitions</Text>
      <Text className="text-md font-semibold mb-2">Definitions</Text>
      <Text className="mb-4">
        <Text className="font-bold">Account:</Text> A unique account created for You to access our Service.
      </Text>
      <Text className="mb-4">
        <Text className="font-bold">Application:</Text> Refers to Snowball, the software program provided by the Company.
      </Text>
      <Text className="mb-4">
        <Text className="font-bold">Company:</Text> Moment Labs LLC, 433 S 7th St, Minneapolis, MN 55415.
      </Text>
      
      <Text className="text-lg font-bold mb-2">Collecting and Using Your Personal Data</Text>
      <Text className="text-md font-semibold mb-2">Types of Data Collected</Text>
      <Text className="text-base mt-2">
        <Text className="font-bold">Personal Data:</Text> While using Our Service, We may ask You to provide Us with
        personally identifiable information, including but not limited to: Email address and Usage Data.
      </Text>

      <Text className="text-lg font-bold mb-2">Use of Your Personal Data</Text>
      <Text className="text-base mt-2">
        The Company may use Personal Data for the following purposes:
      </Text>
      <Text className="text-base mt-2">• To provide and maintain our Service</Text>
      <Text className="text-base mt-2">• To manage Your Account</Text>
      <Text className="text-base mt-2">• To contact You regarding updates or services</Text>
      <Text className="text-base mt-2">• To manage Your requests</Text>
      <Text className="text-base mt-2">• For other legal and business purposes</Text>
      
      <Text className="text-lg font-bold mb-2">Retention and Security of Your Data</Text>
      <Text className="text-base mt-2">
        The Company will retain Your Personal Data only for as long as necessary for legal and business purposes. We
        strive to use commercially acceptable means to protect Your data but cannot guarantee absolute security. Users may
        request to delete their account and data at anytime.
      </Text>

      <Text className="text-lg font-bold mb-2">Children's Privacy</Text>
      <Text className="text-base mt-2">
        Our Service does not address anyone under the age of 13. If You are a parent and become aware that Your child has
        provided Us with Personal Data, please contact Us.
      </Text>

      <Text className="text-lg font-bold mb-2">Contact Us</Text>
      <Text className="text-base mt-2">If you have any questions about this Privacy Policy, You can contact us:</Text>
      <Text className="text-base mt-2">• By email: snowball@momentlabs.com</Text>
      <Text className="text-base mt-2 mb-100">• By visiting our website: https://moment-labs.com/snowball</Text>
    </ScrollView>
  );
};

export default PrivacyPolicy;
