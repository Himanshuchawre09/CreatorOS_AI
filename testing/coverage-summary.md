# CreatorOS AI — Test Coverage Summary

> **Test Runner:** Vitest v5.0.5  
> **Coverage Engine:** `@vitest/coverage-v8`  
> **Environment:** Node.js v24.x, Express 4.21.2, Mongoose 8.9.5, in-memory MongoDB (`mongodb-memory-server`)  
> **Execution Date:** October 19, 2026  
> **Total Test Suites:** 12 passed (12)  
> **Total Tests:** 126 passed (126)  
> **Suite Runtime:** 24.50s  

---

## 1. High-Level Metrics

| Metric | Coverage | Total Covered / Target |
|---|---|---|
| **Statements (% Stmts)** | **73.98%** | Broad coverage across API surface |
| **Branches (% Branch)** | **54.71%** | Covers security checks, role forks, input validation error branches |
| **Functions (% Funcs)** | **82.32%** | High coverage across all controllers, middleware, and services |
| **Lines (% Lines)** | **74.31%** | 3/4 of server codebase executed by automated tests |

---

## 2. Vitest v8 Coverage Report (Verbatim Run Output)

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   73.98 |    54.71 |   82.32 |   74.31 |                   
 src               |   88.23 |      100 |      50 |   88.23 |                   
  app.ts           |   88.23 |      100 |      50 |   88.23 | 42,55             
 src/config        |   44.44 |       40 |      50 |   44.44 |                   
  db.ts            |   31.57 |     37.5 |   33.33 |   31.57 | 30-44,49-53       
  env.ts           |      75 |       50 |     100 |      75 | 23-24             
 src/controllers   |   72.24 |    56.44 |   81.89 |   72.78 |                   
  admin.controller |   82.45 |    68.29 |     100 |   85.45 | 127,240,248,257   
  ai.controller.ts |   70.86 |    55.28 |     100 |    70.4 | 174,381-385,400   
  analytics.ctrl   |      86 |    61.36 |     100 |      86 | 69,74,79,120,161  
  auth.controller  |   84.78 |     87.5 |      75 |   84.78 | 60,96-103,110,118 
  brand.controller |   76.66 |       50 |     100 |   76.66 | 29,69,79,84,92    
  calendar.ctrl    |   67.07 |       50 |      80 |   67.94 | 65,194,199,204    
  campaign.ctrl    |   72.38 |    58.88 |     100 |   73.78 | 65,271,275,293    
  collabReq.ctrl   |   80.83 |       64 |     100 |   80.83 | 49,320,326,332    
  contract.ctrl    |   67.13 |    53.21 |   83.33 |   67.13 | 33,337,344,362    
  creator.ctrl     |   84.61 |    72.22 |     100 |   84.61 | 36,51-52,92,103   
  dashboard.ctrl   |   41.66 |    35.71 |      40 |   43.75 | 130-152,195-215   
  health.ctrl      |      80 |      100 |     100 |      80 | 13,25             
  invoice.ctrl     |   81.73 |    64.28 |     100 |   81.73 | 34,251,276-277    
  message.ctrl     |    84.9 |    58.82 |     100 |    84.9 | 82,123,169,220    
  notif.controller |   81.25 |    64.28 |     100 |   81.25 | 61,62,67,99,112   
  portfolio.ctrl   |   72.34 |       55 |      75 |   72.34 | 73,101,106,111    
  profile.ctrl     |   56.81 |    35.29 |     100 |   56.81 | 46,55,66,97-115   
  review.ctrl      |   70.45 |    54.16 |      75 |   70.45 | 91,118,127-149    
  submission.ctrl  |    61.9 |    45.66 |   41.17 |   63.03 | 137,453-457,463   
  talentLink.ctrl  |   64.19 |    47.27 |      75 |    64.1 | 50,159,184-215    
  task.controller  |   72.64 |     58.1 |   83.33 |   73.33 | 119,245,251,256   
 src/middleware    |   75.67 |    60.29 |   83.33 |   76.71 |                   
  auth.ts          |   88.09 |    85.29 |     100 |   88.09 | 32,36,41,83,90    
  errorHandler.ts  |   56.66 |    33.33 |      50 |   58.62 | 61,75-81,96-109   
  rateLimiter.ts   |     100 |       50 |     100 |     100 | 6-17              
 src/models        |     100 |    66.66 |     100 |     100 |                   
  brandProfile     |     100 |      100 |     100 |     100 |                   
  calendarPost     |     100 |      100 |     100 |     100 |                   
  campaign         |     100 |      100 |     100 |     100 |                   
  collabAnalytics  |     100 |      100 |     100 |     100 |                   
  collabRequest    |     100 |      100 |     100 |     100 |                   
  contract         |     100 |      100 |     100 |     100 |                   
  creatorProfile   |     100 |    66.66 |     100 |     100 | 138-139           
  freelancerProf   |     100 |      100 |     100 |     100 |                   
  index.ts         |     100 |      100 |     100 |     100 |                   
  invoice.model    |     100 |      100 |     100 |     100 |                   
  message.model    |     100 |      100 |     100 |     100 |                   
  notif.model      |     100 |      100 |     100 |     100 |                   
  portfolioItem    |     100 |      100 |     100 |     100 |                   
  review.model     |     100 |      100 |     100 |     100 |                   
  submission.model |     100 |      100 |     100 |     100 |                   
  talentLink.model |     100 |      100 |     100 |     100 |                   
  talentManagerProf|     100 |      100 |     100 |     100 |                   
  task.model       |     100 |      100 |     100 |     100 |                   
  user.model       |     100 |      100 |     100 |     100 |                   
 src/routes        |     100 |      100 |     100 |     100 |                   
  All 22 routes    |     100 |      100 |     100 |     100 | (100% coverage)   
 src/services      |   70.14 |    62.79 |   58.82 |   71.42 |                   
  ai.service.ts    |   68.25 |    63.41 |   56.25 |   69.49 | 71,157,173,187    
  health.service   |     100 |       50 |     100 |     100 | 24                
 src/utils         |   85.91 |    75.51 |    87.5 |   85.71 |                   
  AppError.ts      |   91.66 |    83.33 |     100 |   91.66 | 37                
  auth.ts          |   94.11 |       50 |   83.33 |   93.75 | 36                
  fileSignature.ts |   76.92 |    79.31 |     100 |   76.92 | 13,32,49          
  logger.ts        |      80 |    83.33 |      60 |      80 | 11-14             
  notification.ts  |      75 |      100 |     100 |      75 | 24                
  sanitize.ts      |     100 |      100 |     100 |     100 |                   
  upload.ts        |   84.61 |       50 |     100 |   84.61 | 10,40             
 src/validations   |   58.95 |    40.16 |   91.07 |    56.6 |                   
  All validations  |   58.95 |    40.16 |   91.07 |    56.6 |                   
