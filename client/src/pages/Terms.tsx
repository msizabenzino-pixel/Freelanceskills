import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white pt-32 pb-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-white/80">Last updated: February 2026</p>
          </div>
        </section>

      <main className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                Welcome to FreelanceSkills. These Terms of Service ("Terms") govern your use of the FreelanceSkills website and platform located at www.freelanceskills.co.za (the "Service") operated by FreelanceSkills (Pty) Ltd, a company registered in South Africa with CIPC registration number 2026/070509/09, located at Tableview, Cape Town, South Africa.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>"Platform"</strong> refers to the FreelanceSkills website and all related services.</li>
                <li><strong>"User"</strong> refers to any person who accesses or uses the Platform.</li>
                <li><strong>"Client"</strong> refers to Users who post jobs or hire Freelancers.</li>
                <li><strong>"Freelancer"</strong> refers to Users who offer services on the Platform.</li>
                <li><strong>"Service Package"</strong> refers to pre-defined services offered by Freelancers.</li>
                <li><strong>"Booking"</strong> refers to an agreement between a Client and Freelancer for services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
              <p className="text-slate-600 leading-relaxed">
                To use certain features of the Platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                <li>Immediately notify us if you discover any unauthorized use of your account</li>
                <li>Not create multiple accounts or accounts for others without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Platform Services</h2>
              <p className="text-slate-600 leading-relaxed">
                FreelanceSkills provides a marketplace platform connecting Clients with Freelancers. We do not:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Employ any Freelancers listed on the Platform</li>
                <li>Guarantee the quality, safety, or legality of services offered</li>
                <li>Guarantee the truth or accuracy of User listings or content</li>
                <li>Guarantee that transactions will be completed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Fees and Payments</h2>
              <p className="text-slate-600 leading-relaxed">
                FreelanceSkills charges a commission on completed transactions:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li><strong>Standard Users:</strong> 10% commission on completed jobs</li>
                <li><strong>Pro Subscribers:</strong> 5% commission (monthly subscription applies)</li>
                <li>All payments are processed through our secure escrow system</li>
                <li>Funds are released to Freelancers only upon successful completion and Client approval</li>
                <li>Refunds are subject to our Resolution Center policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. User Conduct</h2>
              <p className="text-slate-600 leading-relaxed">
                Users agree not to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Circumvent the Platform's payment system</li>
                <li>Share contact information to avoid Platform fees</li>
                <li>Harass, abuse, or harm other Users</li>
                <li>Use the Platform for any illegal activities</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-slate-600 leading-relaxed">
                The Platform and its original content, features, and functionality are owned by FreelanceSkills (Pty) Ltd and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                Users retain ownership of content they create and upload. By posting content, you grant FreelanceSkills a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content on the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Dispute Resolution</h2>
              <p className="text-slate-600 leading-relaxed">
                In the event of disputes between Users:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Users should first attempt to resolve disputes directly</li>
                <li>Unresolved disputes may be submitted to our Resolution Center</li>
                <li>FreelanceSkills reserves the right to make final decisions on disputes</li>
                <li>Decisions made through the Resolution Center are binding</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed">
                To the maximum extent permitted by law, FreelanceSkills shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
              <p className="text-slate-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Platform will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-slate-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of South Africa. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify Users of significant changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">13. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-none text-slate-600 space-y-2 mt-4">
                <li><strong>FreelanceSkills (Pty) Ltd</strong></li>
                <li>CIPC Registration: 2026/070509/09</li>
                <li>Address: Tableview, Cape Town, South Africa</li>
                <li>Email: legal@freelanceskills.co.za</li>
                <li>Phone: 0800 123 456</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
