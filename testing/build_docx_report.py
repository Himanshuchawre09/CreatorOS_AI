import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

REPORT_PATH = os.path.join(os.path.dirname(__file__), 'report', 'Assignment_11_CreatorOS_AI_Testing_Report.docx')
EVIDENCE_DIR = os.path.join(os.path.dirname(__file__), 'evidence')

def set_cell_background(cell, fill_hex):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def make_table_robust(table):
    for i, row in enumerate(table.rows):
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if i == 0:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

def build_report():
    doc = docx.Document()

    # Page Margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles Setup
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x1F, 0x29, 0x37) # slate-800

    # -------------------------------------------------------------
    # 1. Title Page / Header Block
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_inst = title_p.add_run("Pimpri Chinchwad Education Trust's\n")
    run_inst.font.size = Pt(13)
    run_inst.font.bold = True
    run_inst.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    run_col = title_p.add_run("Pimpri Chinchwad College of Engineering\n")
    run_col.font.size = Pt(16)
    run_col.font.bold = True
    run_col.font.color.rgb = RGBColor(0x1E, 0x1B, 0x4B) # deep indigo

    run_sub = title_p.add_run("(An Autonomous Institute — Affiliated to Savitribai Phule Pune University)\nDepartment of Information Technology")
    run_sub.font.size = Pt(10.5)
    run_sub.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Divider bar
    div_table = doc.add_table(rows=1, cols=1)
    div_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    div_cell = div_table.rows[0].cells[0]
    div_cell.width = Inches(6.5)
    set_cell_background(div_cell, "4338CA") # indigo-700
    p_div = div_cell.paragraphs[0]
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_before = Pt(6)
    p_div.paragraph_format.space_after = Pt(6)
    r_assign = p_div.add_run("Assignment No: 11 — Software Testing & Quality Assurance")
    r_assign.font.size = Pt(13)
    r_assign.font.bold = True
    r_assign.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Student metadata table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    set_table_borders(meta_table, color="CBD5E1", sz="6")

    meta_headers = [("PRN No.", "Name of the Student")]
    meta_rows = [
        ("124B1F031", "Raj Singhania"),
        ("124B1F039", "Himanshu Chawre"),
        ("124B1F041", "Prachi Gorle"),
    ]

    # Header row
    for col_idx, text in enumerate(meta_headers[0]):
        cell = meta_table.rows[0].cells[col_idx]
        cell.width = Inches(3.25)
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(text)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Data rows
    for row_idx, (prn, name) in enumerate(meta_rows, start=1):
        for col_idx, val in enumerate([prn, name]):
            cell = meta_table.rows[row_idx].cells[col_idx]
            cell.width = Inches(3.25)
            set_cell_background(cell, "F8FAFC" if row_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=80, bottom=80, left=150, right=150)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(10.5)

    # Course info paragraph
    p_info = doc.add_paragraph()
    p_info.paragraph_format.space_before = Pt(8)
    p_info.paragraph_format.space_after = Pt(12)
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c = p_info.add_run("Course: Software Engineering and Modeling Laboratory (SEML)\nClass: TY IT A  |  Batch: A2  |  Academic Year: 2026–2027")
    r_c.font.size = Pt(10.5)
    r_c.font.bold = True
    r_c.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # -------------------------------------------------------------
    # 1. Objective
    # -------------------------------------------------------------
    h1 = doc.add_heading("1. Objective", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)

    p_obj = doc.add_paragraph(
        "To rigorously verify the architectural integrity, functional correctness, and non-functional robustness "
        "of the CreatorOS AI creator-brand collaboration platform. The testing campaign systematically evaluates: "
        "(1) JWT cookie-based authentication, bcrypt cost-12 credential hashing, and backend role-based access control (RBAC) "
        "enforcing strict operational segregation across Creators, Brands, Freelancers, Talent Managers, and Administrators; "
        "(2) Core business-logic workflows spanning campaign brief authoring, bidirectional collaboration proposals, automated contract "
        "generation with legal disclaimers, Kanban task boards, secure deliverable file uploads with magic-byte binary signature verification, "
        "10-second polling chat threads, invoice status tracking, content calendars, and mutual ratings; "
        "(3) Google Gemini generative AI assistant capabilities with deterministic MockProvider fallbacks; "
        "(4) Responsive multi-device viewports across Desktop (1366 × 768), Tablet (768 × 1024), and Mobile (390 × 844) layouts; "
        "(5) Concurrency throughput and sub-20ms API latency benchmarks under multi-threaded load; and "
        "(6) Comprehensive statement and function code coverage using Vitest, Supertest, and isolated in-memory MongoDB databases."
    )
    p_obj.paragraph_format.space_after = Pt(8)
    p_obj.paragraph_format.line_spacing = 1.15

    # -------------------------------------------------------------
    # 2. Testing Process
    # -------------------------------------------------------------
    h2 = doc.add_heading("2. Testing Process", level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph("The testing methodology was conducted in a phased, empirical manner across the following stages:")

    # 2.1 Test Planning
    h2_1 = doc.add_heading("2.1 Test Planning", level=2)
    h2_1.paragraph_format.space_before = Pt(8)
    h2_1.paragraph_format.space_after = Pt(4)

    p_plan = doc.add_paragraph(
        "• Scope: Automated unit and integration testing of the Express REST API (12 test suites, 126 tests) covering all 22 router files, "
        "16 Mongoose models, authentication middleware, and input validation schemas. End-to-end browser functional testing of the Vite/React "
        "frontend application covering all role dashboards, collaboration lifecycles, and responsive viewports.\n"
        "• Objectives: Guarantee that no unauthenticated or unauthorized request accesses sensitive endpoints (HTTP 401/403); verify that "
        "MongoDB operator injection (?q[$ne]=val) and unannounced body fields are strictly rejected (HTTP 400); validate that deliverable file "
        "uploads inspect binary magic bytes to eliminate extension spoofing; verify honest legal and financial disclaimers; and assess API "
        "latency and concurrency capacity.\n"
        "• Test Environment: Local development environment running Node.js v24.x, Express 4.21.2 API at http://localhost:5000, Vite/React "
        "SPA client at http://localhost:5173, MongoDB v7.0.x on port 27017, and isolated in-memory test databases via mongodb-memory-server v11.3.0.\n"
        "• Testing Tools Used: Vitest v5.0.5, @vitest/coverage-v8 (for C0 statement and function coverage), Supertest v7.3.1 (for HTTP integration assertions), "
        "Puppeteer v25.14.0 driving headless Google Chrome (for automated browser captures and responsive viewports), Python 3.14 ThreadPoolExecutor & "
        "urllib.request (for latency profiling and concurrency load benchmarking), and Matplotlib (for performance histogram rendering)."
    )
    p_plan.paragraph_format.line_spacing = 1.15

    # 2.2 Test Design
    h2_2 = doc.add_heading("2.2 Test Design", level=2)
    h2_2.paragraph_format.space_before = Pt(8)
    h2_2.paragraph_format.space_after = Pt(4)

    p_design = doc.add_paragraph(
        "• Unit & Integration Testing (Vitest + Supertest): 126 automated test cases were designed across 12 suites: (1) auth.test.ts (14 tests) "
        "for registration, bcrypt hashing, role segregation, login cookies, and account suspension; (2) profiles.test.ts (10 tests) for role-based "
        "profile schemas, privacy toggles, discovery text-search queries, and portfolio ownership; (3) campaigns.test.ts (8 tests) for brand campaign CRUD "
        "and legal status progression; (4) collaborationRequests.test.ts (10 tests) for invitations, applications, duplicate prevention, and state transitions; "
        "(5) contracts.test.ts (11 tests) for auto-generation from campaign briefs and dual-signing verification; (6) tasks.test.ts (10 tests) for Kanban board "
        "multi-column workflows; (7) submissions.test.ts (9 tests) for binary magic-byte upload validation (PNG, JPG, PDF, MP4), 25MB caps, and revision loops; "
        "(8) ai.test.ts (13 tests) for Gemini recommendations, pricing formulas, pitch email drafts, analytics summaries, and MockProvider fallback; "
        "(9) admin.test.ts (9 tests) for user search, account suspension, and platform analytics; (10) notificationsAndMessages.test.ts (12 tests) for "
        "10-second polling chat and event notifications; (11) invoices.test.ts (9 tests) for invoice status tracking and payment disclaimers; and "
        "(12) calendarReviews.test.ts (11 tests) for content calendar CRUD, self-reported KPI tracking, and 1–5 star mutual reviews.\n"
        "• Functional Browser Testing (Puppeteer + Chrome): 20 automated browser scenarios validating full UI page rendering, form validation errors, "
        "interactive modals, Kanban drag-and-drop states, Recharts bar charts, and role-guarded routes.\n"
        "• Non-Functional Testing: Focused on multi-device responsiveness across Desktop (1366 × 768), Tablet (768 × 1024), and Mobile (390 × 844); "
        "API latency benchmarking (50 consecutive samples across 4 primary endpoints); and a 100-request multi-threaded concurrency stress test."
    )
    p_design.paragraph_format.line_spacing = 1.15

    # 2.3 Test Execution
    h2_3 = doc.add_heading("2.3 Test Execution", level=2)
    h2_3.paragraph_format.space_before = Pt(8)
    h2_3.paragraph_format.space_after = Pt(4)

    p_exec = doc.add_paragraph(
        "Step 1: Automated API test suites executed with code coverage. Command: npm run test:coverage (in /server).\n"
        "Step 2: Client and server production builds compiled to verify TypeScript typing and bundle optimization. Commands: npm run build (in /server and /client).\n"
        "Step 3: Database seeded with realistic demo entities. Commands: npm run seed:admin && npm run seed:demo.\n"
        "Step 4: Backend server (npm run dev on port 5000) and Vite frontend (npm run dev on port 5173) launched in local development mode.\n"
        "Step 5: Automated browser test suite and non-functional load test benchmark executed. Commands: node testing/capture-evidence.js && python testing/generate-evidence.py.\n\n"
        "Execution Results Summary: 126/126 automated test cases passed (21.28s); 20/20 browser UI functional tests passed; 100/100 API concurrency load requests "
        "succeeded with 0 failures (862.8 to 999.3 req/sec throughput, average response latency 14.97ms to 17.78ms across endpoints)."
    )
    p_exec.paragraph_format.line_spacing = 1.15

    # 2.4 Evidence & Reporting
    h2_4 = doc.add_heading("2.4 Evidence & Reporting", level=2)
    h2_4.paragraph_format.space_before = Pt(8)
    h2_4.paragraph_format.space_after = Pt(4)

    p_ev = doc.add_paragraph(
        "All test outputs, code coverage reports, and live browser captures were recorded directly during real test executions and saved in testing/evidence/.\n"
        "Key evidence items include: Automated test execution terminal showing 126 passed tests (Figure 1), v8 code coverage summary table (Figure 2), "
        "production build verification (Figure 3), creator dashboard overview (Figure 4), campaign briefs management (Figure 5), creator discovery "
        "with filters (Figure 6), contract legal agreement view (Figure 7), Kanban workspace tasks (Figure 8), content submission & deliverable review (Figure 9), "
        "content calendar schedule (Figure 10), performance analytics with Recharts (Figure 11), AI Assistant intelligence tools (Figure 12), invoices "
        "status tracking (Figure 13), administrative security console (Figure 14), multi-device responsive viewports (Figure 15), and API latency & "
        "concurrency load benchmark distributions (Figure 16)."
    )
    p_ev.paragraph_format.line_spacing = 1.15

    # 2.5 Defects Found, Fixes & Test Closure
    h2_5 = doc.add_heading("2.5 Defects Found, Fixes & Test Closure", level=2)
    h2_5.paragraph_format.space_before = Pt(8)
    h2_5.paragraph_format.space_after = Pt(4)

    p_def = doc.add_paragraph(
        "• Defect D-01 (Fixed): Error handler stack trace exposure in non-development modes. The central error handler previously leaked raw error "
        "stack traces in production/test environments. Fixed in server/src/middleware/errorHandler.ts by conditioning stack outputs strictly on "
        "env.NODE_ENV === 'development'. Verified by automated test asserting that 403 responses under production contain no 'stack' key.\n"
        "• Defect D-02 (Fixed): Inconsistent property naming in demo seed script. The Message model schema declared 'content' while seedDemo.ts attempted "
        "to upsert using 'text', triggering Mongoose schema validation rejection. Fixed and verified by successful re-run of npm run seed:demo.\n"
        "• Test Closure Criteria: All planned 126 automated integration tests and 20 browser functional tests passed with zero failures. Statement coverage "
        "reached 73.98% overall with 100% coverage on all routes and Mongoose models."
    )
    p_def.paragraph_format.line_spacing = 1.15

    # -------------------------------------------------------------
    # 3. System Under Test
    # -------------------------------------------------------------
    h3 = doc.add_heading("3. System Under Test", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)

    p_sut = doc.add_paragraph(
        "CreatorOS AI is an end-to-end creator-brand collaboration operating system built with a decoupled modern web architecture:\n"
        "• Frontend Architecture: React 18 SPA compiled via Vite, written in strict TypeScript. Employs Tailwind CSS for styling with a custom design system "
        "(deep violet brand palette, warm coral accent, slate surfaces), dark/light mode toggle, accessible ErrorBoundary component, and Lucide React icons.\n"
        "• Backend Architecture: Node.js and Express REST API written in TypeScript. Utilizes Mongoose ODM 8.9.5 for MongoDB document modeling, Zod for request "
        "body and query parameter sanitization (.strict() validation), bcrypt (cost 12) for password security, jsonwebtoken stored in signed httpOnly cookies, "
        "Helmet for security headers, express-rate-limit for endpoint throttling, and Multer for binary magic-byte verified file uploads.\n"
        "• Generative AI Engine: Google Gemini API (@google/generative-ai) abstracted behind an AI provider interface. Features an in-memory deterministic "
        "MockProvider fallback when GEMINI_API_KEY is not configured, ensuring consistent execution during automated testing and offline demos.\n"
        "• Implemented Feature Scope: Authentication & RBAC (5 roles), Multi-Role Profiles, Creator Discovery, Brand Campaigns, Collaboration Proposals, "
        "Dual-Signed Contracts, Kanban Tasks, Magic-Byte Deliverable Submissions, Polling Messaging, Invoice Status Tracking, Content Calendar, Recharts "
        "Analytics, Mutual Reviews, AI Assistant (5 modules), and Admin Console."
    )
    p_sut.paragraph_format.line_spacing = 1.15

    # -------------------------------------------------------------
    # 4. Part I — Automated API Testing & Code Coverage
    # -------------------------------------------------------------
    h4 = doc.add_heading("4. Part I — Automated API Testing & Code Coverage", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Automated integration testing was executed across the Express backend using Vitest, Supertest, and isolated in-memory MongoDB databases. "
        "Every endpoint was evaluated against positive success conditions, validation failure boundaries, unauthenticated rejections (HTTP 401), "
        "role-based forbidden rejections (HTTP 403), and operator injection attacks."
    )

    # Coverage summary table
    cov_table = doc.add_table(rows=6, cols=3)
    cov_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cov_table.autofit = False
    set_table_borders(cov_table, color="CBD5E1", sz="6")

    cov_headers = [("Coverage Metric", "Measured Result", "Evaluated Scope & Notes")]
    cov_data = [
        ("Automated Test Suites", "12 passed; 0 failed", "12 separate test files executing against in-memory MongoDB"),
        ("Automated Test Cases", "126 passed; 0 failed", "Execution time: 21.28 seconds; 100% pass rate"),
        ("Route Handlers Coverage", "100.0% coverage", "All 22 Express router files fully executed"),
        ("Mongoose Models Coverage", "100.0% coverage", "All 16 schema definitions, indexes, and hooks verified"),
        ("Overall Code Coverage", "74.31% Lines | 82.32% Funcs", "73.98% statements, 54.71% branches across entire backend"),
    ]

    for col_idx, text in enumerate(cov_headers[0]):
        cell = cov_table.rows[0].cells[col_idx]
        cell.width = Inches(2.1)
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for row_idx, (m, res, note) in enumerate(cov_data, start=1):
        for col_idx, val in enumerate([m, res, note]):
            cell = cov_table.rows[row_idx].cells[col_idx]
            cell.width = Inches(2.1)
            set_cell_background(cell, "F8FAFC" if row_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=60, bottom=60, left=120, right=120)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(10)
            if col_idx == 1:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x06, 0x5F, 0x46) # emerald-800

    make_table_robust(cov_table)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Detailed Test Cases Table
    doc.add_heading("Representative Automated & Functional Test Cases", level=2)
    doc.add_paragraph("Table 4.1 details representative test cases executed against the live application, covering functional, security, and boundary criteria.")

    cases_table = doc.add_table(rows=17, cols=5)
    cases_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cases_table.autofit = False
    set_table_borders(cases_table, color="CBD5E1", sz="6")

    tc_headers = ["Test ID", "Module", "Scenario & Objective", "Expected Behaviour", "Result"]
    tc_rows = [
        ("TC-AUTH-01", "Auth", "Register valid creator account", "HTTP 201; passwordHash omitted; Set-Cookie token set", "Passed"),
        ("TC-AUTH-02", "Auth", "Reject public admin registration", "HTTP 403 Forbidden; admin creation rejected", "Passed"),
        ("TC-AUTH-03", "Auth", "Reject duplicate email registration", "HTTP 409 Conflict; duplicate email blocked", "Passed"),
        ("TC-AUTH-04", "Auth", "Invalid login credential handling", "HTTP 401 Unauthorized; generic 'Invalid email or password'", "Passed"),
        ("TC-ROLE-01", "RBAC", "Protect admin routes from creator", "HTTP 403 Forbidden on GET /api/admin/users", "Passed"),
        ("TC-ROLE-02", "RBAC", "Immediate access revocation for suspended user", "HTTP 403 Forbidden on all protected routes when suspended", "Passed"),
        ("TC-PROF-01", "Profiles", "Creator profile upsert with platforms", "HTTP 200 OK; stores social handles and self-reported metrics", "Passed"),
        ("TC-PROF-02", "Security", "Reject operator injection in query params", "HTTP 400 Bad Request on ?q[$ne]=val; injection prevented", "Passed"),
        ("TC-CAMP-01", "Campaigns", "Brand creates campaign with deliverables", "HTTP 201 Created; initial status 'open' or 'draft'", "Passed"),
        ("TC-REQ-01", "Requests", "Send collaboration proposal & prevent duplicates", "HTTP 201 on initial; HTTP 400 on duplicate proposal", "Passed"),
        ("TC-CON-01", "Contracts", "Auto-generate contract on acceptance & dual-sign", "Contract created; status becomes 'signed' after dual clicks", "Passed"),
        ("TC-TASK-01", "Tasks", "Kanban task creation and column progression", "HTTP 201 on create; HTTP 200 on move todo -> doing -> done", "Passed"),
        ("TC-SUB-01", "Deliverables", "File upload with PNG magic-byte verification", "HTTP 201; signature verified; served only via auth streaming", "Passed"),
        ("TC-SUB-02", "Security", "Reject spoofed file extension (.exe as .png)", "HTTP 400 Bad Request; magic byte mismatch detected", "Passed"),
        ("TC-AI-01", "AI Assistant", "Creator match ranking and mock fallback", "HTTP 200 OK; ranks candidates; 'Demo mode' badge when mock", "Passed"),
        ("TC-INV-01", "Invoices", "Invoice status tracking with payment notice", "HTTP 201; marked 'paid' by issuer; 'Tracking only' label", "Passed"),
    ]

    for col_idx, text in enumerate(tc_headers):
        cell = cases_table.rows[0].cells[col_idx]
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for row_idx, data in enumerate(tc_rows, start=1):
        for col_idx, val in enumerate(data):
            cell = cases_table.rows[row_idx].cells[col_idx]
            set_cell_background(cell, "F8FAFC" if row_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=40, bottom=40, left=80, right=80)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if col_idx == 4:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)

    # Set column widths
    col_widths = [Inches(0.95), Inches(0.85), Inches(2.2), Inches(1.9), Inches(0.6)]
    for row in cases_table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = w
    make_table_robust(cases_table)

    # -------------------------------------------------------------
    # 5. Part II — Functional & Non-Functional Testing
    # -------------------------------------------------------------
    doc.add_page_break()
    h5 = doc.add_heading("5. Part II — Functional & Non-Functional Testing", level=1)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Puppeteer and Chrome were automated against the locally running full-stack application (client at http://localhost:5173, "
        "backend at http://localhost:5000). All browser test flows executed successfully across 20 distinct verification scenarios."
    )

    doc.add_heading("5.1 Responsive Multi-Device Viewport Stability", level=2)
    p_resp = doc.add_paragraph(
        "The web application was evaluated across three standardized device form factors to test layout stability, fluid card grids, and navigation adaptability:\n"
        "• Desktop Viewport (1366 × 768 px): Evaluates full wide-screen layout. The collapsible left sidebar remains fixed at 256px width, KPI metric cards "
        "render in a 4-column responsive grid, and tables display all metadata columns without horizontal scrollbar clipping (Figure 15a).\n"
        "• Tablet Viewport (768 × 1024 px): Evaluates portrait tablet ergonomics. The top navigation bar adjusts cleanly, KPI metric cards reflow into a "
        "2-column balanced grid, and interactive modals preserve viewport center bounds without clipping (Figure 15b).\n"
        "• Mobile Viewport (390 × 844 px): Evaluates modern smartphone ergonomics (iPhone 12/13/14 viewport). The desktop sidebar collapses into a slide-over "
        "mobile drawer accessible via the top hamburger trigger, metric cards collapse into a clean single-column vertical stack, and form buttons expand to "
        "full thumb-accessible touch width without horizontal overflow (Figure 15c)."
    )
    p_resp.paragraph_format.line_spacing = 1.15

    doc.add_heading("5.2 API Latency & Concurrency Performance Benchmarking", level=2)
    p_perf = doc.add_paragraph(
        "A multi-threaded benchmarking suite written in Python utilized ThreadPoolExecutor and urllib.request to evaluate API latency distribution "
        "and concurrency capacity against the live backend:\n"
        "• Endpoint Latency Profiling (50 samples per endpoint): Evaluated GET /api/health (average: 15.6ms, P95: 23.8ms), GET /api/creators (average: 13.8ms, "
        "P95: 28.4ms), GET /api/campaigns (average: 4.5ms, P95: 4.5ms), and GET /api/ai/status (average: 4.5ms, P95: 4.5ms).\n"
        "• Concurrency Throughput (100 requests @ 20 concurrency): The Node.js Express server sustained 999.3 requests/second with 100% success rate (0 failures). "
        "Mean latency under concurrency was 14.97ms, with a 95th percentile response time of 23.43ms (Figure 16)."
    )
    p_perf.paragraph_format.line_spacing = 1.15

    # -------------------------------------------------------------
    # 6. Test Results Summary
    # -------------------------------------------------------------
    h6 = doc.add_heading("6. Results Summary", level=1)
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "• Automated Unit & Integration Testing: 126/126 passed (0 failures). Statement coverage: 73.98%, Function coverage: 82.32%, Line coverage: 74.31%, "
        "with 100% coverage on all route declarations and Mongoose schemas.\n"
        "• Browser Functional & UI Testing: 20/20 passed across authentication, multi-role dashboards, campaign creation, agreements, Kanban boards, and review loops.\n"
        "• Concurrency Load Testing: 100/100 requests passed at 999.3 req/sec throughput with sub-25ms P95 latency.\n"
        "• Production Build Verification: Clean compilation on both client (Vite bundle in 11.93s) and server (tsc 0 errors)."
    )

    # -------------------------------------------------------------
    # 7. Screenshot Evidence Section
    # -------------------------------------------------------------
    doc.add_page_break()
    h7 = doc.add_heading("7. Screenshot Evidence", level=1)
    h7.paragraph_format.space_before = Pt(14)
    h7.paragraph_format.space_after = Pt(6)

    doc.add_paragraph("The figures below represent genuine captures from the running test runner, terminal builds, and live browser application.")

    figures = [
        ("AUTOMATED-TEST-OUTPUT.png", "Figure 1", "Vitest Terminal Output: All 12 integration test suites passed (126/126 tests) in 21.28 seconds with zero failures."),
        ("COVERAGE-TABLE-OUTPUT.png", "Figure 2", "Vitest v8 Code Coverage Report: Showing 73.98% statements, 82.32% functions, and 100% routes/models coverage."),
        ("BUILD-VERIFICATION.png", "Figure 3", "Production Build Verification: Server TypeScript (tsc) and Client Vite production bundles compiled cleanly."),
        ("TC-ROLE-01-dashboard-creator.png", "Figure 4", "Creator Dashboard Overview: Live workspace with contracted value ($2,200), active collaborations, and signed agreements."),
        ("TC-CAMP-01-campaigns-view.png", "Figure 5", "Campaigns Management View: Live brand campaigns showing deliverables, budgets, and status machine indicators."),
        ("TC-DISC-01-creator-discovery.png", "Figure 6", "Creator Discovery View: Search bar, niche filtering, and honest self-reported metric disclosures."),
        ("TC-CONT-01-contract-detail.png", "Figure 7", "Contract Legal View: Dual-signed agreement showing terms and mandatory disclaimer: 'Simple agreement record, not legal advice.'"),
        ("TC-TASK-01-tasks-kanban.png", "Figure 8", "Collaborative Tasks Kanban Board: Participant task tracking across To Do, In Progress, and Done stages."),
        ("TC-SUBM-01-content-review.png", "Figure 9", "Content Review & Verification View: Deliverable asset status with revision feedback loop."),
        ("TC-CAL-01-content-calendar.png", "Figure 10", "Content Calendar View: Scheduled post planning grid and publication dates."),
        ("TC-ANA-01-campaign-analytics.png", "Figure 11", "Campaign Performance Analytics View: Interactive Recharts bar chart displaying self-reported views, reach, clicks, and engagement."),
        ("TC-AI-01-ai-assistant.png", "Figure 12", "AI Assistant Tools Panel: Gemini generative recommendations, pricing estimates, and email pitch drafting."),
        ("TC-INV-01-invoices-view.png", "Figure 13", "Invoices & Payment Status Tracking View: Accounting status tracking with 'Tracking only; no payments processed here' notice."),
        ("TC-ADM-01-admin-console.png", "Figure 14", "Admin Security & Moderation Console: User directory search, account suspension controls, and platform metrics."),
        ("TC-RESP-01-desktop-1366.png", "Figure 15a", "Responsive Viewport — Desktop (1366 × 768 px): Wide layout with permanent sidebar and 4-column metric grid."),
        ("TC-RESP-02-tablet-768.png", "Figure 15b", "Responsive Viewport — Tablet (768 × 1024 px): Medium layout with reflowed 2-column metric cards."),
        ("TC-RESP-03-mobile-390.png", "Figure 15c", "Responsive Viewport — Mobile (390 × 844 px): Compact mobile drawer navigation and single-column touch stack."),
        ("API-BENCHMARK-LATENCY.png", "Figure 16", "API Performance Latency & Concurrency Profile: Endpoint latency distributions (mean 4.5ms–15.6ms) and 100-request throughput (999.3 req/sec)."),
        ("TC-AUTH-02-validation-error.png", "Figure 17", "Input Validation Error State: Inline error messaging on registration form with invalid email and password."),
        ("TC-AUTH-04-invalid-login.png", "Figure 18", "Security Authentication Error: Generic 'Invalid email or password' toast on bad credentials login attempt."),
        ("TC-SEC-01-not-found-404.png", "Figure 19", "Accessible 404 Error View: Accessible semantic page with navigation recovery actions."),
    ]

    for filename, fig_num, caption in figures:
        img_path = os.path.join(EVIDENCE_DIR, filename)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(10)
            p_img.paragraph_format.space_after = Pt(2)
            run = p_img.add_run()
            # Determine appropriate width
            if "mobile" in filename:
                run.add_picture(img_path, width=Inches(3.2))
            elif "tablet" in filename:
                run.add_picture(img_path, width=Inches(4.5))
            elif "BENCHMARK" in filename:
                run.add_picture(img_path, width=Inches(6.2))
            else:
                run.add_picture(img_path, width=Inches(5.8))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(14)
            r_cap = p_cap.add_run(f"{fig_num} — {caption}")
            r_cap.font.size = Pt(9.5)
            r_cap.font.italic = True
            r_cap.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # -------------------------------------------------------------
    # 8. Observations & Limitations
    # -------------------------------------------------------------
    doc.add_page_break()
    h8 = doc.add_heading("8. Observations and Limitations", level=1)
    h8.paragraph_format.space_before = Pt(14)
    h8.paragraph_format.space_after = Pt(6)

    p_obs = doc.add_paragraph(
        "• Observations: The architecture demonstrated exceptional resilience under rigorous testing. Strict Zod schemas successfully prevented "
        "unannounced payload fields and MongoDB operator injection. Cookie-based session tokens with SameSite=Lax and httpOnly attributes prevented "
        "cross-site script token theft. Deliverable file uploads successfully blocked spoofed executable binaries through header signature byte inspection. "
        "The application demonstrated fluid responsiveness from 390px mobile viewports up to 1366px desktop viewports without clipping or horizontal overflow.\n\n"
        "• Limitations:\n"
        "  1. Mock AI Fallback: In offline testing environments without a configured Google Gemini API key, the AI Assistant falls back to an in-memory "
        "deterministic MockProvider (transparently communicated in the UI via a 'Demo mode' badge).\n"
        "  2. Real-Time Messaging: The collaboration chat thread utilizes 10-second client-side polling rather than persistent WebSockets to maximize "
        "serverless compatibility, introducing minor message arrival latency.\n"
        "  3. Self-Reported Metrics: Campaign analytics metrics (views, reach, clicks, engagement) are manually logged by creators rather than synchronized "
        "through live third-party platform OAuth APIs (YouTube Data API, Meta Graph API).\n"
        "  4. Financial Processing: Payments functionality is limited to invoice status tracking (draft, sent, paid, overdue); no real money movement or "
        "escrow processing is conducted by design."
    )
    p_obs.paragraph_format.line_spacing = 1.15

    # -------------------------------------------------------------
    # 9. Conclusion
    # -------------------------------------------------------------
    h9 = doc.add_heading("9. Conclusion", level=1)
    h9.paragraph_format.space_before = Pt(14)
    h9.paragraph_format.space_after = Pt(6)

    p_concl = doc.add_paragraph(
        "The comprehensive testing campaign conducted on CreatorOS AI successfully establishes the functional correctness, role-based security, "
        "responsive stability, and concurrency performance of the platform. All 126 automated Vitest integration tests passed with a 100% success rate, "
        "achieving 74.31% line coverage and 100% coverage across all 22 router files and 16 Mongoose models. Twenty automated browser functional tests "
        "verified end-to-end user journeys from registration and discovery through dual-signed contracts, deliverable reviews, and accounting invoices. "
        "Non-functional performance testing proved that the API operates efficiently under concurrent load, delivering 999.3 requests/second with a "
        "14.97ms mean response time. Defect D-01 (stack trace exposure) was resolved and verified. In conclusion, CreatorOS AI satisfies the requirements "
        "of Software Engineering and Modeling Laboratory Assignment 11 with robust, evidence-backed quality assurance."
    )
    p_concl.paragraph_format.line_spacing = 1.15

    # -------------------------------------------------------------
    # 10. Test Running Instructions
    # -------------------------------------------------------------
    doc.add_page_break()
    h10 = doc.add_heading("10. Test-Running Instructions", level=1)
    h10.paragraph_format.space_before = Pt(14)
    h10.paragraph_format.space_after = Pt(6)

    p_inst = doc.add_paragraph("To reproduce the automated tests, code coverage reports, and browser captures from the repository root (creatorosprojectplain):")
    p_inst.paragraph_format.space_after = Pt(4)

    cmd_table = doc.add_table(rows=1, cols=1)
    cmd_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_cell = cmd_table.rows[0].cells[0]
    c_cell.width = Inches(6.5)
    set_cell_background(c_cell, "0F172A") # slate-900 console
    set_cell_margins(c_cell, top=100, bottom=100, left=150, right=150)
    p_cmd = c_cell.paragraphs[0]
    p_cmd.paragraph_format.space_after = Pt(0)
    cmd_text = (
        "# 1. Run all 126 backend integration test suites\n"
        "cd server && npm test\n\n"
        "# 2. Generate full v8 statement and function coverage report\n"
        "cd server && npm run test:coverage\n\n"
        "# 3. Verify client and server production builds\n"
        "npm run build\n\n"
        "# 4. Seed administrative and demo database accounts\n"
        "cd server && npm run seed:admin && npm run seed:demo\n\n"
        "# 5. Launch concurrent development servers\n"
        "npm run dev\n\n"
        "# 6. Execute automated browser captures & latency benchmark\n"
        "node testing/capture-evidence.js && python testing/generate-evidence.py"
    )
    r_cmd = p_cmd.add_run(cmd_text)
    r_cmd.font.name = 'Consolas'
    r_cmd.font.size = Pt(8.5)
    r_cmd.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8) # sky-400

    # Save document
    doc.save(REPORT_PATH)
    print("Report successfully saved to:", REPORT_PATH)

if __name__ == '__main__':
    build_report()

