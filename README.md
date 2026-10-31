# Placement Copilot

> **Your AI-Powered Placement Command Center**  
> Built with the official [NitroStack MCP Framework](https://nitrostack.ai) for campus placements and internship recruitment.

Placement Copilot transforms scattered placement information—eligibility criteria, job applications, looming deadlines, syllabus requirements, and weak preparation areas—into actionable, intelligent decisions through MCP Tools, Resources, Prompts, and Interactive Widgets.

---

## 🌟 Key Highlights

- **Intelligent Recruitment Decisioning**: Unlike passive spreadsheet trackers, Placement Copilot understands the student's academic profile, current recruitment stage, deadlines, and weak areas to prescribe personalized roadmaps.
- **Explainable Topic Prioritization**: Uses the transparent heuristic:
  $$\text{Priority} = \text{Topic Importance (1--5)} \times (6 - \text{Confidence (1--5)})$$
- **Deep Eligibility Engine**: Multi-tier evaluation against hard criteria (CGPA, backlogs, branch, graduation year) and technical skill gaps.
- **Interactive SaaS UI Widgets**: Four custom Next.js widgets designed with a warm, minimalist SaaS aesthetic (warm linen `#F4F1E9`, paper `#FAF9F5`, charcoal `#252522`, and sage `#68705A`).
- **Production-Ready MCP Architecture**: Built on `@nitrostack/core` (v1.1.2) with strict TypeScript types, Zod schemas, dual transport (STDIO + HTTP SSE), and reactive in-memory state.

---

## 🏗️ Architecture Overview

```
src/
├── index.ts                     # Server entry point (McpApplicationFactory bootstrap)
├── app.module.ts                # Root application module (@McpApp)
├── health/
│   └── system.health.ts         # System memory, uptime & resource monitor
├── data/
│   ├── types.ts                 # Type definitions (Profile, Application, Deadline, Plan, Metrics)
│   ├── mockData.ts              # Initial sample data (Profile, 5 sample companies, applications, topics)
│   └── store.ts                 # Reactive store with CRUD operations and dynamic metric derivation
├── utils/
│   ├── validation.ts            # Strict state machine stage transitions
│   ├── dateUtils.ts             # Chronological urgency classification (<24h, <3d, <7d, overdue)
│   └── priorityUtils.ts         # Explainable topic prioritization heuristic
├── modules/
│   └── placement/
│       ├── placement.module.ts  # Feature module aggregating controllers
│       ├── tools/
│       │   ├── profile.tools.ts     # get_student_profile, update_student_profile
│       │   ├── application.tools.ts # add_application, list_applications, update_application_status, delete_application
│       │   ├── deadline.tools.ts    # add_deadline, list_upcoming_deadlines, get_urgent_applications
│       │   ├── eligibility.tools.ts # check_eligibility
│       │   ├── preparation.tools.ts # generate_prep_plan, log_practice, get_prep_progress
│       │   └── analytics.tools.ts   # get_placement_dashboard
│       ├── placement.resources.ts   # 5 MCP resources (profile, companies, dsa, core-cs, progress)
│       └── placement.prompts.ts     # 3 reusable MCP prompts (company-prep, mock-interview, resume-review)
└── widgets/                         # Next.js 14 interactive UI widgets (@nitrostack/widgets)
    ├── widget-manifest.json
    └── app/
        ├── kanban-board/page.tsx          # Widget 1: Application Kanban Board
        ├── deadline-timeline/page.tsx     # Widget 2: Deadline Timeline
        ├── preparation-dashboard/page.tsx # Widget 3: Preparation Dashboard
        └── weekly-planner/page.tsx        # Widget 4: Weekly Preparation Planner
```

---

## 🛠️ MCP Tools (14 Tools)

| Module | Tool Name | Description | Connected Widget |
|---|---|---|---|
| **Student Profile** | `get_student_profile` | Retrieves student's academic credentials, skills, and identified weak/strong topics | — |
| | `update_student_profile` | Updates CGPA, daily study hours, target roles, or skill sets | — |
| **Application Tracker** | `add_application` | Adds a recruitment application and auto-tracks deadlines | — |
| | `list_applications` | Lists applications by stage with search and filtering | `kanban-board` |
| | `update_application_status` | Advances recruitment stage with transition validation | — |
| | `delete_application` | Safely removes an application by ID | — |
| **Deadline Management** | `add_deadline` | Registers recruitment deadlines with urgency tiering | — |
| | `list_upcoming_deadlines` | Sorts deadlines chronologically with `<24h` / `<3d` alerts | `deadline-timeline` |
| | `get_urgent_applications` | Aggregates critical applications requiring immediate action | — |
| **Eligibility Checker** | `check_eligibility` | Evaluates CGPA, backlogs, branch, graduation year & skills | — |
| **Preparation Planner** | `generate_prep_plan` | Generates 4-phase adaptive day-by-day study roadmap | `weekly-planner` |
| | `log_practice` | Logs solved problems, study hours, and updates topic confidence | — |
| | `get_prep_progress` | Detailed breakdown of solved problems vs target per topic | — |
| **Command Center** | `get_placement_dashboard` | Comprehensive analytics: readiness index, category bars, funnel | `preparation-dashboard` |

---

## 📚 MCP Resources (5 Resources)

1. **`placement://student/profile`**: Candidate academic profile, CGPA, target roles, technical skills.
2. **`placement://companies`**: Catalog of company requirements and selection rounds (Infosys, Google, Amazon, Microsoft, TCS).
3. **`placement://topics/dsa`**: Topic-by-topic problem count targets, solved problems, and mastery ratings for Data Structures and Algorithms.
4. **`placement://topics/core-cs`**: Mastery tracking across DBMS, OS, Networks, OOP, and SQL.
5. **`placement://preparation/progress`**: Real-time composite readiness index, total study hours logged, and recent study logs.

---

## 💬 MCP Reusable Prompts (3 Prompts)

1. **`company-preparation`**: Synthesizes the student's profile, identified weak topics, and target company round blueprint to formulate a focused preparation strategy.
2. **`mock-interview`**: Launches an interactive technical coding or behavioral interview session, dynamically initializing problem scenarios based on candidate's preferred role and difficulty level.
3. **`resume-review`**: Evaluates technical bullet points using Google's XYZ formula (*"Accomplished [X] as measured by [Y], by doing [Z]"*) and performs ATS keyword alignment for target tech roles.

---

## 🖥️ Interactive Widgets

1. **Application Kanban Board (`/kanban-board`)**: Visual 6-stage recruitment board (`Interested` &rarr; `Applied` &rarr; `OA` &rarr; `Interview` &rarr; `Offer` &rarr; `Rejected`) with one-click stage progression.
2. **Deadline Timeline (`/deadline-timeline`)**: Chronological event stream with urgency badges (`Critical • < 24h`, `High Priority • < 3d`, `Next 7 Days`).
3. **Preparation Dashboard (`/preparation-dashboard`)**: Readiness index gauge, progress bars for DSA / Core CS / SQL / Aptitude, and diagnostic tiles for weak areas.
4. **Weekly Preparation Planner (`/weekly-planner`)**: Notion-style day-by-day checklist with interactive task completion that logs practice directly to the backend.

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- Node.js >= 18
- NitroStack CLI (`npm install -g @nitrostack/cli`)
- NitroStack Studio ([Download](https://nitrostack.ai/studio))

### 2. Build and Run Local Server
```bash
# Install dependencies
npm install

# Build widgets and TypeScript server
npm run build

# Start the MCP server (STDIO mode)
npm start
```

### 3. Run Automated End-to-End Demo Smoke Test
To verify the entire 3-part hackathon demo scenario in headless mode:
```bash
npm run test:demo
```

---

## 🧪 Testing in NitroStack Studio

1. Open **NitroStack Studio**.
2. Connect to the local project using **STDIO transport**.
3. **Canvas View**: Inspect all 22 items (14 tools, 5 resources, 3 prompts, 4 widgets).
4. **Test Key Tools**:
   - `get_student_profile` &rarr; View student's credentials.
   - `check_eligibility` (`companyName: "Infosys"`) &rarr; Check eligibility criteria breakdown.
   - `generate_prep_plan` (`targetCompany: "Infosys"`, `totalDays: 21`) &rarr; Renders the **Weekly Planner** widget.
   - `list_applications` &rarr; Renders the **Application Kanban Board** widget.
   - `list_upcoming_deadlines` &rarr; Renders the **Deadline Timeline** widget.
   - `get_placement_dashboard` &rarr; Renders the **Preparation Dashboard** widget.
   - `log_practice` (`topic: "Graph Algorithms"`, `category: "DSA"`, `problemsSolved: 5`, `studyHours: 2`) &rarr; Re-run dashboard to observe real-time metrics increase.

---

## ☁️ Deployment to NitroCloud

This project is fully structured for NitroCloud deployment:

1. **Dual Transport Support**: Automatically runs in STDIO mode during local development (`NODE_ENV=development`) and Dual Transport (STDIO + HTTP SSE) in production (`NODE_ENV=production`).
2. **Static Widget Export**: Next.js widgets are statically exported to `src/widgets/out/` during `nitrostack-cli build`.
3. **Deploy via CLI**:
   ```bash
   nitrostack-cli deploy
   ```
   Or connect your GitHub repository directly to your [NitroCloud Dashboard](https://nitrostack.ai).

---

## 📄 License

Apache-2.0
