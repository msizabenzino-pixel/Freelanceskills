# TestFlight Setup Guide

## Prerequisites
- [ ] Apple Developer Program enrollment ($99/year)
- [ ] EAS CLI installed and configured
- [ ] App Store Connect access

## Step 1: Build the iOS App with EAS
Run the following command in the `mobile` directory to create a production build for TestFlight:

```bash
eas build --platform ios --profile production
```

## Step 2: Upload to App Store Connect
Once the build is complete, EAS will provide a link to download the `.ipa` file. You can then upload it using **Transporter** or **App Store Connect API**.

Alternatively, if you use `eas build` with the `--auto-submit` flag:

```bash
eas build --platform ios --profile production --auto-submit
```

## Step 3: Configure TestFlight
1. Go to [App Store Connect](https://appstoreconnect.apple.com/).
2. Select **My Apps** and then your app.
3. Navigate to the **TestFlight** tab.
4. Once the build is processed, you will see it listed under **Builds > iOS**.

## Step 4: Internal Testing
1. In the TestFlight tab, select **Internal Testing** from the sidebar.
2. Click the **(+)** button to create a new group (e.g., "Internal Team").
3. Add testers by their email addresses. They will receive an invitation to download the app via the TestFlight app on their iOS device.

## Step 5: External Testing (Beta Review)
For testing with people outside your team:
1. Select **External Testing** from the sidebar.
2. Create a new group (e.g., "Beta Testers").
3. Add a build to the group. This build will be sent to Apple for **Beta App Review**.
4. Once approved, you can share the **Public Link** or invite testers by email.

## Invite Link (Stub)
[Add your TestFlight Public Link here after Beta Review approval]
`https://testflight.apple.com/join/XXXXXXX`

## Troubleshooting
- **Missing Export Compliance**: If your app uses encryption (HTTPS counts), you may need to provide a compliance declaration in App Store Connect.
- **Build Processing**: It can take 5-30 minutes for a build to process after upload before it appears in TestFlight.
