# Side-by-Side Comparison for Agent Collection

Implement a comparison mode in the agent's collection tab to allow users to compare two components (justifications, metrics, fit scores, and metadata) side-by-side.

## User Experience
- The user can enter "Comparison Mode" from the Collection tab.
- They select two components from the proposed collection or alternatives.
- A split view shows technical badges, fit scores, and justifications for both.
- This helps decide which component better suits the project's strategic goals.

## Technical Details
- **State Management**: Add `comparisonIds` state to `CollectionView` in `ReportPanel.tsx`.
- **UI Components**:
  - Add a "Compare" button to `CollectionCard`.
  - Implement a `ComparisonOverlay` or `ComparisonPanel` that renders when two items are selected.
  - Display metrics (experts scores), justifications, and technical vectors side-by-side.
- **Expert Panel Logic**: Use the existing `ExpertScore` type and `vectorForComponent` metadata to show detailed differences.
