# ShareBridge workflow fixes and verification plan

This update adds donation ownership, status tracking, expiry checks, volunteer assignment, browser location assistance, and NGO donation requests.

## Important verification note

The source changes were statically checked: all React/JS files parsed successfully and all relative frontend imports resolve. A full Maven build and Vite production build could not be completed in this environment because dependency downloads timed out. Do not treat this ZIP as a certified bug-free release until you run the builds and Postman workflow below on your machine.

## Features and workflow

### Donation lifecycle

1. Donor creates a donation: `AVAILABLE`.
2. An NGO accepts it: `ACCEPTED`.
3. One volunteer claims the assignment: `ASSIGNED`.
4. Only that volunteer can confirm pickup: `PICKED_UP`.
5. Only that volunteer can confirm delivery: `DELIVERED`.

Every new transition is saved to `donation_status_history` with status, note, actor, and timestamp. Donors, the accepting NGO, and the assigned volunteer can view the timeline. Existing donations with no old history get one honest snapshot noting that earlier events were not recorded; the app does not invent past timestamps.

### Expiry protection

- Food donations require an expiry date in the future.
- Expired food is excluded from NGO available listings.
- Backend rejects acceptance, assignment, pickup, and delivery if food is expired at that time.
- Frontend date validation is only a convenience; backend checks are authoritative.

### Volunteer assignment

- Volunteers see accepted donations that have not been assigned.
- `Take assignment` assigns the donation to the current volunteer.
- The backend uses a database row lock while transitioning a donation so two volunteers cannot claim the same donation at once.
- Assigned/picked-up/delivered donations appear only in that volunteer's queue; other volunteers cannot pick up or deliver them.

### NGO requests

- NGO can publish a request with title, category, quantity, and details.
- Donors see open requests and can select `Donate for this request`; the form is prefilled and scrolls into view.
- The donation is linked to the request. Only the NGO that created that request can accept the linked donation.
- Request status moves `OPEN` -> `IN_PROGRESS` when the linked donation is accepted and `FULFILLED` when delivery is confirmed.

### Current location

The location button requests browser permission, uses OpenStreetMap Nominatim to reverse-geocode the coordinates, and fills the address. If reverse-geocoding fails, it fills the coordinates instead. Users must verify the address before saving. Browser location works on `localhost` or HTTPS and requires permission.

### Security and configuration

- Public registration rejects the `ADMIN` role.
- Passwords are write-only in JSON responses: accepted from registration but never serialized back.
- JWT signing key is configurable with `JWT_SECRET`; default is for local development only. Set a unique secret before deployment.
- Database config can be overridden with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
- Image uploads are limited to JPEG, PNG, WEBP, and GIF and 5 MB.
- Hibernate uses `ddl-auto=update` to add the new history/request tables and donation-request foreign key. Back up the database before starting the updated app.

## Start locally

### Backend

Use Java 25 or a compatible supported JDK. From `foodbridge-backend`:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

The wrapper may need internet access to download Maven and dependencies. Confirm MySQL is running and the `foodbridge` database exists. Adjust environment variables or `application.properties` if your local database credentials differ.

### Frontend

From `foodbridge-frontend`:

```powershell
npm ci
npm run build
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Postman end-to-end test

Use separate accounts and copy each JWT from login. Registration body example:

```json
{
  "fullName": "Test Donor",
  "email": "donor@example.com",
  "password": "testpassword123",
  "phoneNumber": "9999999999",
  "address": "Test address",
  "role": "DONOR"
}
```

Register another user with role `NGO` and another with role `VOLUNTEER`. Registration with role `ADMIN` must return `400`.

1. `POST /users/login` with email/password; copy the returned token.
2. As NGO, `POST /donation-requests` with JSON:

```json
{
  "title": "Packaged groceries",
  "category": "FOOD",
  "quantity": 5,
  "description": "Sealed, in-date food packs needed"
}
```

Expected: `201 Created`.

3. As donor, `GET /donation-requests/open`. Expected: `200 OK`.
4. As donor, `POST /donations` as multipart form data with `title`, `category=FOOD`, `quantity=5`, `pickupAddress`, `expiryTime=YYYY-MM-DD 23:59:59`, and `requestId` copied from the request. Use a future date. Expected: `201 Created` and status `AVAILABLE`.
5. As donor, `GET /donations/my-donations`. Expected: the new donation appears.
6. As the requesting NGO, `GET /donations/available`; then `PUT /donations/{id}/accept`. Expected: `200 OK`, status `ACCEPTED`; `GET /donations/my-donations` should now include it.
7. As volunteer, `GET /donations/accepted`; `PUT /donations/{id}/assign`; `PUT /donations/{id}/pickup`; `PUT /donations/{id}/deliver`. Expected statuses in sequence: `ASSIGNED`, `PICKED_UP`, `DELIVERED`.
8. As donor, NGO, and assigned volunteer, `GET /donations/{id}/history`. Expected: ordered status events with timestamps and notes. A different volunteer should get `403` for the history and cannot pickup/deliver this donation.
9. Try to create a food donation without `expiryTime`, or with a past expiry date. Expected: `400 Bad Request`. Try accepting or picking up a donation whose expiry has passed. Expected: request rejected.
10. In donor registration/profile and donor donation form, click the location button and grant permission. Verify a street address or coordinates fill the address field. Repeat in NGO registration/profile.

## API summary

- `POST /donations` (DONOR, multipart)
- `GET /donations/my-donations` (DONOR sees own donations; NGO sees donations accepted by that NGO; VOLUNTEER sees assignments; ADMIN sees all)
- `GET /donations/available` and `PUT /donations/{id}/accept` (NGO)
- `GET /donations/accepted`, `PUT /donations/{id}/assign`, `PUT /donations/{id}/pickup`, `PUT /donations/{id}/deliver` (VOLUNTEER)
- `GET /donations/{id}/history` (donor, accepting NGO, assigned volunteer, or ADMIN)
- `GET /donation-requests/open` (DONOR)
- `POST /donation-requests`, `GET /donation-requests/mine` (NGO)
