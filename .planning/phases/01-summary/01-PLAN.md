---
phase: 01-summary
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: [SUM-01, SUM-03]

must_haves:
  truths:
    - "User can view /summary page from dashboard"
    - "Group predictions are displayed in summary view"
    - "Predicted group winners are clearly visible"
    - "User can navigate back to edit predictions"
    - "Empty state shown when no predictions made"
  artifacts:
    - path: "world-cup-predictor/src/app/api/predictions/route.ts"
      provides: "POST endpoint to save predictions"
      contains: "POST method"
    - path: "world-cup-predictor/src/app/summary/page.tsx"
      provides: "Summary page displaying all predictions"
      exports: "SummaryPage component"
  key_links:
    - from: "src/app/groups/page.tsx"
      to: "/api/predictions"
      via: "POST request"
      pattern: "fetch.*method.*POST"
    - from: "src/app/summary/page.tsx"
      to: "/api/predictions"
      via: "GET request"
      pattern: "fetch.*predictions"
---

<objective>
Create the Summary page that displays all user predictions in one consolidated view. This requires adding a POST endpoint to save predictions (currently only GET exists) and building the summary UI.

Purpose: Users can review their predictions after making them on the groups page
Output: /summary page showing group predictions with edit capability
</objective>

<execution_context>
@C:/Users/lenovo/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/lenovo/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@world-cup-predictor/src/app/groups/page.tsx
@world-cup-predictor/src/app/dashboard/page.tsx
@world-cup-predictor/src/app/api/predictions/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add POST endpoint for predictions</name>
  <files>world-cup-predictor/src/app/api/predictions/route.ts</files>
  <action>
Add POST method to the predictions API route. The POST should:
- Accept { predictions: [{ type, groupName, knockoutRound, teamOrder }] }
- Validate the user is authenticated via session
- Delete existing predictions of same type for user (upsert behavior)
- Create new predictions in the database
- Return success/error response

Reference existing GET handler for auth pattern: `getServerSession(authOptions)`
Use Prisma create/update patterns from existing API routes (e.g., rooms/route.ts)
  </action>
  <verify>Test POST /api/predictions with curl or Postman:
1. Authenticate user
2. Send POST with { predictions: [{ type: "GROUP", groupName: "A", teamOrder: ["mex", "rsa", "kor", "eur-d"] }] }
3. Verify 200 response and prediction saved to database
4. Run: npx prisma studio to verify data</verify>
  <done>POST endpoint accepts predictions array, saves to database, returns 200 on success</done>
</task>

<task type="auto">
  <name>Task 2: Create Summary page</name>
  <files>world-cup-predictor/src/app/summary/page.tsx</files>
  <action>
Create the /summary page component:
- Fetch user's predictions via GET /api/predictions on mount
- Display group predictions in a grid layout (similar to groups page style)
- Show predicted winner for each group prominently (first position in teamOrder)
- Include "Edit Predictions" button linking to /groups
- Handle empty state: show prompt to make predictions with link to /groups
- For knockout predictions (SUM-02, SUM-04): show message that knockout predictions will be available in Phase 2
- Follow existing UI patterns from dashboard/page.tsx (colors, typography, components)

Layout:
- Header with back to dashboard link
- Two sections: Group Predictions (complete) and Knockout Predictions (coming soon)
- Group section: 12 group cards showing team rankings
- Each group card: group letter, winner highlighted, full ranking list
  </action>
  <verify>1. Navigate to /summary after making group predictions
2. Verify group predictions display correctly
3. Verify winner is highlighted for each group
4. Click "Edit Predictions" - should navigate to /groups
5. Check empty state by clearing predictions from DB</verify>
  <done>Summary page displays all group predictions, shows winners, allows navigation to edit, handles empty state gracefully</done>
</task>

</tasks>

<verification>
- POST /api/predictions saves predictions successfully
- GET /api/predictions returns saved predictions
- /summary page renders with group predictions
- Group winners are visually distinct
- Edit button navigates to /groups
- Empty state displays when no predictions exist
</verification>

<success_criteria>
1. User can access /summary page from dashboard
2. Group predictions shown with team rankings (SUM-01)
3. Predicted group winners clearly visible (SUM-03)
4. "Edit Predictions" button navigates to /groups
5. Empty state shows prompt to make predictions
6. Knockout section shows "coming in Phase 2" message (graceful degradation for SUM-02, SUM-04)
</success_criteria>

<output>
After completion, create `.planning/phases/01-summary/01-SUMMARY.md`
</output>
