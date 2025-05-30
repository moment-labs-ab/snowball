import React, { ComponentProps } from 'react'
import { StripeProvider } from '@stripe/stripe-react-native'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'

const merchantId = Constants.expoConfig?.plugins?.find((p) => p[0] === "@stripe/stripe-react-native")?.[1]?.merchantIdentifier;
const publishableKey = 'pk_test_51RIBvjQwtotq40VsiPK4UaVIkuP3IDrD5WJwFU592pHHYtZaoA59Zp1VMUcrMSjeMFCYj8fozxSnVs58DpgzWoSl00JYUiZPwn'

const ExpoStripeProvider = (props: Omit<ComponentProps<typeof StripeProvider>, "publishableKey" | "merchantIdentifier">) => {
    return (
        <StripeProvider
            publishableKey={publishableKey}
            urlScheme={Linking.createURL('/')} // required for 3D Secure and bank redirects
            merchantIdentifier={merchantId}
            {...props}
        />
    )
}

export default ExpoStripeProvider