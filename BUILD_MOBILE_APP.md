# 📱 How to Build the Flutter Admin App

Since we updated the login screen to include **Email + Password**, you need to generate a new version of the Android App (APK).

## 🚀 Steps to Generate the New APK

### 1. Open the project in Android Studio
1. Launch **Android Studio**.
2. Click **Open**.
3. Navigate to: `c:\Users\officialum1\Desktop\officialum1\officialum_admin_mobile`.
4. Click **OK**.

### 2. Get Dependencies
1. Once the project opens, Android Studio should show a bar saying "Pub get". Click it.
2. Alternatively, open the **Terminal** tab at the bottom of Android Studio and type:
   ```bash
   flutter pub get
   ```

### 3. Build the APK
1. In the top menu of Android Studio, go to:
   **Build > Flutter > Build APK**.
2. Wait for the process to finish. It will take a minute or two.

### 4. Locate and Install
1. When finished, a message will appear at the bottom.
2. The new APK will be located at:
   `c:\Users\officialum1\Desktop\officialum1\officialum_admin_mobile\build\app\outputs\flutter-apk\app-release.apk`
3. Transfer this file to your phone and install it.

## 🛠️ Why do I need a new version?
*   **New UI**: I added the "Email / Username" field which wasn't there before.
*   **New Logic**: The app now sends both your login ID and password to the server.
*   **Staff Access**: This allows your staff members to login with their specific emails.

---
**Note:** If you don't have Flutter installed on your PC, you can use the computer where you originally set up the mobile app.
