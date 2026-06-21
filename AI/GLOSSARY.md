# Glossary

APC-specific vocabulary used throughout the codebase, forms, and documentation. Read this before working on domain logic, form fields, or any content that references the tribal cooperative sector.

---

## Organisation

| Term | Definition |
|------|-----------|
| **APC** | **Adivasi Producer Company** — the organisation that owns this project. A Producer Company registered under the Companies Act, 2013, Section 581A–581ZL. APC empowers tribal communities in Odisha, India through digital services, market linkage, and cooperative equity ownership. |
| **Adivasi** | Indigenous tribal people of India. The primary community APC serves. Adivasi communities have constitutional protections (Scheduled Tribes) and legal rights to forest land (Forest Rights Act). |
| **Producer Company** | A type of company under Indian company law that is owned and governed by producers (farmers, artisans, etc.). Profits are shared among member-shareholders. Similar to a cooperative but with a corporate structure. |
| **DSC** | **Digital Service Centre** — APC's physical service counters where staff assist community members with government schemes, digital applications, and financial services. |
| **AGM** | **Annual General Meeting** — the formal governance meeting at which APC shareholders vote on company decisions, elect directors, and review financial reports. |

---

## Membership & Shareholding

| Term | Definition |
|------|-----------|
| **Shareholder** | A tribal community member who has subscribed to APC equity shares. Each share costs ₹10,000. Members can subscribe between 1 and 10 shares. Shareholders own the cooperative and are entitled to dividends, governance votes at the AGM, and priority access to APC services. |
| **Share** | One unit of APC equity. Face value: ₹10,000. A shareholder who subscribes to 3 shares contributes ₹30,000 in Share Capital. |
| **Share Capital** | The total monetary value of equity shares subscribed by a member. Payment is made offline via a bank receipt — **no online payment is accepted through this website**. |
| **Application ID** | A unique reference number assigned to each shareholder membership application. Format: `APC-YYYY-XXXXXX` (e.g., `APC-2026-847293`). Currently generated client-side (see `src/lib/application-id.ts`); will be server-generated in Phase 7. |
| **Nominee** | A person designated by a shareholder to inherit their shares in the event of the shareholder's death. Nominee details are collected in Step 5 of the shareholder application wizard. The nominee must be a family member. |

---

## People & Roles

| Term | Definition |
|------|-----------|
| **Producer** | A person engaged in any qualifying primary production activity. This is the eligibility criterion for APC membership. See *Producer Activity* below. |
| **Producer Activity** | The specific livelihood activity that qualifies a person as a Producer. Accepted categories: Agriculture, Horticulture, Silviculture and Forest Products, Animal Husbandry, Pisciculture (fishing), Handcraft, Handicraft, and Cottage Industry. Proof is required. |
| **Coordinator / Block Coordinator** | An APC field staff member assigned to a specific geographic Block. Responsibilities: visit applicant villages, verify producer eligibility, collect physical signatures, witness document originals, and confirm application details with APC headquarters. |
| **Director** | A member of APC's Board of Directors. Directors are elected by shareholders at the AGM and govern the company. The founding directors are documented in `src/data/directors.ts`. |

---

## Geography (India-Specific)

| Term | Definition |
|------|-----------|
| **Village** | The smallest settlement unit. An applicant's primary residential address begins with their village name. |
| **Gram Panchayat (GP)** | The lowest tier of elected local government in rural India. A Gram Panchayat covers a cluster of villages. It is the address level above *Village* in the shareholder application form. |
| **Block** | An administrative unit above the Gram Panchayat, below the District. APC organises its Block Coordinators by Block. The shareholder application form collects the applicant's Block name. |
| **District** | An administrative unit above the Block. APC currently operates primarily in **Rayagada district**, Odisha. The address form includes a District field. |
| **Taluk / Tehsil** | Equivalent to Block in some Indian states. Not used in APC forms — use Block. |
| **PIN Code** | Indian postal code (6 digits). Collected in the address section of the shareholder application. |

---

## Documents

| Term | Definition |
|------|-----------|
| **Aadhaar Card** | India's national biometric identity card issued by UIDAI. Contains a 12-digit Aadhaar number and biometric data. Required for all APC shareholder applications. The number is collected in the form (Step 1) and the physical document scan is uploaded in Step 7. |
| **PAN Card** | **Permanent Account Number** — a 10-character alphanumeric tax identity card issued by the Income Tax Department. Optional for APC applications (required only for applicants who pay income tax). |
| **Proof of Producer Activity** | A document verifying that the applicant engages in qualifying production. Accepted documents: *Patta*, *FRA Certificate*, or a Certificate from an APC Coordinator. |
| **Patta** | A land ownership document issued by the government to a farmer, confirming their rights to a specific plot of land. Accepted as proof of agricultural activity. |
| **FRA Certificate** | **Forest Rights Act Certificate** — issued under the Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006. Proves a tribal person's right to forest land. Accepted as proof of forestry/NTFP activity. |
| **Bank Passbook** | A physical record of a bank account, containing the account holder's name, account number, IFSC code, and bank branch details. The front page is uploaded as proof of bank details in Step 7. |
| **Passport Size Photograph** | A standard 3.5cm × 4.5cm portrait photograph. Required for the shareholder application. |

---

## Financial

| Term | Definition |
|------|-----------|
| **IFSC Code** | **Indian Financial System Code** — an 11-character code identifying a specific bank branch in India (format: `SBIN0001234`). Required in the bank details step of the shareholder application. |
| **Account Number** | The applicant's bank account number. Collected in Step 6 of the shareholder application wizard. |

---

## Government Schemes

These are referenced in APC's digital services and notices.

| Term | Definition |
|------|-----------|
| **PM-Kisan** | **Pradhan Mantri Kisan Samman Nidhi** — a central government scheme providing ₹6,000/year in direct income support to eligible farmers in three instalments. APC assists farmers with registration. |
| **Subhadra Yojana** | An Odisha state government welfare scheme providing financial assistance to women beneficiaries. Referenced in APC notices. |
| **e-Shram** | A central government portal for registering unorganised sector workers. APC Digital Service Centres assist with registration. |
| **PMJDY** | **Pradhan Mantri Jan Dhan Yojana** — a national financial inclusion scheme providing zero-balance bank accounts to unbanked individuals. |

---

## Verification Process

| Term | Definition |
|------|-----------|
| **Verification** | The process after digital application submission. A Block Coordinator physically visits the applicant's village to: (1) verify the applicant's identity against Aadhaar, (2) confirm producer eligibility, (3) collect physical document copies, (4) obtain the applicant's physical signature on the paper application form. |
| **Onboarding Timeline** | The 5-step journey after a shareholder submits their digital application: (1) Submitted → (2) APC Coordinator Review → (3) Phone Verification → (4) Share Capital Payment → (5) Approved & Certification. Shown on the success dashboard. |
