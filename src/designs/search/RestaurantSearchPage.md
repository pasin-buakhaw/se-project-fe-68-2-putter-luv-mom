# Design Spec — RestaurantSearchPage
**Author:** Verawood | **Date:** 2026-04-21
**User Story:** US3-1 — As a user I want to search for restaurants by name or keyword
**Estimated Hours:** 4h

## Overview
Restaurant Search page allows users to search for restaurants by name or keyword.
The page displays a search input at the top and renders matching restaurant results below.

## Layout
- Header: Search bar with input field and search button centered at top
- Body: Grid of restaurant cards (2 columns mobile, 3 columns desktop)
- Each card shows: restaurant name, image, category badge

## States
- Default: empty search — show placeholder text "Search for restaurants..."
- Loading: skeleton cards while fetching results
- Results found: grid of restaurant cards
- Empty results: message "No restaurants found for '<keyword>'"
- Error: message "Something went wrong. Please try again."

## Interactions
- User types keyword → debounce 300ms before triggering search
- Click card → navigate to restaurant detail page
- Clear button (×) → reset search input and results

## Acceptance Criteria
- Search input accepts any keyword string
- Results update to show only matching restaurants
- Empty state shown when no results match
- Invalid or special characters handled gracefully
