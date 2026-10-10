# OwnShop Merchant Android app

The Android app packages the existing merchant dashboard with Capacitor. It uses the same API, authentication, products, orders, customers, settings, uploads, and storefront code as the web application.

## Build an updated APK

1. Install Node.js 22 or newer, Java 21, and Android SDK Platform 36 with Build Tools 36.
2. In the `ecommerce` directory, run `npm install`.
3. Confirm `.env` contains the production `VITE_API_URL`.
4. Increase `versionCode` and `versionName` in `android/app/build.gradle`.
5. Set `JAVA_HOME` to your Java 21 installation, then run `npm run mobile:apk`.
6. The generated APK is in `android/app/build/outputs/apk/release/`.

The app rebuild sequence is:

```text
npm run build
npx cap sync android
android\\gradlew.bat assembleRelease
```

## Production signing

The included test release uses Android's development signing certificate so it can be installed directly. Before Play Store or public distribution:

1. Generate one private release keystore.
2. Store it securely outside Git and keep permanent backups.
3. Add a Gradle `signingConfigs.release` configuration using environment variables or an ignored `keystore.properties` file.
4. Replace `signingConfig signingConfigs.debug` in the release build type with `signingConfig signingConfigs.release`.

Every future update must be signed with the same production key and use a higher `versionCode`.

## Backend requirements

- Keep `https://localhost` and `capacitor://localhost` in the API CORS allowlist.
- The API URL must use HTTPS.
- Cloud storage must remain configured for product and store-profile uploads.
- Local order notifications are detected while the app is active or periodically refreshing. Always check the Orders screen for the authoritative order list.

## Store preview

Use **View Storefront** in the app header. The customer storefront opens inside the app with a **Return to Admin** bar. Customers continue using the public website; the APK is merchant-only.
