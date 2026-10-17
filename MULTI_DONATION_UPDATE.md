# ShareBridge — multi-category donation update

This version updates the existing ShareBridge / FoodBridge project to support a broad range of **physical item donations**, rather than food alone, and refreshes the donor, NGO, volunteer, and landing-page experience.

## Categories included

- Food & groceries
- Clothing & footwear
- Books & education
- Household essentials
- Furniture
- Electronics
- Home appliances
- Toys & games
- Medical supplies
- Hygiene & personal care
- Baby supplies
- School supplies
- Mobility & accessibility items
- Pet supplies
- Other useful items

The `OTHER` category lets donors list appropriate reusable items that do not fit a predefined category. Financial donations are not included because they require a separate payment and accounting workflow; this project update does not collect money.

## Frontend changes

- Shared category configuration at `foodbridge-frontend/src/data/donationCategories.js`.
- Landing page displays the full category collection.
- Donation form uses generic item title, category, quantity, condition, description, pickup address and optional photo.
- Expiry date is required by the form for food and optional for non-food items.
- NGO dashboard includes search and category filtering and a clearer responsive layout.
- Volunteer dashboard uses generic donation labels and updated styling.
- Existing `foodName` API/database field is retained for compatibility with older clients; it now stores the donation's generic title.

## Run locally

### Backend

1. Open `foodbridge-backend` in IntelliJ IDEA.
2. Check `src/main/resources/application.properties` and configure your own MySQL URL, username and password. Do not use credentials from another machine.
3. Start MySQL and create the configured database if it does not exist.
4. Run `FoodbridgeApplication`.

### Frontend

1. Open `foodbridge-frontend` in VS Code.
2. Install dependencies with `npm install`.
3. Start with `npm run dev`.
4. Open the local Vite URL shown in the terminal.

## Important compatibility note

The backend stores categories as strings and accepts the category field from the multipart donation request. Existing tables are expected to be updated by the project's Hibernate `ddl-auto=update` setting. Back up your database before running a changed backend. Verify donor creation, NGO acceptance, volunteer pickup and delivery in Postman or the browser before deploying.

## Verification status

The archive structure and source edits were checked. A production frontend build could not be completed in this environment because dependency installation did not finish, so run `npm install` and `npm run build` locally to verify against your environment.
