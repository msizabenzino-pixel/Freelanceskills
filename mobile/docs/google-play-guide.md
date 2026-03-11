# Google Play Setup Guide

## Prerequisites
- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] EAS CLI installed and configured
- [ ] Google Cloud Project with API access

## Step 1: Build the Android App with EAS
Run the following command in the `mobile` directory to create a production `.aab` (Android App Bundle):

```bash
eas build --platform android --profile production
```

## Step 2: Upload to Google Play Console
Once the build is complete, EAS will provide a link to download the `.aab` file. You can then upload it using the **Google Play Console** or **EAS Submit**.

Alternatively, if you use `eas build` with the `--auto-submit` flag:

```bash
eas build --platform android --profile production --auto-submit
```

## Step 3: Internal Testing
1. Go to [Google Play Console](https://play.google.com/console/).
2. Select your app and go to **Testing > Internal testing**.
3. Create a new release and upload your `.aab` file.
4. Go to the **Testers** tab and add an email list of your internal testers.
5. Provide the **Join on Android** link to your testers.

## Step 4: Closed Testing
For testing with a larger group (e.g., alpha/beta testers):
1. Select **Testing > Closed testing**.
2. Create a track (e.g., "Alpha Track").
3. Create a release and upload your build.
4. Add testers by email or using Google Groups.
5. Your app must be reviewed by Google before it becomes available to testers.

## Step 5: Open Testing (Optional)
For a public beta:
1. Select **Testing > Open testing**.
2. Create a release and upload your build.
3. Configure the maximum number of testers (optional).
4. Users can find and join the beta directly from the Play Store.

## Store Listing Requirements
Before your app can be released, you must complete the **App Content** section (Store presence > App content). This includes:
- [ ] Privacy Policy URL
- [ ] Ads declaration
- [ ] App access (login credentials for review)
- [ ] Content rating questionnaire
- [ ] Target audience and content

## Troubleshooting
- **Missing App Bundle**: Ensure you are uploading the `.aab` file, not an `.apk`.
- **Version Code**: Each build must have a unique, incrementing version code in `app.json`.
- **Review Delay**: Initial reviews can take 2-7 days.
