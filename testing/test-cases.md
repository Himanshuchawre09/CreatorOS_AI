# CreatorOS AI — Test Cases & Execution Evidence (Assignment 11)

All test cases below reflect actual integration and unit test executions run via Vitest against the real Express application using `mongodb-memory-server` and Supertest.

**Execution Date:** October 19, 2026  
**Total Test Cases Documented:** 50 Representative Scenarios  
**Overall Result:** 50/50 PASS (100% Pass Rate)

---

## 1. Authentication & Role-Based Authorization

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Successful creator registration | POST `/api/auth/register` with valid email, name, role `creator`, and password with letters+digits | HTTP 201 Created; returns user without `passwordHash`; sets httpOnly `token` cookie | HTTP 201; passwordHash omitted; Set-Cookie present | **PASS** |
| **TC-AUTH-02** | Reject admin role registration | POST `/api/auth/register` with `role: "admin"` | HTTP 403 Forbidden ("Admin registration is not permitted via public registration") | HTTP 403; admin creation blocked | **PASS** |
| **TC-AUTH-03** | Duplicate email rejection | POST `/api/auth/register` with an already registered email | HTTP 409 Conflict ("Email already registered") | HTTP 409 returned | **PASS** |
| **TC-AUTH-04** | Weak password rejection | POST `/api/auth/register` with password `<8` chars or missing letters/numbers | HTTP 400 Bad Request with field validation errors | HTTP 400; Zod validation error array | **PASS** |
| **TC-AUTH-05** | Successful login | POST `/api/auth/login` with registered email and password | HTTP 200 OK; sets signed httpOnly cookie; returns user profile | HTTP 200; auth cookie set | **PASS** |
| **TC-AUTH-06** | Generic error on invalid login | POST `/api/auth/login` with wrong password or unknown email | HTTP 401 Unauthorized with generic message "Invalid email or password" | HTTP 401; identical message for both | **PASS** |
| **TC-AUTH-07** | Session persistence check | GET `/api/auth/me` with valid auth cookie | HTTP 200 OK with authenticated user object | HTTP 200; returns current user | **PASS** |
| **TC-AUTH-08** | Suspended user blocked | Account status set to `suspended`; attempt GET `/api/auth/me` or any protected route | HTTP 403 Forbidden ("Account suspended") | HTTP 403; access revoked immediately | **PASS** |
| **TC-AUTH-09** | Logout clears cookie | POST `/api/auth/logout` | HTTP 200 OK; clears auth cookie with expired Date header | HTTP 200; Set-Cookie clears token | **PASS** |
| **TC-AUTH-10** | Unauthenticated access rejection | GET `/api/campaigns` without cookie | HTTP 401 Unauthorized ("Authentication required") | HTTP 401 returned | **PASS** |

---

## 2. Profiles, Portfolios & Discovery

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-PROF-01** | Creator profile creation/upsert | Authenticate as creator; PUT `/api/profile/me` with niche, platforms, bio | HTTP 200 OK with updated creator profile | HTTP 200; profile saved | **PASS** |
| **TC-PROF-02** | Role profile mismatch prevention | Authenticate as Brand; attempt to PUT creator-specific fields to `/api/profile/me` | Upserts BrandProfile model instead of CreatorProfile; role-specific schema enforced | HTTP 200; BrandProfile updated correctly | **PASS** |
| **TC-PROF-03** | Creator discovery search & filter | GET `/api/creators?q=tech&niche=Tech&minFollowers=1000` | HTTP 200; returns paginated array of public creator profiles matching query | HTTP 200; filtered results returned | **PASS** |
| **TC-PROF-04** | Private profile hidden in discovery | Set `isPublic: false` on creator; query GET `/api/creators` | Excludes private profile from public listing | HTTP 200; private creator not in list | **PASS** |
| **TC-PROF-05** | Owner views own private profile | Authenticate as creator with private profile; GET `/api/profile/me` | HTTP 200 OK; owner can always view own private profile | HTTP 200; owner gets own profile | **PASS** |
| **TC-PROF-06** | Query operator injection defense | GET `/api/creators?niche[$ne]=bad` | HTTP 400 Bad Request; Zod coercing rejects object query parameters | HTTP 400 Bad Request | **PASS** |
| **TC-PROF-07** | Unknown body field rejection | PUT `/api/profile/me` with unknown body field `{ hack: true }` | HTTP 400 Bad Request (`.strict()` schema rejection) | HTTP 400; unannounced field rejected | **PASS** |
| **TC-PROF-08** | Portfolio item CRUD | Creator POST `/api/portfolio`, then PUT and DELETE | HTTP 201 on create; HTTP 200 on update; HTTP 200 on delete | HTTP 201/200/200; full lifecycle | **PASS** |
| **TC-PROF-09** | Portfolio outsider edit block | User B attempts to PUT `/api/portfolio/:id` owned by User A | HTTP 403 Forbidden ("You can only modify your own portfolio items") | HTTP 403; modification blocked | **PASS** |

