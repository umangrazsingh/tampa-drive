# Tampa Drive – Frontend (client)

React frontend for Tampa Drive, a private ride board for our friend group,
styled with hand-made pixel-art CSS (no UI library).

## Run it

```bash
cd client
npm install
npm start          # opens http://localhost:3000
```

It talks to the Express server on port 8000, so start the server too
(from the project root: `npm run watch` starts both).

## Demo mode vs real backend

In `src/settings.js`:

```js
const USE_MOCK_API = false;  // real Express server (default)
const USE_MOCK_API = true;   // fake data from src/hooks/mockApi.js, no server needed
```

Demo mode invite code: **BULLS**

## Folder structure

```
client/
├── public/index.html            fonts are loaded here (Google Fonts)
└── src/
    ├── index.js                 entry point, imports the CSS
    ├── App.js                   Router + AppLayout
    ├── settings.js              demo mode switch, API_URL, road + car settings
    ├── styles/tampa-drive.css   all pixel styles (see DESIGN.md)
    ├── pages/
    │   ├── AppLayout.js         loads data with hooks, picks the page
    │   ├── Welcome.js           invite code + pick your name
    │   ├── Upcoming.js          road scene, ride details, departure cards
    │   ├── PostRide.js          post a ride form
    │   └── History.js           completed + cancelled rides
    ├── components/              Header, Footer, Centered, Road, PixelCar, SunsetSky,
    │                            RideCard, RideDetails, SeatIcons, StatusBadge, Message
    └── hooks/
        ├── requests.js          every HTTP call
        ├── mockApi.js           fake backend for demo mode (no server needed)
        ├── useMember.js         invite code + name, saved in localStorage
        ├── useDestinations.js   loads destinations
        ├── useRides.js          loads rides + join/leave/cancel/post
        └── format.js            date/time/status display helpers
```

## API contract (what the backend must do)

Every request except `POST /session` sends the header `x-invite-code: <code>`.
Missing or wrong code -> `401 { error }`.
Errors always come back as `{ "error": "message" }`.

| Method | Route | Body | Success |
|---|---|---|---|
| POST | `/session` | `{ inviteCode }` | `200 { members: ["Aarav", ...] }` / `401` |
| GET | `/destinations` | | `200 [{ name, driveMinutes }]` |
| GET | `/rides?view=upcoming` | | `200 [ride]` upcoming + full, soonest first |
| GET | `/rides?view=history` | | `200 [ride]` completed + cancelled, newest first |
| POST | `/rides` | `{ destination, departure, seats, driver, note }` | `201 ride` / `400` |
| POST | `/rides/:rideNumber/join` | `{ name }` | `200 ride` / `400` / `404` |
| POST | `/rides/:rideNumber/leave` | `{ name }` | `200 ride` / `400` / `404` |
| DELETE | `/rides/:rideNumber` | `{ name }` | `200 ride` / `403` not the driver / `404` |

### Ride object returned by the API

```json
{
  "rideNumber": 101,
  "destination": "TPA Airport",
  "driveMinutes": 25,
  "departure": "2026-11-14T10:30:00.000Z",
  "arrival": "2026-11-14T10:55:00.000Z",
  "seats": 3,
  "seatsLeft": 2,
  "driver": "Aarav",
  "riders": ["Sita"],
  "note": "Room for 2 big suitcases.",
  "status": "upcoming",
  "cancelledAt": null
}
```

- The database only stores `status: "upcoming"` or `"cancelled"`.
- The server **calculates** `"full"` (no seats left), `"completed"` (departure has passed),
  `arrival` (departure + driveMinutes) and `seatsLeft` every time it sends a ride.
- "LEAVING SOON" is display-only, worked out in the browser (`hooks/format.js`).

### Rules (mockApi.js already follows them)

- Post: all fields required, destination must exist, seats 1–6, departure in the future.
- Join: ride must be upcoming (not full/cancelled/completed), you can't be the driver, can't join twice.
- Leave: you must be on the ride.
- Cancel: only the driver; it sets `status: "cancelled"` and `cancelledAt`, never deletes.

## Build into the server

```bash
npm run build      # outputs to ../server/public
```

All names and places in demo data are made up.
