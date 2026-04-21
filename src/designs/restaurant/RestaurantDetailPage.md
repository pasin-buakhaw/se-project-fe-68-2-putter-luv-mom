# Design Spec — RestaurantDetailPage
**Author:** Verawood | **Date:** 2026-04-21
**User Story:** US3-5 — As a user I want to view the detail of a restaurant
**Estimated Hours:** 4h

## Overview
Restaurant Detail page displays full information about a selected restaurant including name, image gallery, description, rating, and a preview of the menu.

## Layout
- Hero: Full-width cover image with restaurant name overlaid
- Info section: name, category, rating stars, address, opening hours
- Description: short paragraph about the restaurant
- Menu Preview: horizontal scroll of top menu items (max 6)
- Reviews: average rating + recent review list

## States
- Loading: skeleton placeholders for image and info
- Loaded: full content rendered
- Invalid ID: "Restaurant not found" with back button
- Empty menu: "No menu items available yet"

## Interactions
- Back button → navigate to search/list page
- Click menu item → scroll to menu section or navigate to order page
- Click review → expand full review text

## Acceptance Criteria
- Page loads restaurant data by ID from API
- Image gallery shows at least one image or fallback placeholder
- Rating displayed as stars (0–5)
- Empty and error states handled gracefully
