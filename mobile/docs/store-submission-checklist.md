# Store Submission Checklist

## Pre-Submission Tasks
- [ ] **Final QA**: Test all app features (C1-C25) on both iOS and Android.
- [ ] **EAS Production Build**: Run `eas build --profile production` for both platforms.
- [ ] **App Store Assets**: Prepare all screenshots (at least 2 per device size), icons (1024x1024), and promotional images.
- [ ] **Metadata**: Review `app-store-listing.md` and ensure all descriptions and keywords are up-to-date.
- [ ] **Privacy Policy**: Ensure the privacy policy URL is valid and accessible.

## iOS App Store Checklist
- [ ] **Export Compliance**: Confirm whether the app uses non-standard encryption.
- [ ] **App Review Information**: Provide a demo account (username/password) for Apple reviewers.
- [ ] **In-App Purchases**: If using Stripe, ensure it complies with Apple's digital goods guidelines (or use IAP if required).
- [ ] **Age Rating**: Complete the age rating questionnaire in App Store Connect.
- [ ] **Advertising Identifier (IDFA)**: Declare if the app uses the IDFA for tracking/advertising.

## Google Play Store Checklist
- [ ] **App Bundle (.aab)**: Ensure the final production build is an `.aab` file.
- [ ] **App Content**: Complete all mandatory sections (Privacy, Ads, Content Rating, Target Audience).
- [ ] **Feature Graphics**: Prepare a 1024x500 feature graphic for the store listing.
- [ ] **Contact Information**: Provide a support email and website.
- [ ] **Data Safety**: Complete the Data Safety questionnaire (what data is collected, how it's used).

## Final Submission
- [ ] **EAS Submission**: Use `eas submit` to send builds directly to the stores.
  ```bash
  eas submit --platform ios
  eas submit --platform android
  ```
- [ ] **Release Tracks**: On Google Play, start with **Internal** or **Closed** testing before moving to **Production**.
- [ ] **Review Timeline**: Allow at least 2-7 days for the initial review on both platforms.

## Post-Launch
- [ ] **Monitor Analytics**: Check `mobile/src/services/analytics.ts` events for user engagement.
- [ ] **Crashlytics**: Monitor `mobile/src/services/crashlytics.ts` (Sentry) for any production crashes.
- [ ] **Version Updates**: Use semantic versioning and increment build numbers for every update.
