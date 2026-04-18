# SYSTEM ROLE
Act as a Principal UI/UX Architect and Lead Full-Stack Engineer. Your objective is to architect and generate the frontend code for "GigATax," a desktop-first web application designed as "TurboTax for the Gig Economy."

# PROJECT OVERVIEW
GigATax targets content creators, editors, and freelancers who do not receive W-2s. It automates tax tracking across bank accounts, emails, and paper receipts, categorizes expenses via AI, and dynamically finds tax deductions specific to their gig.

# TECHNICAL STACK
* **Frontend:** React, TypeScript, Tailwind CSS (for styling), Lucide React (for iconography).
* **Backend/Database Context:** Python (FastAPI) and Supabase. (Note: Generate the frontend UI components and mock the data states that would interface with these backend services).
* **Architecture:** Highly modular, functional components utilizing standard React hooks (`useState`, `useEffect`).

# DESIGN SYSTEM & UI GUIDELINES
* **Aesthetic:** "Sleek Creator Tool." Dark mode by default. High-contrast, polished, and modern.
* **Layout Style:** Strict "Bento-Box" modularity. Use clearly defined, softly rounded cards with subtle borders or glow effects against a dark background to separate information.
* **Typography:** Clean, sans-serif, highly readable. Emphasize data points (numbers, savings) with larger, bolder weights.
* **State Management:** Always include empty states, loading states (e.g., "AI is analyzing your transactions..."), and success states.

# CORE SCREEN INVENTORY & REQUIRED FUNCTIONALITY

## 1. The Onboarding Flow (The Connection Hub)
* **UI:** A sleek, step-by-step modal or full-screen flow.
* **Steps:**
    1.  **Job Selection:** Multi-select or search for gig types (e.g., Content Creator, Video Editor, OnlyFans).
    2.  **Integrations:** Connect Bank/Plaid, Email (for digital receipts), and accounting tools. Show satisfying toggle/connection UI states.

## 2. The Bento Dashboard (Main Workspace)
* **UI:** A desktop-optimized bento-grid layout.
* **Components Needed:**
    * **High-Level Metrics:** Total Income, Estimated Tax Liability, Total Deductions Found.
    * **Categorization Feed:** A read-only feed of recently auto-categorized transactions.
    * **Action Required Alert:** A highly visible module nudging them to complete their "Optimization Checklist."

## 3. Smart Receipt Capture Module
* **UI:** A dedicated card or modal for manual receipt entry.
* **Functionality:** * An upload zone for receipt images.
    * A mocked "OCR Scanning" loading state.
    * **Crucial Input:** Once scanned, provide a text input/dropdown where the user instructs the system: "Put this in [Category]" or "Apply this specific expense to [Custom Rule]."

## 4. The "Tax Savings" Optimization Nudge (The Core Value Prop)
* **UI:** A dynamic, interactive checklist interface.
* **Functionality:** The system dynamically surfaces potential deductions based on their job and scanned transactions.
    * **Example Scenario to Code:** The "Vehicle Mileage" deduction. Show a module that says "We see you spent $X on gas. That equates to roughly Y miles." Provide a slider or input field for the user to declare: "How many of these miles were for business?"
    * **Real-time Math:** As the user adjusts the business mileage, dynamically update a green "Tax Savings Claimed: $Z" metric using a mocked tax formula.

## 5. Final Review & Filing
* **UI:** A clean, high-trust summary screen.
* **Functionality:** A breakdown of all income, categorized expenses, and final tax numbers. A prominent, high-contrast "File Taxes" call-to-action with a confirmation state.

## 6. Prepare numbers for auto filing of taxes
* **UI:** A simple, field page where a user will need to input information necessary for filing taxes that we already do not have. (SSN, dependents, etc)
* **Functionality:** When a user is ready to pay their taxes through us, we will leverage the deductions we have found for them in the filing of their taxes. Using a playwright session or something adjacent, file the taxes through turbotax or freetaxUSA through an API or playwright session. Can show the user the data being inputted into the fields and wait for the user to click "accept" or "next" or whatever button to progress in the process. 

# EXECUTION DIRECTIVE
Generate the complete, production-ready React component code for these screens. Start with the `Dashboard` integrating the `Optimization Nudge` bento box, as that is the core of the user experience. Ensure all TypeScript interfaces for the mocked data (Transactions, Deductions, User Profile) are clearly defined at the top of your response.