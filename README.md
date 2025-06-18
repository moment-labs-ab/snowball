 # Welcome to SNOWBALL ❄️

An Expo React Native app created to keep tracking habits and goals simple.

## 🚀 Get Started

1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Set up environment variables** (run once per environment)
    ```bash
    eas env:pull
    ```

3. **Start the app**
    ```bash
    # Choose one of the following
    npm run dev       # Development
    npm run preview   # Internal QA
    npm run prod      # Production
    ```

---

## 📦 Create Builds

### 🔁 Trigger Builds via GitHub Workflow

1. **Automatic**
    - Push branch to repo
    - Create a pull request
    - Add tag: **ios-build:development**

2. **Manual**
    - Push branch to repo
    - Navigate to **Actions → Target Environment Build**
    - Click **Run Workflow**
    - Select job to run (e.g., internal dist build or dev client build)

---

### 🛠️ Manual Builds (Local)

1. **Install EAS CLI**
    ```bash
    npm install -g eas-cli
    ```

2. **Log in to EAS**
    ```bash
    eas login
    ```

3. **Create a Build**

    #### Development Build
    ```bash
    eas build --platform ios --profile <profile-name>
    ```
    _Example: `development`, `preview`, `production` (see `eas.json`)_

    #### Production Build with PR Label
    ```bash
    eas build --platform ios --message "<label>"
    ```
    _Example: `"ios-build:production"`_

    #### Submit to App Store
    ```bash
    eas submit -p ios
    ```

---

## 🧪 Test the App

Open your build with one of the following options:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) – limited feature sandbox
