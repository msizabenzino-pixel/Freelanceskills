import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white pt-32 pb-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-white/80">Last updated: February 2026</p>
          </div>
        </section>

      <main id="main-content" className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                FreelanceSkills (Pty) Ltd ("we", "us", "our"), registered with CIPC under registration number 2026/070509/09 and located at Tableview, Cape Town, South Africa, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at www.freelanceskills.co.za.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                This policy complies with the Protection of Personal Information Act (POPIA) of South Africa and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2 mt-4">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Name, email address, and phone number</li>
                <li>Physical address and location data</li>
                <li>ID number or passport number (for verification)</li>
                <li>Profile information (skills, experience, portfolio)</li>
                <li>Payment and banking information</li>
                <li>Professional qualifications and certifications</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, clicks)</li>
                <li>Location data (with your consent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Create and manage your account</li>
                <li>Process transactions and payments</li>
                <li>Connect Clients with Freelancers</li>
                <li>Verify your identity and qualifications</li>
                <li>Communicate with you about services and updates</li>
                <li>Improve our platform and user experience</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li><strong>Other Users:</strong> Your profile information is visible to other Users as necessary for the platform to function</li>
                <li><strong>Service Providers:</strong> Third parties who help us operate the platform (payment processors, hosting providers)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Your Rights Under POPIA</h2>
              <p className="text-muted-foreground leading-relaxed">
                Under the Protection of Personal Information Act, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Access your personal information we hold</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Lodge a complaint with the Information Regulator</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, contact us at privacy@freelanceskills.co.za
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage</li>
                <li>Personalize your experience</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings. Note that disabling cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than South Africa. We ensure appropriate safeguards are in place to protect your information in accordance with POPIA requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. The "Last updated" date at the top indicates when the policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related inquiries or to exercise your rights:
              </p>
              <ul className="list-none text-muted-foreground space-y-2 mt-4">
                <li><strong>FreelanceSkills (Pty) Ltd</strong></li>
                <li>CIPC Registration: 2026/070509/09</li>
                <li>Address: Tableview, Cape Town, South Africa</li>
                <li>Email: privacy@freelanceskills.co.za</li>
                <li>Phone: 0800 123 456</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Information Regulator (South Africa)</strong><br />
                Website: www.inforegulator.org.za<br />
                Email: inforeg@justice.gov.za
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
