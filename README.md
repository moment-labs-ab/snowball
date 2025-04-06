# Welcome to SNOWBALL ❄️

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```
2. Setup Environment Variables (Only need to do once per environment)
    ```bash
   eas env:pull 
   ```
3. Start the app

   ```bash
    npx expo start
   ```

## EAS Build

1. Install EAS CLI
    ```bash
    npm install -g eas-cli
    ```

2. Login to EAS
    ```bash
    eas login
    ```

3. Create Build
### Option 1: Development Server Build
    ```bash
    eas build --platform ios --profile development
    ```    

### Option 2: Internal Distribution Build
    ```bash
    eas build --platform ios --profile preview
    ```



In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo


