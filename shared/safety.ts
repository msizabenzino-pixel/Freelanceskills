// Content moderation and safety filters for FreelanceSkill
// Based on safety measures from FSN-competitor-A, FSN-competitor-B, Guru, FSN-competitor-D, FlexJobs, TaskRabbit

// Patterns to detect off-platform transaction attempts
const BLOCKED_PATTERNS = {
  // Bank account numbers (SA format and generic)
  bankAccount: /\b\d{6,16}\b.*(?:bank|account|acc|deposit|transfer)/i,
  
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  
  // Phone numbers (SA and international)
  phone: /(?:\+?27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\+?\d{10,15}/g,
  
  // WhatsApp/Telegram mentions
  messaging: /\b(whatsapp|telegram|signal|wechat|viber)\b/gi,
  
  // External payment methods
  externalPayment: /\b(paypal|venmo|zelle|cash\s*app|wise|western\s*union|moneygram|eft\s*direct|bank\s*transfer|direct\s*deposit|my\s*bank|send\s*money)\b/gi,
  
  // Cash payment attempts
  cashPayment: /\b(cash|pay\s*me\s*directly|outside\s*the\s*platform|off[\s-]?platform|side\s*deal|private\s*deal)\b/gi,
  
  // Social media handles
  socialMedia: /\b(instagram|facebook|twitter|linkedin|tiktok)[\s:@]?\s*[a-zA-Z0-9._]+/gi,
  
  // Website URLs
  urls: /https?:\/\/[^\s]+|www\.[^\s]+/gi,
  
  // Crypto addresses
  crypto: /\b(bitcoin|btc|ethereum|eth|usdt|crypto)[\s:]*[a-zA-Z0-9]{20,}/gi,
};

// Keywords that indicate potential scam attempts
const SCAM_KEYWORDS = [
  'send money first',
  'pay upfront',
  'wire transfer',
  'western union',
  'moneygram',
  'gift card',
  'prepaid card',
  'bitcoin payment',
  'crypto only',
  'urgently need',
  'act fast',
  'limited time',
  'guaranteed profit',
  'get rich',
  'work from home scam',
  'no experience needed pays well',
];

export interface SafetyCheckResult {
  isClean: boolean;
  violations: SafetyViolation[];
  sanitizedContent: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresReview: boolean;
}

export interface SafetyViolation {
  type: string;
  description: string;
  severity: 'warning' | 'blocked';
  matchedContent?: string;
}

export function checkMessageSafety(content: string): SafetyCheckResult {
  const violations: SafetyViolation[] = [];
  let sanitizedContent = content;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Check for email addresses
  const emails = content.match(BLOCKED_PATTERNS.email);
  if (emails) {
    violations.push({
      type: 'email_detected',
      description: 'Email addresses are not allowed in messages. Keep all communication on-platform for your safety.',
      severity: 'blocked',
      matchedContent: emails[0],
    });
    sanitizedContent = sanitizedContent.replace(BLOCKED_PATTERNS.email, '[EMAIL REMOVED]');
    riskLevel = 'high';
  }

  // Check for phone numbers
  const phones = content.match(BLOCKED_PATTERNS.phone);
  if (phones) {
    violations.push({
      type: 'phone_detected',
      description: 'Phone numbers are not allowed until after booking is confirmed. This protects both parties.',
      severity: 'blocked',
      matchedContent: phones[0],
    });
    sanitizedContent = sanitizedContent.replace(BLOCKED_PATTERNS.phone, '[PHONE REMOVED]');
    riskLevel = 'high';
  }

  // Check for external payment mentions
  const externalPayments = content.match(BLOCKED_PATTERNS.externalPayment);
  if (externalPayments) {
    violations.push({
      type: 'external_payment',
      description: 'External payment methods are not allowed. All payments must go through FreelanceSkills for escrow protection.',
      severity: 'blocked',
      matchedContent: externalPayments[0],
    });
    sanitizedContent = sanitizedContent.replace(BLOCKED_PATTERNS.externalPayment, '[PAYMENT METHOD REMOVED]');
    riskLevel = 'high';
  }

  // Check for messaging app mentions
  const messagingApps = content.match(BLOCKED_PATTERNS.messaging);
  if (messagingApps) {
    violations.push({
      type: 'messaging_app',
      description: 'External messaging apps are not allowed. Keep all communication on FreelanceSkills for your protection.',
      severity: 'warning',
      matchedContent: messagingApps[0],
    });
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  // Check for cash payment attempts
  const cashPayments = content.match(BLOCKED_PATTERNS.cashPayment);
  if (cashPayments) {
    violations.push({
      type: 'cash_payment',
      description: 'Cash payments and off-platform deals are strictly prohibited. You will lose buyer/seller protection.',
      severity: 'blocked',
      matchedContent: cashPayments[0],
    });
    riskLevel = 'high';
  }

  // Check for URLs
  const urls = content.match(BLOCKED_PATTERNS.urls);
  if (urls) {
    violations.push({
      type: 'external_url',
      description: 'External links are flagged for review. Be cautious of links to unfamiliar websites.',
      severity: 'warning',
      matchedContent: urls[0],
    });
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  // Check for scam keywords
  const lowerContent = content.toLowerCase();
  for (const keyword of SCAM_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      violations.push({
        type: 'scam_keyword',
        description: `Potential scam indicator detected. Be extremely cautious.`,
        severity: 'warning',
        matchedContent: keyword,
      });
      riskLevel = 'high';
      break;
    }
  }

  return {
    isClean: violations.filter(v => v.severity === 'blocked').length === 0,
    violations,
    sanitizedContent,
    riskLevel,
    requiresReview: riskLevel === 'high',
  };
}

// Platform safety disclaimers and warnings
export const SAFETY_DISCLAIMERS = {
  messaging: `
    🔒 KEEP IT SAFE: All communication should stay on FreelanceSkills.
    • Never share personal contact details before booking
    • Never agree to pay outside the platform
    • Report suspicious behavior immediately
  `,
  
  booking: `
    ✅ YOUR PROTECTION: When you book through FreelanceSkills:
    • Your payment is held securely in escrow
    • Funds are only released when you confirm completion
    • You have access to our dispute resolution team
    • Full transaction history for your records
  `,
  
  offPlatform: `
    ⚠️ WARNING: Deals made outside FreelanceSkills are NOT protected.
    • We cannot help recover payments made off-platform
    • You lose access to dispute resolution
    • No refund protection available
    • Both parties risk being permanently banned
  `,
  
  scamPrevention: `
    🚫 NEVER:
    • Pay before work is completed and approved
    • Share bank account or card details in messages
    • Click suspicious links or download unknown files
    • Accept requests to move communication off-platform
    • Pay with gift cards, crypto, or wire transfers
  `,
  
  freelancerSafety: `
    👷 FOR FREELANCERS:
    • Never start work before receiving platform confirmation
    • Document all work with photos/screenshots
    • Use the platform's milestone system for large projects
    • Report clients who request off-platform payment
  `,
  
  clientSafety: `
    👤 FOR CLIENTS:
    • Verify freelancer reviews and completed jobs
    • Use escrow - never pay directly to bank accounts
    • Set clear milestones and deliverables
    • Report freelancers who ask for direct payment
  `,
};

// Trust badges and verification levels
export const TRUST_BADGES = {
  identityVerified: {
    name: 'Identity Verified',
    icon: '✓',
    description: 'This user has verified their identity with government ID',
  },
  phoneVerified: {
    name: 'Phone Verified', 
    icon: '📱',
    description: 'Phone number has been verified via SMS',
  },
  emailVerified: {
    name: 'Email Verified',
    icon: '📧', 
    description: 'Email address has been verified',
  },
  backgroundChecked: {
    name: 'Background Checked',
    icon: '🛡️',
    description: 'Has passed background verification (for applicable categories)',
  },
  proMember: {
    name: 'Pro Member',
    icon: '⭐',
    description: 'Subscribed Pro member with enhanced accountability',
  },
  topRated: {
    name: 'Top Rated',
    icon: '🏆',
    description: 'Consistently high ratings from verified clients',
  },
};

// Report reasons
export const REPORT_REASONS = [
  { id: 'off_platform', label: 'Requesting off-platform payment', severity: 'high' },
  { id: 'scam', label: 'Suspected scam or fraud', severity: 'high' },
  { id: 'harassment', label: 'Harassment or inappropriate behavior', severity: 'high' },
  { id: 'fake_profile', label: 'Fake or misleading profile', severity: 'medium' },
  { id: 'spam', label: 'Spam or promotional content', severity: 'low' },
  { id: 'no_show', label: 'Did not show up for scheduled work', severity: 'medium' },
  { id: 'poor_quality', label: 'Work quality not as described', severity: 'medium' },
  { id: 'other', label: 'Other concern', severity: 'low' },
];
