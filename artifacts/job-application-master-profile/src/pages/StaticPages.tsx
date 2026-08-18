import { ArrowLeft } from 'lucide-react';

export type StaticPageId =
  | 'privacy-policy'
  | 'terms-of-service'
  | 'about-us'
  | 'contact'
  | 'resume-tips'
  | 'ats-resume-guide'
  | 'how-it-works';

interface StaticPagesProps {
  page: StaticPageId;
  onBack: () => void;
  onNavigate: (page: StaticPageId) => void;
  onStartBuilding?: () => void;
}

function Logo() {
  return (
    <span className="logo" style={{ textDecoration: 'none' }}>
      <b>↗</b>Resume<span>Redefined</span>
    </span>
  );
}

export default function StaticPages({ page, onBack, onNavigate, onStartBuilding }: StaticPagesProps) {
  return (
    <div className="landing-page graph-canvas">
      <main>
        <nav className="nav container" id="top">
          <div className="nav-logo-row">
            <a className="logo" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              <b>↗</b>Resume<span>Redefined</span>
            </a>
          </div>
          <div className="nav-row">
            <a className="save-login" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              <ArrowLeft size={14} /> HOME
            </a>
          </div>
        </nav>

        <section className="static-page container">
          {page === 'privacy-policy' && <PrivacyPolicy onNavigate={onNavigate} />}
          {page === 'terms-of-service' && <TermsOfService onNavigate={onNavigate} />}
          {page === 'about-us' && <AboutUs />}
          {page === 'contact' && <ContactPage />}
          {page === 'resume-tips' && <ResumeTips />}
          {page === 'ats-resume-guide' && <ATSResumeGuide />}
          {page === 'how-it-works' && <HowItWorks onStartBuilding={onStartBuilding} />}
        </section>

        <footer className="site-footer container">
          <div className="footer-bottom" style={{ borderTop: 'var(--stroke-width) solid var(--stroke-main)', paddingTop: '22px' }}>
            <small>&copy; 2026 Resume Redefined</small>
            <a href="mailto:resumeredefined@gmail.com">resumeredefined@gmail.com</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*  PRIVACY POLICY                              */
/* ════════════════════════════════════════════ */
function PrivacyPolicy({ onNavigate }: { onNavigate: (page: StaticPageId) => void }) {
  return (
    <>
      <p className="kicker">&mdash; LEGAL</p>
      <h1>Privacy Policy</h1>
      <p className="static-subtitle">Last updated: August 2026</p>

      <h2>1. Information We Collect</h2>
      <p>When you create an account, we collect your <strong>email address</strong> and a <strong>hashed password</strong>. When you use the resume builder, we collect the career information you enter — work history, education, skills, and summary text. This data is stored solely to generate and save your resumes.</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To authenticate you and keep your session secure</li>
        <li>To store, retrieve, and update your resume data</li>
        <li>To generate PDF and DOCX downloads of your resume</li>
        <li>To improve the product based on aggregate, anonymised usage patterns</li>
      </ul>
      <p>We do <strong>not</strong> sell, rent, or share your personal data with any third party for marketing purposes.</p>

      <h2>3. Data Storage &amp; Security</h2>
      <p>Your data is stored in a PostgreSQL database on secure servers. Passwords are hashed using bcrypt before storage — we never store or log plain-text passwords. All API communication is encrypted over HTTPS in production. Access to the database is restricted to the application server only.</p>

      <h2>4. Cookies &amp; Local Storage</h2>
      <p>We use a <strong>JWT token</strong> stored in your browser's localStorage to keep you logged in. This token expires and is refreshed on each session. We also use localStorage to save your in-progress answers so you don't lose work if your browser crashes. No third-party tracking cookies are used.</p>

      <h2>5. Your Rights (India — IT Act, 2000 &amp; DPDP Act, 2023)</h2>
      <p>Under Indian data protection law, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> — request a copy of all data we hold about you</li>
        <li><strong>Correction</strong> — update or correct inaccurate personal data</li>
        <li><strong>Deletion</strong> — request that we permanently delete your account and all associated data</li>
        <li><strong>Grievance redressal</strong> — contact us at <a href="mailto:resumeredefined@gmail.com">resumeredefined@gmail.com</a> with any concerns</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>Your data is retained for as long as your account is active. If you delete your account, all associated resume data is permanently removed from our servers within 30 days.</p>

      <h2>7. Children's Privacy</h2>
      <p>Resume Redefined is not intended for children under 13. We do not knowingly collect personal information from children.</p>

      <h2>8. Changes to This Policy</h2>
      <p>We may update this policy from time to time. Material changes will be communicated via the website. Continued use after changes constitutes acceptance.</p>

      <h2>9. Contact</h2>
      <p>For any privacy-related questions or requests, email us at <a href="mailto:resumeredefined@gmail.com">resumeredefined@gmail.com</a>.</p>
      <p style={{ marginTop: '24px' }}>
        See also: <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms-of-service'); }}>Terms of Service</a>
      </p>
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  TERMS OF SERVICE                            */
/* ════════════════════════════════════════════ */
function TermsOfService({ onNavigate }: { onNavigate: (page: StaticPageId) => void }) {
  return (
    <>
      <p className="kicker">&mdash; LEGAL</p>
      <h1>Terms of Service</h1>
      <p className="static-subtitle">Last updated: August 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using Resume Redefined ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

      <h2>2. Description of Service</h2>
      <p>Resume Redefined is a free, web-based resume builder that helps you create professional resumes in PDF and DOCX formats. The Service includes a questionnaire-based profile builder, 40 template designs, and a live preview feature.</p>

      <h2>3. User Accounts</h2>
      <ul>
        <li>You must provide a valid email address and a secure password to create an account.</li>
        <li>You are responsible for maintaining the confidentiality of your password.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>You must be at least 13 years old to use the Service.</li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>You agree <strong>not</strong> to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose</li>
        <li>Attempt to gain unauthorised access to the Service, its servers, or other users' accounts</li>
        <li>Upload malicious content, scripts, or files</li>
        <li>Reverse-engineer, decompile, or disassemble the Service</li>
        <li>Create automated accounts or use bots to interact with the Service</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>The Service — including its design, code, templates, and branding — is owned by Resume Redefined. You retain full ownership of the resume content you create. We claim no rights over your personal career information.</p>

      <h2>6. Disclaimer of Warranties</h2>
      <p>The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that your resume will result in job interviews or employment. ATS compatibility depends on the specific employer's system and is not guaranteed.</p>

      <h2>7. Limitation of Liability</h2>
      <p>To the maximum extent permitted under Indian law (including the Information Technology Act, 2000 and its amendments), Resume Redefined shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>

      <h2>8. Termination</h2>
      <p>We may suspend or terminate your account if you violate these Terms. You may delete your account at any time by contacting us at <a href="mailto:resumeredefined@gmail.com">resumeredefined@gmail.com</a>.</p>

      <h2>9. Governing Law</h2>
      <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>

      <h2>10. Changes to Terms</h2>
      <p>We reserve the right to modify these Terms at any time. Changes take effect when posted on this page. Your continued use of the Service constitutes acceptance of the updated Terms.</p>

      <h2>11. Contact</h2>
      <p>Questions about these Terms? Email <a href="mailto:resumeredefined@gmail.com">resumeredefined@gmail.com</a>.</p>
      <p style={{ marginTop: '24px' }}>
        See also: <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy-policy'); }}>Privacy Policy</a>
      </p>
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  ABOUT US                                    */
/* ════════════════════════════════════════════ */
function AboutUs() {
  return (
    <>
      <p className="kicker">&mdash; OUR STORY</p>
      <h1>About Resume Redefined</h1>

      <p className="static-lead">
        Resume Redefined started with one observation: building a resume shouldn't feel like a chore.
      </p>

      <p>This is a solo project — built by one person who believes that everyone deserves a resume that tells their story clearly and confidently. No VC funding, no growth hacks, no dark patterns. Just a tool built with care, for people who care about their work.</p>

      <p>I watched friends and classmates struggle with resume builders that either produced generic, ugly documents or charged $20/month for something that should be free. So I decided to build something different — a tool that asks the right questions, designs around your real experience, and gives you a resume that actually represents who you are.</p>

      <h2>What we believe</h2>
      <ul>
        <li><strong>One profile, every resume.</strong> Answer once, generate as many variations as you need — for different roles, companies, and industries.</li>
        <li><strong>Nothing invented.</strong> We don't pad your resume with buzzwords or fake achievements. We help you tell your real story, well.</li>
        <li><strong>Design matters.</strong> 40 templates across 4 categories — because how your resume looks is as important as what it says.</li>
        <li><strong>Free should mean free.</strong> No paywalls, no watermarks, no "premium" upsells. Your career story belongs to you.</li>
      </ul>

      <h2>Built with intention</h2>
      <p>Every feature in Resume Redefined exists because someone needed it. The questionnaire was designed based on what recruiters actually look for. The templates were crafted for different industries and career stages. The live preview updates as you type because you shouldn't have to guess what your resume looks like.</p>

      <p>This is a project built for the sake of better things — better resumes, better first impressions, better careers. If it helps even one person land the job they deserve, it's worth every line of code.</p>

      <div className="static-card">
        <h3>Get in touch</h3>
        <p>Have feedback, suggestions, or just want to say hi? We'd love to hear from you.</p>
        <p><a href="mailto:resumeredefined@gmail.com"><strong>resumeredefined@gmail.com</strong></a></p>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  CONTACT                                     */
/* ════════════════════════════════════════════ */
function ContactPage() {
  return (
    <>
      <p className="kicker">&mdash; SAY HELLO</p>
      <h1>Contact Us</h1>

      <p className="static-lead">
        Questions, feedback, or just want to share how your job search is going — we're here.
      </p>

      <div className="static-card">
        <h3>Email</h3>
        <p>The best way to reach us. We read every message and respond within 24–48 hours.</p>
        <p style={{ marginTop: '8px' }}>
          <a href="mailto:resumeredefined@gmail.com" style={{ fontSize: '18px', fontWeight: 700 }}>
            resumeredefined@gmail.com
          </a>
        </p>
      </div>

      <h2>What to include in your message</h2>
      <ul>
        <li><strong>Bug reports:</strong> Describe what happened, what you expected, and which browser/device you're using.</li>
        <li><strong>Feature requests:</strong> Tell us what you need and why — we prioritise based on real user needs.</li>
        <li><strong>Account issues:</strong> Include the email address associated with your account.</li>
        <li><strong>Data requests:</strong> If you want to export or delete your data, mention it clearly in the subject line.</li>
      </ul>

      <h2>Response time</h2>
      <p>We're a small team (one person, actually), so please allow <strong>1–2 business days</strong> for a response. Complex issues may take a little longer, but we'll always get back to you.</p>
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  RESUME TIPS                                 */
/* ════════════════════════════════════════════ */
function ResumeTips() {
  return (
    <>
      <p className="kicker">&mdash; RESOURCES</p>
      <h1>Resume Tips</h1>
      <p className="static-subtitle">Practical advice to make your resume stand out.</p>

      <h2>1. Lead with impact, not duties</h2>
      <p>Don't write "Responsible for managing a team of 5." Instead write: <em>"Led a 5-person engineering team that shipped 3 product launches, reducing time-to-market by 30%."</em> Recruiters want results, not job descriptions.</p>

      <h2>2. Quantify everything</h2>
      <p>Numbers catch the eye and prove value. Revenue generated, users served, time saved, percentage improved — if you can put a number on it, do it.</p>

      <h2>3. Tailor for each application</h2>
      <p>A generic resume goes to no one. Read the job description, mirror the language, and highlight the experience most relevant to that specific role. With Resume Redefined, one profile generates tailored resumes for different roles.</p>

      <h2>4. Keep it to one page (usually)</h2>
      <p>If you have less than 10 years of experience, one page is enough. More experienced professionals can go to two pages. Cut ruthlessly — if a bullet point doesn't strengthen your case for this specific job, remove it.</p>

      <h2>5. Use strong action verbs</h2>
      <p>Start every bullet with a power verb: <strong>Led, Built, Launched, Designed, Improved, Reduced, Automated, Delivered, Mentored, Shipped.</strong> Avoid weak openers like "Worked on" or "Helped with."</p>

      <h2>6. Write a real summary</h2>
      <p>Skip the generic "Hardworking professional seeking a challenging role." Instead: <em>"Full-stack engineer with 4 years of experience building high-traffic web applications. Expert in React, Node.js, and cloud infrastructure. Seeking to apply systems thinking at scale."</em></p>

      <h2>7. Proofread backwards</h2>
      <p>Read your resume from bottom to top. Your brain expects familiar patterns when reading forward — reading backwards forces you to see every word and catch typos.</p>

      <h2>8. Use a clean, professional format</h2>
      <p>Fancy graphics, columns, and icons look great on screen but often break ATS parsers. Stick to clean, single-column layouts with standard section headers. Our ATS-safe templates are designed exactly for this.</p>

      <h2>9. Include a skills section</h2>
      <p>List technical skills, tools, and technologies relevant to the role. This is where ATS keyword matching happens most heavily. Don't lie — only list what you can actually discuss in an interview.</p>

      <h2>10. Save as PDF</h2>
      <p>Unless the application specifically asks for a Word document, always submit a PDF. PDFs preserve formatting across all devices and operating systems.</p>
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  ATS RESUME GUIDE                            */
/* ════════════════════════════════════════════ */
function ATSResumeGuide() {
  return (
    <>
      <p className="kicker">&mdash; RESOURCES</p>
      <h1>ATS Resume Guide</h1>
      <p className="static-subtitle">How to make your resume pass Applicant Tracking Systems.</p>

      <h2>What is an ATS?</h2>
      <p>An Applicant Tracking System (ATS) is software that employers use to scan, rank, and filter resumes before a human ever sees them. Studies show that <strong>75% of resumes are rejected by ATS</strong> before reaching a recruiter. If your resume isn't ATS-friendly, it doesn't matter how qualified you are.</p>

      <h2>How ATS works</h2>
      <ol>
        <li>The employer uploads a batch of resumes into the ATS</li>
        <li>The system parses each resume into structured data (name, experience, education, skills)</li>
        <li>It scores and ranks candidates based on keyword matches against the job description</li>
        <li>Recruiters review only the top-ranked resumes</li>
      </ol>

      <h2>Common reasons resumes fail ATS parsing</h2>
      <ul>
        <li><strong>Complex layouts</strong> — multi-column designs, tables, text boxes, and headers/footers confuse parsers</li>
        <li><strong>Graphics and icons</strong> — ATS can't read images, charts, or decorative elements</li>
        <li><strong>Non-standard section headers</strong> — "My Journey" instead of "Experience" won't be recognised</li>
        <li><strong>Fancy fonts</strong> — script or decorative fonts can't be parsed</li>
        <li><strong>File format</strong> — some ATS can't read .pages, .odt, or image-based PDFs</li>
      </ul>

      <h2>How to make your resume ATS-safe</h2>

      <h3>1. Use a single-column layout</h3>
      <p>Single-column resumes parse cleanly. Avoid sidebars, two-column layouts, and text boxes. Our "ATS Safe" template category is designed specifically for this.</p>

      <h3>2. Use standard section headers</h3>
      <p>Stick to: <strong>Professional Summary, Experience, Education, Skills, Certifications, Projects.</strong> These are what ATS systems are trained to recognise.</p>

      <h3>3. Include keywords from the job description</h3>
      <p>Read the job posting carefully. If they mention "React," "agile," and "CI/CD," make sure those exact terms appear in your resume. Don't use synonyms — "version control" won't match "Git."</p>

      <h3>4. Use a standard font</h3>
      <p>Stick to system fonts: Arial, Calibri, Helvetica, Times New Roman, or clean sans-serif fonts like Inter or DM Sans. Avoid decorative or script fonts entirely.</p>

      <h3>5. Save as PDF or DOCX</h3>
      <p>Most modern ATS can parse both. PDF preserves formatting; DOCX is the safest for older systems. When in doubt, submit both if the application allows it.</p>

      <h3>6. Don't use headers/footers for critical info</h3>
      <p>Some ATS systems skip header and footer sections entirely. Put your name, email, and phone in the main body of the document.</p>

      <div className="static-card">
        <h3>Resume Redefined's ATS-Safe Templates</h3>
        <p>Our "ATS Safe" template category features single-column layouts, standard section headers, and parser-friendly formatting. These templates are designed to pass ATS scanning while still looking professional to human eyes.</p>
        <p><a href="#" onClick={(e) => { e.preventDefault(); }} style={{ fontWeight: 700 }}>Browse templates &rarr;</a></p>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  HOW IT WORKS                                */
/* ════════════════════════════════════════════ */
function HowItWorks({ onStartBuilding }: { onStartBuilding?: () => void }) {
  return (
    <>
      <p className="kicker">&mdash; THE PROCESS</p>
      <h1>How It Works</h1>
      <p className="static-lead">
        Four steps from blank page to a resume you're proud of.
      </p>

      <div className="static-steps">
        <div className="static-step">
          <div className="static-step-num">1</div>
          <h3>Pick your category</h3>
          <p>Tell us where you are in your career — student, working professional, freelancer, executive. We tailor the questions to match your experience level and industry.</p>
        </div>

        <div className="static-step">
          <div className="static-step-num">2</div>
          <h3>Choose a template</h3>
          <p>Browse 40 professionally designed templates across 4 categories: ATS Safe, Modern Professional, Industry-specific, and Career Stage. You can always switch later.</p>
        </div>

        <div className="static-step">
          <div className="static-step-num">3</div>
          <h3>Answer the questions</h3>
          <p>Our structured questionnaire walks you through every section — summary, experience, education, skills, and projects. Import an existing resume to pre-fill answers, or start fresh. Your answers build a master profile that powers every resume you create.</p>
        </div>

        <div className="static-step">
          <div className="static-step-num">4</div>
          <h3>Preview &amp; download</h3>
          <p>See your resume update live as you type. Adjust settings — margins, font size, section order. When you're happy, download as PDF or DOCX. Ready to send.</p>
        </div>
      </div>

      <div className="static-cta">
        <h2>Ready to build your resume?</h2>
        <p>One profile. Every resume. Nothing invented — just your real work, told well.</p>
        {onStartBuilding && (
          <a className="button" href="#" onClick={(e) => { e.preventDefault(); onStartBuilding(); }}>
            START BUILDING <b>&rarr;</b>
          </a>
        )}
      </div>
    </>
  );
}
