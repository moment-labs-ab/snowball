import React, { ComponentProps } from 'react'
import { StripeProvider } from '@stripe/stripe-react-native'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'

const merchantId = Constants.expoConfig?.plugins?.find((p) => p[0] === "@stripe/stripe-react-native")?.[1]?.merchantIdentifier;

const { STRIPE_PUBLISHABLE_KEY } = Constants.expoConfig?.extra ?? {};

const ExpoStripeProvider = (props: Omit<ComponentProps<typeof StripeProvider>, "publishableKey" | "merchantIdentifier">) => {
    return (
        <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            urlScheme={Linking.createURL('/')} // required for 3D Secure and bank redirects
            merchantIdentifier={merchantId}
            {...props}
        />
    )
}

export default ExpoStripeProvider