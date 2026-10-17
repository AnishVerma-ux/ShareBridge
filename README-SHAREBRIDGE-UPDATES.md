# ShareBridge multi-category update

## What changed
- The homepage now presents ShareBridge as a community donation platform rather than a food-only service.
- Donors can list Food, Clothing & Shoes, Books & Education, Household Items, Electronics, Toys & Games, Medical Supplies, or Other Useful Items.
- Donation listings support a title, category, quantity, condition, description, pickup address, optional image, and optional expiry date. Food donations require an expiry date in the frontend.
- NGO, volunteer, and admin screens now show generic donation titles and categories.
- Updated responsive navigation, mobile menu, visual styles, cards, and landing-page layout.
- Existing backend class and `foodName` database/API property are retained for compatibility with existing data and older clients. New titles are stored in `foodName`; category, description, and itemCondition are new columns.

## Run the project
1. Start MySQL and keep your existing database settings in `foodbridge-backend/src/main/resources/application.properties`.
2. Start the Spring Boot backend from IntelliJ. With `spring.jpa.hibernate.ddl-auto=update`, Hibernate should add the new columns on startup; back up your database first.
3. From `foodbridge-frontend`, run `npm install` and then `npm run dev`.
4. Log in with a DONOR account, open the donor dashboard, choose a category, and publish a donation.

## API compatibility
`POST /donations` still accepts the legacy `foodName` multipart field, and now also accepts `title`, `category`, `description`, and `itemCondition`. `expiryTime` and `image` are optional for non-food donations. The response still exposes `foodName` because that is the existing entity/database field.

## Notes
- Existing food donations whose `category` is null are displayed as Food by the frontend.
- Donation categories are currently stored as strings, so adding a category does not require changing a Java enum. Keep category values consistent with the frontend options.
- Food safety, prohibited-item screening, image moderation, and server-side expiry validation should be added before using this as a real public donation service.
