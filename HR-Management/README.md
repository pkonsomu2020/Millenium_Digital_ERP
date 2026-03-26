# Millenium HR Management System

This submodule acts as the standalone HR-facing instance of the Millenium Digital Admin System. 

While it communicates with the exact same Supabase database backend as the main User Dashboard, this interface imposes strict **Read-Only** restrictions across general modules (like preventing HR reps from adding Stock Items or scheduling all-hands meetings) but enables powerful **Write** approvals across HR-specific functions (like approving or rejecting employee Leave Requests).

## Core Responsibilities (HR Perspective)
- **Leave Operations**: Full approve/reject lifecycle over all incoming employee leave requests.
- **Stock Oversight**: Read-only oversight of current office inventory depletion.
- **Documentation Access**: Read-only retrieval access to company policies stored in the Document Vault.
- **Schedule Viewer**: View global internal meeting schedules via the Calendar View.

## Running the Dashboard locally
```bash
# Install dependencies
npm i

# Start the frontend development server
npm run dev
```