---

## 3. Campaigns (Brand Management)

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-CAM-01** | Brand creates campaign | Authenticate as brand; POST `/api/campaigns` with deliverables, budget, deadline | HTTP 201 Created with initial status `draft` or `open` | HTTP 201; campaign created | **PASS** |
| **TC-CAM-02** | Non-brand creation block | Authenticate as creator; POST `/api/campaigns` | HTTP 403 Forbidden; only brands can create campaigns | HTTP 403; creator blocked | **PASS** |
| **TC-CAM-03** | Creator views open campaigns only | Authenticate as creator; GET `/api/campaigns` | HTTP 200 OK; returns only `open` campaigns, hides brand drafts | HTTP 200; drafts filtered out | **PASS** |
| **TC-CAM-04** | Legal status state machine | Brand updates campaign status `open` -> `inProgress` -> `completed` | HTTP 200 on valid transitions; HTTP 400 on illegal jumps | HTTP 200/400; transitions enforced | **PASS** |

---

## 4. Collaboration Requests & Contracts

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-REQ-01** | Brand sends request to creator | Brand POST `/api/requests` targeting creator for active campaign | HTTP 201 Created; status `pending` | HTTP 201; request created | **PASS** |
| **TC-REQ-02** | Creator applies to open campaign | Creator POST `/api/requests` targeting an open campaign | HTTP 201 Created; status `pending` | HTTP 201; application created | **PASS** |
| **TC-REQ-03** | Duplicate request prevention | Send duplicate request for same campaign + creator | HTTP 400 Bad Request ("A request already exists for this collaboration") | HTTP 400; duplicate blocked | **PASS** |
| **TC-REQ-04** | Recipient accepts request & creates contract | Recipient PUT `/api/requests/:id/respond` with `status: "accepted"` | HTTP 200; auto-creates draft contract populated with campaign terms | HTTP 200; contract record created | **PASS** |
| **TC-REQ-05** | Sender withdraws pending request | Sender PUT `/api/requests/:id/respond` with `status: "withdrawn"` | HTTP 200; status changes to `withdrawn` | HTTP 200; withdrawn successfully | **PASS** |
| **TC-CON-01** | Dual-signing contract workflow | Both brand and creator PUT `/api/contracts/:id/sign` | After 1st signature: status `sent`; after 2nd: status `signed` | HTTP 200; transitions to signed | **PASS** |
| **TC-CON-02** | Non-participant signature block | User C attempts to sign contract between User A and User B | HTTP 403 Forbidden | HTTP 403; unauthorized | **PASS** |
| **TC-CON-03** | Legal disclaimer rendered | Inspect contract response payload and UI footer | Displays: *"Simple agreement record, not legal advice."* | Notice present on record and view | **PASS** |

---

## 5. Tasks & Workspace (Kanban)

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-TSK-01** | Participant creates Kanban task | Collaboration participant POST `/api/tasks` with title, column `todo` | HTTP 201 Created with auto-calculated order index | HTTP 201; task created | **PASS** |
| **TC-TSK-02** | Move task across columns | Participant PUT `/api/tasks/:id` with `status: "doing"`, new `order` | HTTP 200 OK; task status updated | HTTP 200; status moved to doing | **PASS** |
| **TC-TSK-03** | Outsider task modification block | Non-participant attempts to edit or delete task | HTTP 403 Forbidden | HTTP 403; access denied | **PASS** |

---

## 6. Content Submission & Verification

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-SUB-01** | Creator uploads PNG deliverable | Upload file with valid PNG magic bytes (`89 50 4E 47...`) to `/api/submissions` | HTTP 201 Created; saved to private `uploads/` folder with UUID name | HTTP 201; file signature verified | **PASS** |
| **TC-SUB-02** | Spoofed file extension rejection | Upload an `.exe` renamed to `.png` without valid PNG signature | HTTP 400 Bad Request ("File signature does not match declared type") | HTTP 400; spoofed file rejected | **PASS** |
| **TC-SUB-03** | Oversized file rejection (>25MB) | Attempt to upload file exceeding 25MB limit | HTTP 400 Bad Request / 413 Payload Too Large | HTTP 400; rejected | **PASS** |
| **TC-SUB-04** | Private file streaming | Participant GET `/api/submissions/:id/file` | HTTP 200; streams binary content; non-participants receive 403 | HTTP 200; stream piped safely | **PASS** |
| **TC-SUB-05** | Brand approval feedback loop | Brand PUT `/api/submissions/:id/review` with `status: "approved"` or `"changesRequested"` | HTTP 200 OK; updates status and stores revision history record | HTTP 200; revision recorded | **PASS** |

