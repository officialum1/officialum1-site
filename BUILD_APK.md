# 📱 How to Build Your Admin APK

Since your project is a Next.js web application, I have configured it as a **Capacitor Mobile App** that wraps your live admin panel (`https://officialum1.com/admin`) into a native Android app.

Because I am an AI assistant running in a text-based environment, I cannot compile the final `.apk` binary file for you (this requires Android Studio and Java/SDKs installed on the machine). However, I have done **100% of the setup**.

## 🚀 Steps to Generate the APK

### 1. Install Android Studio (If not installed)
Download and install [Android Studio](https://developer.android.com/studio). This provides the necessary tools (SDK, Gradle) to build Android apps.

### 2. Open the Android Project
1. Launch **Android Studio**.
2. Click **Open**.
3. Navigate to your project folder: `c:\Users\officialum1\Desktop\officialum1`.
4. Select the **`android`** folder inside it and click **OK**.
5. Wait for Android Studio to sync the project (this might take a few minutes the first time as it downloads Gradle/SDKs).

### 3. Build the APK
1. In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Wait for the build to complete.
3. A notification will appear: "APK(s) generated successfully". Click **locate** to find your `.apk` file.

### 4. Install on Your Phone
- Transfer the `.apk` file to your Android device via USB, Google Drive, or WhatsApp.
- Tap the file to install it.
- Open **OfficialUM1 Admin**.

## ⚙️ How It Works
The app is configured to load `https://officialum1.com/admin/login` directly. This means:
- You **don't** need to rebuild the app when you update the website.
- The app always shows the latest version of your admin panel.
- It acts as a dedicated, fullscreen browser for your admin tools.

## 🛠️ Troubleshooting
If the build fails:
- Ensure you have the **Android SDK Command-line Tools** installed (Tools > SDK Manager > SDK Tools).
- Ensure your internet connection is active (Gradle needs to download dependencies).
- You can also run this command in your terminal if you have Java installed:
  ```bash
  cd android
  ./gradlew assembleDebug
  ```
