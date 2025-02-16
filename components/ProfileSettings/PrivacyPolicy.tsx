import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicy = () => {
  return (

      <ScrollView showsVerticalScrollIndicator={false} className='p-4'>
        
        <Text className="text-base mb-4">
          Moment Labs built the Snowball app as a Freemium app. This SERVICE is provided by Moment Labs at no cost and is intended for use as is.
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Information Collection and Use</Text>
        <Text className="text-base mb-4">
          For a better experience, while using our Service, I may require you to provide us with certain personally identifiable information, including but not limited to Email, Name, and Phone Number. This is only used to create a profile for you to help recover lost passwords. We will never sell your personal data.
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Log Data</Text>
        <Text className="text-base mb-4">
          I want to inform you that whenever you use my Service, in a case of an error in the app I collect data and information (through third-party products) on your phone called Log Data...
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Cookies</Text>
        <Text className="text-base mb-4">
          Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers...
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Service Providers</Text>
        <Text className="text-base mb-4">
          I may employ third-party companies and individuals due to the following reasons:
        </Text>
        <Text className="text-base ml-4 mb-4">• To facilitate our Service;
        {'\n'}• To provide the Service on our behalf;
        {'\n'}• To perform Service-related services; or
        {'\n'}• To assist us in analyzing how our Service is used.</Text>
        
        <Text className="text-lg font-semibold mt-4">Security</Text>
        <Text className="text-base mb-4">
          I value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it...
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Links to Other Sites</Text>
        <Text className="text-base mb-4">
          This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site...
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Children’s Privacy</Text>
        <Text className="text-base mb-4">
          I do not knowingly collect personally identifiable information from children...
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Changes to This Privacy Policy</Text>
        <Text className="text-base mb-4">
          I may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes...
        </Text>
        
        <Text className="text-lg font-semibold mt-4">Contact Us</Text>
        <Text className="text-base mb-4 pb-20">
          If you have any questions or suggestions about my Privacy Policy, do not hesitate to contact us at aashish.momentlabs@gmail.com or through the Feeback Portal.
        </Text>
      </ScrollView>

  );
}

export default PrivacyPolicy;
