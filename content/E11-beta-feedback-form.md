# Beta Tester Feedback System

---

## API Endpoint: POST /api/feedback/beta

### Form Fields

| Field | Type | Required | Options |
|-------|------|----------|---------|
| name | text | Yes | - |
| email | email | Yes | - |
| role | select | Yes | freelancer, client, both |
| overallRating | number | Yes | 1-5 stars |
| easeOfUse | number | Yes | 1-5 stars |
| featureSatisfaction | number | Yes | 1-5 stars |
| favoriteFeature | select | Yes | AI Matching, Escrow Payments, Academy, Messaging, Mobile App, Job Board |
| painPoints | textarea | No | What frustrated you most? |
| missingFeatures | textarea | No | What feature do you wish existed? |
| wouldRecommend | boolean | Yes | Would you recommend FreelanceSkills to a friend? |
| npsScore | number | Yes | 0-10 (Net Promoter Score) |
| testimonial | textarea | No | Can we quote you? Write a short testimonial. |
| canContact | boolean | Yes | Can we follow up with you? |

### Auto-Email Flow

**Trigger**: On form submission
**From**: feedback@freelanceskills.co.za
**Subject**: Thank you for your feedback, [Name]!

**Email Body:**

Hi [Name],

Thank you for taking the time to share your feedback on FreelanceSkills!

Your input is incredibly valuable — it directly shapes what we build next.

Here's what happens next:
- Your feedback has been logged and will be reviewed by our product team within 48 hours
- If you reported a bug or pain point, we'll prioritize it in our next sprint
- As a thank you, we've added R50 credit to your account

[If NPS >= 8]: You're one of our biggest fans! Would you be open to a 5-minute video testimonial? Reply to this email and we'll set it up.

[If NPS <= 6]: We hear you, and we want to do better. Our founder Bernet would love to hear more about your experience. Would a 10-minute call work? Book a slot: [calendar link]

Your feedback makes FreelanceSkills better for 10,000+ professionals across South Africa.

With gratitude,
The FreelanceSkills Team

---

### Admin Dashboard View

- Total submissions: [count]
- Average NPS: [score]
- Top requested feature: [feature]
- Top pain point: [pain point]
- Promoters (9-10): [count] | Passives (7-8): [count] | Detractors (0-6): [count]