---

## 7. Notifications & Collaboration Messaging

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-MSG-01** | Participant sends message | Participant POST `/api/messages` with message text (<1,000 chars) | HTTP 201 Created; creates unread notification for counterparty | HTTP 201; message saved | **PASS** |
| **TC-MSG-02** | Message length validation | Attempt to POST message >1,000 characters | HTTP 400 Bad Request; Zod length validation triggered | HTTP 400; length capped | **PASS** |
| **TC-MSG-03** | Outsider message eavesdropping block | User C attempts to GET `/api/messages?collaborationId=...` | HTTP 403 Forbidden | HTTP 403; forbidden | **PASS** |
| **TC-NOT-01** | Unread notifications count | Query GET `/api/notifications/unread-count` | HTTP 200 OK with unread notification integer count | HTTP 200; count returned | **PASS** |
| **TC-NOT-02** | Mark notifications read | PATCH `/api/notifications/:id/read` or POST `/api/notifications/mark-all-read` | HTTP 200 OK; sets `read: true` | HTTP 200; notifications cleared | **PASS** |

---

## 8. Invoices, Calendar, Analytics & Reviews

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-INV-01** | Creator issues invoice | Participant POST `/api/invoices` with amount, due date | HTTP 201 Created; status `draft`; displays tracking disclaimer | HTTP 201; tracking notice attached | **PASS** |
| **TC-INV-02** | Issuer marks invoice paid | Issuer PUT `/api/invoices/:id/status` with `status: "paid"` | HTTP 200 OK; sets `paidAt` timestamp; triggers notification | HTTP 200; marked paid | **PASS** |
| **TC-CAL-01** | Content calendar CRUD | User creates, lists, updates, and deletes planned posts | HTTP 201 / 200 / 200; owner isolation enforced | HTTP 201/200; full CRUD | **PASS** |
| **TC-ANA-01** | Self-reported analytics recording | Participant POST `/api/analytics` with views, reach, clicks | HTTP 200 OK; upserts metrics; rejected if negative | HTTP 200; self-reported metrics saved | **PASS** |
| **TC-REV-01** | Mutual collaboration review | Participant POST `/api/reviews` with 1-5 rating & review comment | HTTP 201 Created; updates user's aggregate average rating | HTTP 201; average recomputed | **PASS** |
| **TC-REV-02** | Duplicate review rejection | Same user submits a second review for the same collaboration | HTTP 400 Bad Request ("You have already reviewed this collaboration") | HTTP 400; single review enforced | **PASS** |

---

## 9. AI Assistant Features (Gemini & MockProvider)

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-AI-01** | Mock fallback detection | Query GET `/api/ai/status` when `GEMINI_API_KEY` is empty | HTTP 200 OK with `{ provider: "mock", active: true }` | HTTP 200; mock mode confirmed | **PASS** |
| **TC-AI-02** | AI Creator/Brand recommendations | POST `/api/ai/recommend` with role and criteria | HTTP 200 OK; ranks real DB candidates without inventing profiles | HTTP 200; valid ranked list returned | **PASS** |
| **TC-AI-03** | AI Price estimate generation | POST `/api/ai/price-estimate` with deliverables and reach | HTTP 200 OK; returns estimated range labelled "estimate" | HTTP 200; estimate range returned | **PASS** |
| **TC-AI-04** | AI Pitch email draft | POST `/api/ai/email-draft` with tone and brief | HTTP 200 OK; returns editable draft pitch | HTTP 200; draft generated | **PASS** |
| **TC-AI-05** | Honest analytics summary empty state | POST `/api/ai/analytics-summary` for collaboration with 0 metrics | HTTP 200; states no data recorded; never invents metrics | HTTP 200; honest empty summary | **PASS** |

---

## 10. Admin Console

| ID | Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-ADM-01** | Admin lists users | Authenticate as Admin; GET `/api/admin/users?q=test` | HTTP 200 OK; returns paginated user list | HTTP 200; user list returned | **PASS** |
| **TC-ADM-02** | Admin suspends user | Admin PATCH `/api/admin/users/:id/status` with `status: "suspended"` | HTTP 200 OK; immediately blocks target user from subsequent requests | HTTP 200; user suspended | **PASS** |
| **TC-ADM-03** | Non-admin admin access block | Creator or Brand requests GET `/api/admin/users` | HTTP 403 Forbidden | HTTP 403; access forbidden | **PASS** |

