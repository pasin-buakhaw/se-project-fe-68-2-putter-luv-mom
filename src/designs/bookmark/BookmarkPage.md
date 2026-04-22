# Bookmark Page Design

## BookmarkButton Component
- Toggle button with bookmark icon (lucide-react)
- Two states: saved (filled yellow bg) / unsaved (outline)
- Calls bookmarkService add/remove on click
- Reads initial state from localStorage on mount

## Saved Restaurants Page (/saved)
- Header: "Saved Restaurants"
- List of bookmarked restaurant cards
- Each card shows: restaurant name with link to detail page
- Remove (X) button per card
- Empty state message: "No saved restaurants yet."