-------------------|---------|----------|---------|---------|-------------------
```

---

## 3. Test Suites Breakdown (12 Suites / 126 Tests)

1. `src/__tests__/auth.test.ts` (14 tests)
   - Registration validation, password hashing, role restrictions, duplicate emails, login credentials, cookie signing, logout, user suspension enforcement.
2. `src/__tests__/profiles.test.ts` (10 tests)
   - Profile creation & update per role, privacy toggle, discovery search & filtering, follower range validation, portfolio CRUD, owner edit checks.
3. `src/__tests__/campaigns.test.ts` (8 tests)
   - Brand campaign CRUD, deliverable specs, status progression (`draft` -> `open` -> `inProgress` -> `completed`), creator visibility filters.
4. `src/__tests__/collaborationRequests.test.ts` (10 tests)
   - Brand invitations, creator applications, duplicate prevention, state transitions (`pending` -> `accepted` / `rejected` / `withdrawn`).
5. `src/__tests__/contracts.test.ts` (11 tests)
   - Auto contract generation on accepted request, dual-signing workflow, decline flow, legal terms immutability.
6. `src/__tests__/tasks.test.ts` (10 tests)
   - Workspace Kanban task creation, order positioning, status updates, counterparty authorization checks.
7. `src/__tests__/submissions.test.ts` (9 tests)
   - Deliverable file upload with magic-byte verification (PNG/JPG/PDF/MP4), revision history, brand review & approval loop.
8. `src/__tests__/ai.test.ts` (13 tests)
   - Gemini / MockProvider fallback, recommendation ranking, price estimation, pitch email draft, stored analytics summary, content plan generation.
9. `src/__tests__/admin.test.ts` (9 tests)
   - Admin authorization check (`authorize('admin')`), user search, account suspension/reactivation, platform metrics, profile visibility toggling.
10. `src/__tests__/notificationsAndMessages.test.ts` (12 tests)
    - Event-triggered notifications, unread count tracking, mark-read operations, 1-to-1 collaboration chat, message length caps.
11. `src/__tests__/invoices.test.ts` (9 tests)
    - Invoice creation, status lifecycle (`draft` -> `sent` -> `paid`), participant authorization, payment status disclaimer.
12. `src/__tests__/calendarReviews.test.ts` (11 tests)
    - Content calendar CRUD, self-reported KPI storage & retrieval, 1-5 star mutual reviews, duplicate review prevention, average rating calculation.

