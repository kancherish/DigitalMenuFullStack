# Project Context — DigitalMenuFullStack

> **Purpose:** this is the living context file for the project. Read it at the start of a
> session and append every change (date, files, what/why) to the [Change Log](#change-log).
> It must always describe the **current code**, not an older plan.
>
> **Quick facts:** monorepo at `/home/cherry/DigitalMenuFullStack`; branch `main`; remote
> `origin`; last commit at time of writing `22ac0cc5 more customzation in header`.
>
> **Do not put secret values in this file.** Environment variable names are listed below;
> actual values stay in `.env` files.

---

## 1. What this project is

A multi-tenant digital restaurant menu platform.

- A restaurant admin logs in, manages categories/items, edits branding and layout, and gets
  a public menu.
- Every restaurant has a UUID `publicId`. The public menu is served at `/:RestaurantId` by
  the customer frontend, and can also be reached through a `domain` value stored on the
  restaurant.
- Customers see a header, optional announcement board, search, category navigation
  (tabs/dropdown/continuous), item cards, and optional QR/PDF actions.
- A separate super-admin panel creates/deletes restaurant admins and edits basic restaurant
  settings. It is protected by a shared secret header, not a user account.

---

## 2. Repository layout

```
DigitalMenuFullStack/
├── CONTEXT.md                      # this file
├── README.md                       # only "# DigitalMenuFullStack"
├── nginx.config                    # sample nginx for uploads + reverse proxy
├── .gitignore
├── DigitalMenuBackend/             # Express 5 + Prisma 7 + PostgreSQL API
│   ├── .env                        # ignored; real backend config
│   ├── .prettierrc / .prettierignore
│   ├── package.json / package-lock.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # app.listen(PORT) + connectdb()
│       ├── app.ts                  # CORS, helmet, rate limit, routers, fallback
│       ├── env.ts                  # dotenv + named env exports
│       ├── prisma.config.ts        # Prisma 7 config
│       ├── db/db.ts                # connectdb / disconnect
│       ├── lib/prisma.ts           # PrismaClient + PrismaPg adapter
│       ├── controllers/            # auth, restaurant, category, items, health
│       ├── routes/                 # one router per controller
│       ├── middleware/             # auth/ownership, error, multer upload
│       ├── utils/                  # ApiResponse, ErrorResponse, jwt, asyncHandler,
│       │                           # CornerLock, sharp upload, storage adapters
│       ├── types/express.d.ts
│       ├── generated/prisma/       # generated Prisma client (ignored, do not edit)
│       ├── DIGITAL_MENU(cv2).postman_collection.json  # STALE, old routes
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── DigitalMenuFrontend/            # customer menu + restaurant admin
│   ├── .env                        # ignored; Vite vars
│   ├── vercel.json                 # SPA rewrite all paths to index.html
│   ├── vite.config.ts              # port 3000, host 0.0.0.0
│   ├── package.json
│   ├── eslint.config.js
│   ├── tsconfig*.json
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── index.css
│       ├── Home.tsx                # placeholder: renders "Home"
│       ├── DigitalMenu.tsx         # public menu page
│       ├── env.ts                  # exports VITE_SERVER_ADDRESS
│       ├── db/db.tsx               # public API helpers
│       ├── types/index.ts          # public types
│       ├── component/
│       │   ├── Header.tsx
│       │   ├── Item.tsx
│       │   ├── CatgoriesNavs.tsx   # CategoryTabs + CategoryDropdown
│       │   ├── Footer.tsx
│       │   └── Loader.tsx
│       ├── util/
│       │   ├── util.ts             # icons/theme vars/diff/badges
│       │   ├── menuPdf.ts          # jsPDF export
│       │   └── assets.ts           # assetUrl helper (currently unused)
│       └── admin/
│           ├── api/                # apiFetch, authService, tokenstore
│           ├── auth/               # AuthContext, AuthProvider, ProtectedRoute
│           ├── components/         # BadgeSelector, IconPicker, emptyItemForm
│           ├── pages/              # Login, AdminLayout, Settings, Categories,
│           │                       # ItemPage, ItemForm
│           ├── services/           # categoryService, itemService, restaurantService
│           └── types/index.ts
└── super-admin-panel/              # separate Vite React app
    ├── .env                        # ignored; VITE_SERVER_ADDRESS
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx / App.tsx      # single-page lock screen + admin management
        ├── api.ts                  # fetch wrapper + x-tempdata secret
        ├── RegistrationFormComponent.tsx  # unused duplicate form
        └── index.css
```

---

## 3. Tech stack and commands

| Area | Stack |
|---|---|
| Backend | Node ESM, Express 5, TypeScript, Prisma 7 (`prisma-client` generator), PostgreSQL via `@prisma/adapter-pg`, JWT (`jsonwebtoken`), bcryptjs, helmet, express-rate-limit, multer + sharp, AWS S3 SDK optional, uuid |
| Customer/admin frontend | React 19, TypeScript, Vite (`rolldown-vite` override), Tailwind CSS v4, react-router-dom 7, lucide-react, jsPDF |
| Super admin | React 19, TypeScript, Vite, Tailwind v4, axios listed but **fetch is used**; react-router-dom listed but **not used** |
| Images | Local disk (`UPLOAD_ROOT`, public base `UPLOAD_PUBLIC_BASE`) or S3 (`STORAGE_TYPE=s3`) |

### Commands

Backend (`DigitalMenuBackend/package.json`):
- `npm run dev` → `concurrently "npx prettier --watch --ignore-unknown ." "tsx watch src/index.ts"`
- `npm run build` → `tsc`
- `npm run start` → `node dist/index.js`

Frontend (`DigitalMenuFrontend/package.json`):
- `npm run dev` → Vite on port **3000**, host `0.0.0.0`
- `npm run build` → `tsc -b && vite build`
- `npm run lint` → `eslint .`
- `npm run preview`

Super admin (`super-admin-panel/package.json`):
- default Vite port (`5173`), `npm run dev`, `npm run build`, `npm run lint`

### Important run-directory notes

- **Prisma must be run from `DigitalMenuBackend/src`**, not `DigitalMenuBackend`.
  `prisma.config.ts` lives in `src/` and uses `schema: "prisma/schema.prisma"` and
  `path: "prisma/migrations"`. `npx prisma validate` from `DigitalMenuBackend/` fails
  (“Could not find Prisma Schema”); from `DigitalMenuBackend/src` it succeeds.
- `src/env.ts` and `src/prisma.config.ts` load `dotenv` with `path: "../.env"`. Confirmed
  behavior: running from `DigitalMenuBackend` injects **0** vars; running from
  `DigitalMenuBackend/src` injects the backend `.env` correctly. The npm scripts run from the
  package root, so `npm run dev`/`npm start` need either a fixed env path or a manually
  exported environment.
- Prisma client generator output is `src/generated/prisma` (ignored by git). Regenerate it
  with Prisma; never hand-edit generated files.

---

## 4. Environment variables

Names only; values live in ignored `.env` files.

### Backend (`DigitalMenuBackend/.env`)

Loaded names in `src/env.ts`:
`PORT`, `SECRET_KEY`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`MAIN_DOMAIN`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `JWT_ALGO`,
`STORAGE_TYPE`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_PUBLIC_URL_BASE`, `UPLOAD_ROOT`, `UPLOAD_PUBLIC_BASE`, `SALT_ROUND`,
`CORNERAUTHSECRET`, `CORNERTECHROUND`.

Observed `.env` also defines `CORNERTECHAUTHSECRET` (unused in code). All of these are
backend-only; never expose them to Vite.

### Customer/admin frontend (`DigitalMenuFrontend/.env`)

Observed keys:
`VITE_SERVER_ADDRESS`, `VITE_RESTAURANT_ID`, `VITE_API_BASE_URL`, `VITE_ASSET_BASE_URL`.

Actually used by code:
- `VITE_SERVER_ADDRESS` — every API URL (`src/env.ts`, `db/db.tsx`, `admin/api/apiFetch.ts`,
  `admin/api/authService.ts`, `admin/auth/AuthProvider.tsx`). It must include the backend
  base path, e.g. ending in `/api/v1`.
- `VITE_ASSET_BASE_URL` — only in `src/util/assets.ts` (`assetUrl`), which is currently not
  imported anywhere. Backend image URLs are generally stored as full public URLs already.

Currently unused/legacy: `VITE_API_BASE_URL`, `VITE_RESTAURANT_ID`.

### Super admin (`super-admin-panel/.env`)

- `VITE_SERVER_ADDRESS` — used by `src/api.ts`.
- Code fallback is `http://localhost:3000/api`, which does **not** match the backend’s
  `/api/v1` base path. Set the env var correctly; do not rely on the fallback.

---

## 5. Backend architecture

### 5.1 Boot and middleware (`src/index.ts`, `src/app.ts`)

`index.ts`:
1. Imports `app`, `connectdb`, `PORT`.
2. Calls `app.listen(PORT, async () => { await connectdb(); console.log(...) })`.
3. Dynamic CORS refresh is disabled/commented.

`app.ts` order:
1. CORS with `credentials: true`.
2. `helmet({ crossOriginResourcePolicy: false })`.
3. Global rate limit: `100` requests per `15 * 60 * 1000` ms per IP, standard draft-8
   headers, message `"Too many requests, please try again later."`.
4. `express.json({ limit: "16KB" })` and `express.urlencoded({ extended: true, limit: "16KB" })`.
5. Routers mounted under `/api/v1/health`, `/api/v1/auth`, `/api/v1/restaurant`,
   `/api/v1/category`, `/api/v1/item`.
6. Fallback for unknown paths logs the URL and returns `new ErrorResponse(404, "INVALID API")`.
   **Note:** it uses `res.json(...)`, not `res.status(404)`, so the HTTP status is 200 while
   the body’s `statusCode` is 404.
7. `errorMiddleware`.

CORS allow-list is a static `Set`:
- `http://localhost:3000` (customer/admin frontend)
- `http://192.168.1.12:3000` (LAN frontend)
- `http://localhost:5173` (super admin / Vite default)

Requests with **no origin** or an origin not in the set are rejected server-side with
`403` (`Origin header is required` / `Origin not allowed`) and no stack trace. This blocks
plain curl/Postman/server-to-server calls, but the `Origin` header can be spoofed, so it is
not authentication. Dynamic restaurant-domain CORS is also commented out. Because
`credentials: true` is set, any new frontend origin must be added to this list.

`cookie-parser` is installed but its registration is commented out; auth uses the
`Authorization` header, not cookies.

### 5.2 Response conventions

Success (`src/utils/API-Response.ts`):

```json
{
  "statusCode": 200,
  "data": {},
  "success": true,
  "message": "..."
}
```

Errors (`src/utils/Error-Response.ts`):

```json
{
  "statusCode": 400,
  "message": "...",
  "errors": [],
  "stack": "..."
}
```

Most controllers accept `req.body.para` (object or JSON string). Multipart item routes use
`para` as a JSON string in `FormData` and the file in field `image`.

`errorMiddleware` maps Prisma errors:
- `P2025` → 404 not found
- `P2002` → 400 duplicate unique field
- `P2003` → 404 missing related record
- `P2015` → 404 missing required relation
- `P2006` → 400 invalid value
- `P2011` → 400 null constraint
- `P2012` → 400 missing required value
- `PrismaClientValidationError` → 422
- `PrismaClientInitializationError` → 503
- `PrismaClientRustPanicError` / `PrismaClientUnknownRequestError` → 500

It always includes `stack` in the JSON response, which can leak internals.

### 5.3 Authentication and authorization

`src/utils/jwt.ts`:
- `TokenPayload = { publicId, username, restaurantId? }`.
- Access and refresh JWTs are signed with separate secrets and `JWT_ALGO`, using
  `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN`.
- Verification uses the respective secret. Invalid/expired tokens return `null`.

`src/middleware/auth.middleware.ts`:
- `authenticate`: requires `Authorization: Bearer <accessToken>`; returns
  `401 No access token provided` or `401 Invalid or expired access token`.
- `verifyRestaurantOwnership`: requires token’s `restaurantId` and requires
  `req.body.para.restaurant_id` to equal it; otherwise `403`.
- `verifyCategoryOwnership`: parses `para` (object or JSON string), uses
  `para.category_id` or `req.params.categoryid`, looks up the category, requires
  `restaurant_id === token.restaurantId`.
- `verifyItemOwnership`: parses `para`/params, requires `item_id`, looks up item + category,
  requires category belongs to token’s restaurant.

`src/utils/CornerLock.ts`:
- Reads header `x-tempdata`.
- `bcrypt.compare(header, CORNERAUTHSECRET)`.
- Success → `next()`.
- Failure → HTTP 400 `{"msg":"FUCK YOU A PEICE OF SHIT!"}` (exact current message).

`src/controllers/auth.controller.ts`:
- Registration hashes passwords with bcrypt cost `10` (hard-coded, even though
  `SALT_ROUND` is exported).
- Refresh tokens are bcrypt-hashed before storage in `RestaurantAdmin.refreshToken`.
- Login/register rotate and store a hash of the newest refresh token.
- `getAllAdmins` returns admins with `restaurant` but strips `password` and `refreshToken`
  before responding.

### 5.4 API endpoints

Base path: `/api/v1`. All routes return the `ApiResponse`/`ErrorResponse` shapes above.

#### Health

| Method | Path | Auth | Behavior |
|---|---|---|---|
| GET | `/health` | none | `{ statusCode: 200, data: null, success: true, message: "Health is OK!" }` |

#### Auth

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/auth/register` | `CornerLock` | `{ para: { username, password, restaurantName, tagline?, primaryColor?, accentColor?, tabStyle?, roundness?, showSearch?, showItemCount?, stickyNav?, domain? } }`. Requires username/password/restaurantName. Username must be globally unique. Creates admin + restaurant in one transaction. `domain` input is ignored; the created domain is always `${MAIN_DOMAIN}/${restaurantPublicId}/`. Returns 201 with access/refresh tokens, `{ publicId, username }`, and the restaurant. |
| POST | `/auth/login` | none | `{ para: { username, password } }`. Returns 200 with access/refresh tokens and `admin: { publicId, username, restaurant }`. |
| POST | `/auth/refresh` | refresh token in `Authorization: Bearer` | Verifies JWT and bcrypt-compares against stored hash; rotates **both** access and refresh tokens; returns `{ accessToken, refreshToken }`. |
| DELETE | `/auth/logout` | none | `{ para: { refreshToken? } }`; if valid, clears the stored refresh token; returns 200 either way. **Frontend currently calls POST instead.** |
| PUT | `/auth/updateAdmin/:restaurantPublicId` | `CornerLock` | `{ admin?: { username?, password? }, restaurant?: { name?, tagline?, primaryColor?, accentColor?, tabStyle?, roundness?, showSearch?, showItemCount?, stickyNav?, domain? } }`. Password is hashed. `domain` update is commented out/ignored. Updates restaurant + admin in a transaction; returns `{ restaurant, admin }` with password/refreshToken removed. |
| GET | `/auth/getAllAdmins` | `CornerLock` | Returns all admins with `restaurant` included, with `password` and `refreshToken` omitted. |
| DELETE | `/auth/delete/:publicId` | `CornerLock` | Deletes restaurant(s) where `adminId = publicId`, then deletes the admin. |

#### Restaurant

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| GET | `/restaurant/get/:rid` | none | Public. `rid` is restaurant `publicId`. Returns the full Restaurant record or 404. |
| PATCH | `/restaurant/update` | access token + ownership | `{ para: { restaurant_id, ...fields } }`. `restaurant_id` must match the token’s restaurant. Returns updated Restaurant. At least one recognized field is required. |

Recognized restaurant update fields: `name`, `tagline`, `primaryColor`, `accentColor`,
`tabStyle`, `logoUrl`, `backgroundUrl`, `roundness`, `showSearch`, `showItemCount`,
`stickyNav`, `showDivider`, `headerText`, `defaultImageUrl`, `showItemImage`,
`headerLayout`, `logoShape`, `overlayStyle`, `overlayIntensity`, `headingFont`,
`headerAlign`, `headerSize`, `categoryVariant`, `categorySize`, `itemSize`,
`itemImagePosition`, `itemImageShape`, `currencySymbol`, `surfaceColor`, `boardEnabled`,
`boardText`, `BodyTextColor`, `headerAccentPanel`, `headerPanelIntensity`,
`headerNameGradient`, `headerUppercaseTagline`, `headerShimmer`, `headerNameColor`,
`headerTaglineColor`, `headerNameGradientFrom`, `headerNameGradientTo`,
`headerNameGradientAngle`, `showLogo`, `logoSize`, `headerBackgroundPositionX`,
`headerBackgroundPositionY`, `headerBackgroundZoom`, `headerDividerStyle`,
`headerSpacing`, `headerMaxWidth`, `showPdfDownload`, `pdfDownloadPlacement`.

`domain` update is commented out/ignored. `boardText` skips `null`; other nullable fields
can be set to `null` if provided.

#### Category

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/category/add` | access token | `{ para: { name, icon? } }`. Restaurant comes from token. Name is checked case-insensitively **within the restaurant**; duplicates → 409. `icon` defaults to `"Utensils"`. Returns 201 category. |
| GET | `/category/get/:rid` | none | Public. Optional query `incItem=true` includes `items` and each item’s `variants`. Ordered by numeric `id` ascending. Returns 404 if restaurant missing. |
| PATCH | `/category/update` | access token + category ownership | `{ para: { category_id, name?, icon? } }`. Case-insensitive duplicate check within the category's restaurant. Returns category. |
| DELETE | `/category/delete/:categoryid` | access token + category ownership | Deletes category; DB cascade deletes items and variants. |

#### Item

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/item/add` | access token + category ownership + optional multipart | `para` may be object or JSON string. Fields: `name`, `description?`, `price?`, `category_id`, `variants?`, `badges?`, `available?`, `imageURL?`; optional file field `image`. `imageURL` accepts an http(s) or `/`-relative URL (invalid values → 400); an uploaded file takes precedence over it. Requires name + category_id. Name is checked case-insensitively **within the category**. Must have either numeric `price` **or** non-empty `variants`, never both. Variants require string name + numeric price. If image processing fails, still creates item and returns status **207** “Item Added But Failed To Add Image”. |
| GET | `/item/get/:cid` | none | Public. Returns items for category `publicId`, ordered by `name` ascending, including variants. |
| PATCH | `/item/update` | access token + item ownership + optional multipart | `{ para: { item_id, name?, description?, price?, category_id?, variants?, badges?, imageURL?, removeImage?, available? } }`. `item_id` from `para`. Cannot send both price and variants. If `variants` is provided it must be non-empty. Price mode deletes all variants and sets price. Variant mode sets price `null`, deletes existing variants, recreates them. Image URL sets/clears `imageURL`; an uploaded file takes precedence. Old image files are deleted from storage only when their URL is managed by `UPLOAD_PUBLIC_BASE`/`S3_PUBLIC_URL_BASE`. Returns updated item with variants. |
| DELETE | `/item/delete/:item_id` | access token + item ownership | Deletes item (variants cascade), then best-effort deletes stored image only when its URL is managed by `UPLOAD_PUBLIC_BASE`/`S3_PUBLIC_URL_BASE`. |

**Image URL validation is syntactic only:** `imageURL` is accepted when it is an
`http(s)://…` URL or a `/`-relative path; the backend does not check that it resolves to an
actual image.

**Known item-update quirk:** sending `badges: []` does not clear badges. The controller
computes `badgesToadd = Array.isArray(badges) && badges.length > 0 && badges`, then only
updates badges when that value is not `false`; an empty array becomes `false` and is skipped.

### 5.5 Upload and storage

`src/middleware/upload.middleware.ts`:
- `multer.memoryStorage()`
- max file size `5 * 1024 * 1024` bytes
- `fileFilter` accepts only MIME types starting with `image/`; otherwise error
  `"Only images allowed"`.

`src/utils/upload.ts`:
- sharp pipeline: `.rotate()` → `.resize(800, 800, { fit: "inside", withoutEnlargement: true })`
  → `.webp({ quality: 75, effort: 4 })`.
- Key is `itemsImages/<uuid>.webp`.
- Calls active storage adapter and returns its public URL, or `false` on processing error.

Storage adapter selection (`src/utils/storage/index.ts`):
- `STORAGE_TYPE === "s3"` → `S3StorageAdapter`
- otherwise → `LocalStorageAdapter`.

Local adapter:
- Writes to `path.join(UPLOAD_ROOT, key)` (creates directories).
- `delete` strips `UPLOAD_PUBLIC_BASE` and unlinks; errors are swallowed.
- `getPublicUrl` = trimmed `UPLOAD_PUBLIC_BASE` + `/` + key.

S3 adapter:
- AWS S3 client with `S3_REGION` + access keys (no custom endpoint, no path-style).
- `PutObjectCommand` with `ContentType: image/webp`,
  `CacheControl: public, max-age=15552000` (6 months).
- Upload errors are caught and only logged, so `uploadImage` can still return a public URL
  even when the S3 put failed. `delete` does not swallow errors.

Nginx can serve `/uploads` directly instead of Express.

### 5.6 Database model (`src/prisma/schema.prisma`)

Generator: `prisma-client` → output `../generated/prisma`.
Datasource: `postgresql` (URL supplied by `DATABASE_URL`; no `url` field in schema).
No `createdAt`/`updatedAt` timestamps on any model.

`RestaurantAdmin`:
| Field | Type | Notes |
|---|---|---|
| `id` | Int | autoincrement PK |
| `publicId` | String | UUID, unique, default `uuid()` |
| `username` | String | unique |
| `password` | String | bcrypt hash |
| `refreshToken` | String? | bcrypt hash of refresh token |
| `restaurant` | Restaurant? | 1–1 back-relation |

`Restaurant`:
| Field | Type / default |
|---|---|
| `id` | Int autoincrement PK |
| `publicId` | String UUID unique |
| `name` | String |
| `admin` / `adminId` | relation to `RestaurantAdmin.publicId`; `adminId` unique |
| `tagline` | String? |
| `backgroundUrl`, `logoUrl` | String? |
| `primaryColor` | String (required) |
| `tabStyle` | `NavStyle` (required) |
| `roundness` | String (required; register uses `"1rem"`) |
| `accentColor` | String (required) |
| `headerText` | String default `"#ffffff"` |
| `showSearch`, `showItemCount`, `showDivider`, `stickyNav` | Boolean default `false` |
| `domain` | String? |
| `defaultImageUrl` | String default `https://order.pennentertainment.com/assets/img/png/default-menu-image-placeholder.png` |
| `showItemImage` | Boolean default `false` |
| `headerLayout` | `headerLayoutN` default `banner` |
| `logoShape` | `logoShapeN` default `circle` |
| `BodyTextColor` | String default `"#ffffff"` (PascalCase in DB/API) |
| `overlayStyle` | `overlayStyleN` default `solid` |
| `overlayIntensity` | Float default `1` |
| `headingFont` | `headingFontN` default `sans` |
| `headerAlign` | `headerAlignN` default `center` |
| `headerSize` | `headerSizeN` default `compact` |
| `headerAccentPanel`, `headerNameGradient`, `headerUppercaseTagline`, `headerShimmer` | Boolean default `true` |
| `headerPanelIntensity` | Float default `1` |
| `headerNameColor`, `headerTaglineColor`, `headerNameGradientFrom`, `headerNameGradientTo` | String? |
| `headerNameGradientAngle` | Int default `120` |
| `showLogo` | Boolean default `true` |
| `logoSize` | `logoSizeN` default `auto` |
| `headerBackgroundPositionX`, `headerBackgroundPositionY` | Float default `50` |
| `headerBackgroundZoom` | Float default `1` |
| `headerDividerStyle` | `dividerStyleN` default `line` |
| `headerSpacing` | `headerSpacingN` default `default` |
| `headerMaxWidth` | `headerMaxWidthN` default `full` |
| `categoryVariant` | `categoryVariantN` default `pill` |
| `categorySize` | `categorySizeN` default `sm` |
| `itemSize` | `itemSizeN` default `sm` |
| `itemImagePosition` | `itemImagePositionN` default `left` |
| `itemImageShape` | `itemImageShapeN` default `square` |
| `currencySymbol` | String default `"₹"` |
| `surfaceColor` | String default `"#ffffff"` |
| `boardEnabled` | Boolean default `false` |
| `boardText` | String default `""` |
| `showPdfDownload` | Boolean default `true` |
| `pdfDownloadPlacement` | `pdfDownloadPlacementN` default `bottom_right` |

`Category`:
- `id` Int PK, `publicId` UUID unique, `name` String, **unique per restaurant**
  (`@@unique([restaurant_id, name])`).
- `restaurant_id` String → `Restaurant.publicId`, `onDelete: Cascade`.
- `icon` String default `"Utensils"`.
- `items` Item[].

`Item`:
- `id` Int PK, `publicId` UUID unique, `name` String, **unique per category**
  (`@@unique([category_id, name])`).
- `description` String?, `price` Float? (null when variants are used).
- `category_id` String → `Category.publicId`, `onDelete: Cascade`.
- `badges` String[] default `[]`.
- `variants` Variant[], `imageURL` String?, `available` Boolean default `true`.

`Variant`:
- `id` Int PK, `publicId` UUID unique, `name` String, `price` Float.
- `item_id` String → `Item.publicId`, `onDelete: Cascade`.

Enums:
- `NavStyle`: `tabs`, `dropdown`, `continuous`
- `headerLayoutN`: `banner`, `minimal`, `split`
- `logoShapeN`: `circle`, `rounded`, `square`
- `overlayStyleN`: `gradient`, `solid`, `none`
- `headingFontN`: `serif`, `sans`, `display`
- `headerAlignN`: `center`, `left`
- `headerSizeN`: `compact`, `default`, `large`
- `categoryVariantN`: `pill`, `underline`
- `categorySizeN`: `sm`, `md`, `lg`
- `itemSizeN`: `sm`, `md`, `lg`
- `itemImagePositionN`: `left`, `right`
- `itemImageShapeN`: `rounded`, `square`, `circle`
- `logoSizeN`: `auto`, `sm`, `md`, `lg`
- `dividerStyleN`: `line`, `dots`, `diamond`, `none`
- `headerSpacingN`: `tight`, `default`, `loose`
- `headerMaxWidthN`: `sm`, `md`, `lg`, `full`
- `pdfDownloadPlacementN`: `bottom_right`, `bottom_left`, `top_right`, `top_left`

### 5.7 Migrations

Located in `src/prisma/migrations/`; provider PostgreSQL (`migration_lock.toml`).

Tracked:
1. `20260816041942_init` — full initial schema (including later header enums fields that
   were present when the migration was generated).
2. `20261022152811_init` — adds `Restaurant.BodyTextColor`.
3. `20261115114128_header_customization` — adds header enums/fields incl. the old
   `headerBackgroundPositionN` enum and `headerBackgroundPosition`.
4. `20261115120000_header_focal_gradient` — replaces that enum/field with
   `headerBackgroundPositionX/Y`, adds name-gradient from/to/angle.

Untracked at time of writing:
5. `20261116120000_pdf_download_settings` — adds `pdfDownloadPlacementN` and
   `showPdfDownload` / `pdfDownloadPlacement`.
6. `20261117120000_scope_name_uniqueness` — drops global unique indexes
   `Category_name_key` / `Item_name_key` and adds composite unique indexes
   `Category_restaurant_id_name_key` (`restaurant_id`, `name`) and
   `Item_category_id_name_key` (`category_id`, `name`).
7. `20261117130000_continuous_nav_style` — adds the `continuous` value to the `NavStyle`
   enum.

All 7 migrations are applied to the local database. Apply/generate from
`DigitalMenuBackend/src`, e.g. `npx prisma migrate dev` / `npx prisma migrate deploy` /
`npx prisma generate`.

### 5.8 Postman collection

`src/DIGITAL_MENU(cv2).postman_collection.json` is stale and documents old routes/
responses. Treat the code and this file as authoritative, not the Postman collection.

---

## 6. Customer menu frontend

### 6.1 Routing (`src/App.tsx`)

`BrowserRouter` + `AuthProvider`:
- `/admin/login` → `LoginPage`
- `/admin` → `ProtectedRoute` → `AdminLayout`
  - index → `SettingsPage`
  - `categories` → `CategoriesPage`
  - `items` → `ItemsPage`
- `/:RestaurantId` → `DigitalMenu`
- `/` → `Home` (placeholder; renders `Home`)

`vercel.json` rewrites every path to `index.html`, so BrowserRouter deep links work on
Vercel.

### 6.2 Public API helpers (`src/db/db.tsx`)

- URL = `${VITE_SERVER_ADDRESS}${endpoint}` (+ query for params).
- Always sends `Content-Type: application/json`; GET has no body.
- Parses `ApiResponse<T>`; throws on non-OK or `success: false`.
- `getRestaurantInfo(id, signal)` → `GET /restaurant/get/:id`; returns `null` on non-abort
  errors.
- `getCategoriesAndItems(id, signal)` → `GET /category/get/:id?incItem=true`; returns `null`
  on non-abort errors.

### 6.3 `DigitalMenu.tsx`

- Reads `:RestaurantId` from the route.
- Fetches restaurant config and categories/items in parallel with one `AbortController`;
  aborts after **8 seconds**. Retry button resets state and bumps a retry counter.
- Loading screen while config absent; error screen with “Try again” when config/category
  fetch sets `configError`.
- Global search (`showSearch` controls input visibility):
  - trims/lowercases query,
  - searches item **names only** across all categories,
  - groups results by original category order and shows a category heading when it changes,
  - hides the category nav and announcement board while searching,
  - clears search when a category is selected.
- Empty categories state: “No Categories Added By Restaurant Yet”, plus footer.
- Item counts per category computed from `items.length`.
- Nav style from `restaurantConfig.tabStyle` (`tabs` default): `CategoryTabs` or
  `CategoryDropdown`; `categorySize`, `categoryVariant`, `showItemCount` passed through.
  `continuous` renders no nav: every category (icon + name + optional count) followed by
  its items in one vertical scroll; the sticky bar contains only the search input (and is
  omitted entirely when search is disabled). Search results use the same grouped view in
  all three modes. Tab-only settings (`categoryVariant`, `categorySize`) have no effect in
  continuous mode.
- Announcement board: shown when `boardEnabled && boardText && !isSearching`; uses
  `--accent-soft` background, `--accent` border/icon, `--primary` text, `--radius`.
- Sticky nav wrapper when `stickyNav`; search input and nav are inside a `no-print` bar.
  In `continuous` mode the bar holds only the search input and is omitted when
  `showSearch` is off.
- Theme vars built with:
  - primary `primaryColor` (fallback `#1e293b`)
  - accent `accentColor` (fallback `#0ea5e9`)
  - radius `roundness` (fallback `1rem`)
  - surface `surfaceColor` (fallback `#ffffff`)
  - body text `BodyTextColor`
- Header receives nearly every Restaurant customization field (see §8).
- PDF button: shown when `showPdfDownload ?? true`; placement class from
  `pdfDownloadPlacement`; fixed, theme-colored, `no-print`; calls
  `downloadMenuPdf(config, categoriesAndItems)`.
- Footer is always last; content wrapper uses `flex-1`, page uses
  `min-h-screen min-h-dvh flex flex-col`.

### 6.4 PDF export (`src/util/menuPdf.ts`)

- jsPDF A4, points, 40pt margins.
- Replaces `₹` with `Rs. ` and strips non-ASCII except tab/LF/CR/space–`~`; collapses
  whitespace.
- Renders restaurant name/tagline, divider, categories, item names/descriptions, price or
  variants, `(Unavailable)` for `available === false`, “No items…” placeholders.
- Wraps text and adds pages as needed; adds `i / total` page numbers.
- Filename = sanitized restaurant name + `.pdf`.

### 6.5 Components

`Header.tsx` (`HeaderProps`):
- `name`, `tagline`, `logoUrl`, `backgroundImage`, `color` (primary background),
  `accent`, `textColor`.
- `layout`: `banner` | `minimal` | `split`. `minimal` hides the cover image; `split` puts
  logo beside text.
- `align`: `center` | `left`; `size`: `compact` | `default` | `large`; `spacing`:
  `tight` | `default` | `loose`; `maxWidth`: `sm` | `md` | `lg` | `full`.
- `showDivider`; `dividerStyle`: `line` | `dots` | `diamond` | `none`.
- `logoShape`: `circle` | `rounded` | `square`; `logoSize`: `auto` | `sm` | `md` | `lg`;
  `showLogo`.
- `overlayStyle`: `gradient` | `solid` | `none`; `overlayIntensity` 0–1.
- `backgroundPositionX/Y` percentages; `backgroundZoom` (scale).
- `headingFont`: `serif` (Fraunces), `sans`, `display` (`font-display` utility).
- `accentPanel` + `panelIntensity`; name gradient flag/from/to/angle; `nameColor`,
  `taglineColor`; `uppercaseTagline`; `shimmer`.
- Optional unused-by-menu `statusBadge` and `cta` props.
- Shimmer injects `header-sheen` / `header-pulse` keyframes and respects
  `prefers-reduced-motion`.
- Name gradient: CSS linear-gradient text clip; fallbacks are `headerNameColor` /
  `textColor` and `accent`.
- Logo accent panel is a blurred rotated gradient behind the logo.
- Split layout adds two blurred accent shapes.
- A radial accent glow is always layered over the header.

`Item.tsx`:
- `showImage` + `imageURL`/`defaultImage`; falls back to default on image error.
- `size`: `sm` | `md` | `lg`; `imagePosition` left/right; `imageShape`
  rounded/square/circle.
- Sold-out items: image grayscale, dark “Sold out” overlay, card opacity 60%.
- Badges: diet marks (`veg`, `non-veg`) with fixed FSSAI-style colors; tags
  `chef-special`, `spicy`, `bestseller` with fixed colors/icons.
- Price shown only when `item.price` is truthy and there are no variants (so a price of
  `0` is hidden).
- Variants render as chips with name + price.
- Card border uses full `accentColor` (not a translucent variant); border radius
  `--radius`; background `--surface`.

`CatgoriesNavs.tsx`:
- `CategoryTabs`: horizontal scroll, hides scrollbar, scrolls active tab into view,
  supports `pill` and `underline`, sizes `sm/md/lg`, optional item-count badge.
- `CategoryDropdown`: custom listbox with click-outside and Escape handling, active item
  count, sizes `sm/md/lg`.
- Icons come from `getCategoryIcon` with fallback `Utensils`.

`Footer.tsx`: compact (`py-2 px-4`, `text-xs`), `mt-auto`, top border; text/border use
`color-mix` from `--body-text`. Text: “Please inform your server of any dietary
restrictions or allergies”.

`Loader.tsx`: fixed light spinner + “Loading...”.

`Home.tsx`: placeholder only.

### 6.6 Theme and utilities (`src/util/util.ts`)

`ICONS` maps category icon names → lucide icons: `Utensils`, `Coffee`, `IceCream`,
`Pizza`, `Soup`, `Wine`, `Salad`, `Sandwich`, `Fish`, `Beef`. Default `Utensils`.

`useThemeVars(primary, accent, radius, surface, bodyText?)` returns:
- `--primary`
- `--body-text` = `bodyText || primary`
- `--accent`
- `--accent-soft` = `${accent}1A`
- `--accent-soft-strong` = `${accent}33`
- `--radius`
- `--surface`

The `1A`/`33` alpha suffixes assume a 6-digit hex accent; arbitrary CSS colors may not work.

`diffChanged(original, updated, deepKeys?)`: shallow diff by default; JSON-stringifies keys
listed in `deepKeys` (used for badges/variants arrays).

Badge configs:
- `chef-special`: “Chef’s Special”, `ChefHat`, `#b45309`
- `spicy`: “Spicy”, `Flame`, `#dc2626`
- `bestseller`: “Bestseller”, `TrendingUp`, `#0f766e`
- diet labels: `veg` → Vegetarian, `non-veg` → Non-Vegetarian.

`src/util/assets.ts` (`assetUrl`): joins `VITE_ASSET_BASE_URL` (default `/uploads`) with a
key; not currently imported anywhere.

`src/index.css`: imports Fraunces + Tailwind, sets `html/body/#root` min-heights
(`100%`, `100vh`, `100dvh`), overrides `.font-serif` to Fraunces, `.scrollbar-hide`,
`.input` component, and `@media print { .no-print { display: none } }`.

### 6.7 Frontend types

`src/types/index.ts`: public `RestaurantConfig`, `Category`, `Item`, `Variant`,
`ApiResponse`, `RequestOptions`, `SearchResultItem`.
`RestaurantConfig` includes `roundness`, `BodyTextColor`, header/layout
options, item/card/nav options, currency, surface, board, PDF fields.

`src/admin/types/index.ts`: admin `Restaurant` includes both `bodyTextColor?` and
`BodyTextColor?` (the Settings form now writes `BodyTextColor`), plus `roundness`, and
legacy/unused `pageBackground` / `itemOfTheDayId`. `NavStyle` is
`'tabs' | 'dropdown' | 'continuous'`; `Item` has `imageURL?`; `ItemPayload` has
`imageURL?`; `ItemFormValues` has `imageMode: 'upload' | 'url'` and `imageUrl?`.
`AdminInfo` is `{ publicId, username, restaurant }`.

---

## 7. Admin panel flow

### 7.1 Auth

`AuthProvider`:
- Access token kept **in memory** (`tokenstore.ts`).
- `refreshToken` and `adminInfo` stored in `localStorage`.
- On mount: if `refreshToken` exists, POST `${VITE_SERVER_ADDRESS}/auth/refresh` with
  `Authorization: Bearer <refreshToken>`; on success stores new tokens and restores
  `adminInfo` from localStorage; on failure removes both localStorage entries.
- On network error during bootstrap, leaves stored tokens as-is.
- `login` calls `authService.login`, stores admin in state + localStorage.
- `logout` calls `authService.logout`, removes `adminInfo`, clears admin state.
- `updateCachedRestaurant` updates state + localStorage.
- `onForceLogout` clears admin state and removes `adminInfo` (does not remove
  `refreshToken`).

`apiFetch.ts`:
- Prefixes `${VITE_SERVER_ADDRESS}`.
- Adds `Authorization: Bearer <accessToken>` when present.
- Adds `Content-Type: application/json` only for string/undefined bodies (so FormData
  works).
- On 401 (and not already retried): shares one refresh promise, refreshes using
  `refreshToken`, retries once with new access token. If refresh fails, triggers force
  logout and returns the original 401 response.

`authService`:
- `login`: direct `fetch` POST `/auth/login` with `{ para: { username, password } }`;
  stores access token in memory + refresh token in localStorage; returns admin.
- `logout`: clears memory/local refresh token first, then best-effort
  `apiFetch('/auth/logout', { method: 'POST', body: { para: { refreshToken } } })`.
  **Backend route is DELETE, so this request does not clear the server-side token.**

`ProtectedRoute`: waits for `isCheckingSession`, redirects unauthenticated users to
`/admin/login` with `state.from = location`.

`LoginPage`: redirects authenticated users to `state.from` or `/admin/dashboard`.
**`/admin/dashboard` does not exist**, so a direct login without a `from` state ends on a
non-matching route. Redirects after ProtectedRoute work because `from` is `/admin...`.

### 7.2 Layout

`AdminLayout`:
- Desktop fixed sidebar (240px) with restaurant name, username, nav links:
  Settings (`/admin`, `end`), Categories (`/admin/categories`), Menu Items (`/admin/items`),
  Log out.
- Mobile top bar + slide-in drawer, closes on navigation.
- Outlet in scrollable main.

### 7.3 Settings page

Loads restaurant via `restaurantService.getInfo(restaurantId)`; keeps `original` and `form`
copies; computes `dirty` with `diffChanged`; save sends only changed fields through
`restaurantService.update` and updates auth cache.

Sections:
1. **Domain**: disabled menu URL, copy button, show/hide QR (via
   `https://api.qrserver.com/v1/create-qr-code/`), download 512×512 PNG. Menu URL uses
   `form.domain` (prefixes `https://` unless it already starts with http/https), otherwise
   `window.location.origin/<restaurantId>`.
2. **Theme Presets** (full width): grid of ready-made themes from
   `src/admin/themePresets.ts` (`THEME_PRESETS`: Classic, Midnight, Ocean, Sunset, Forest,
   Rose, Mono). Each card shows a 3-colour swatch and description; clicking merges the
   preset's `values` (a `Partial<Restaurant>`) into the form so the admin can fine-tune and
   save. A preset is marked active when every one of its values matches the current form.
   Frontend-only; no backend/schema changes.
3. **Branding**: name, tagline, logo URL, background URL, default item image URL, enable
   item image.
4. **Appearance**: Primary, Accent, Body Text, Header Text, Background color; Nav Style
   (tabs/dropdown/continuous); Nav Size; Tab Style (pill/underline, only tabs); Roundness; Header
   Alignment; Header Size; Header Layout; Logo Shape; Heading Font; Photo Overlay +
   intensity.
5. **Header Style**: vertical spacing, max width, name/tagline color, logo size, divider
   style, photo focus X/Y, photo zoom, toggles (show logo, accent panel, name gradient,
   uppercase tagline, shimmer), gradient start/end/angle, accent panel intensity.
6. **Item Cards**: card size, image position, image shape, currency symbol.
7. **Display Options**: search, divider, item count, sticky nav, PDF button visibility +
   placement.
8. **Announcement Board**: enable + 200-character text.

Save bar is sticky at the bottom with “Saved / Unsaved changes / No changes” status.
Desktop layout uses a single form with `lg:columns-2` masonry-style columns; there is no
separate mobile/desktop form implementation anymore.

Body Text now edits `BodyTextColor` (the field the backend persists) and the public menu
reads `roundness` (the field the backend sends), so both previously-broken controls apply.

### 7.4 Categories page

- Loads categories for logged-in restaurant.
- Add category with name + `IconPicker` (10 icon choices or none); calls
  `categoryService.add`.
- Inline edit name/icon; sends only changed fields via `diffChanged`.
- Delete with confirm; DB cascade removes items/variants.
- Errors shown in a red alert.

### 7.5 Items page

- Loads categories, selects first; loads items for active category.
- Category tabs switch item list via `handleCategoryChange`, which first closes and resets
  the Add form, cancels any open edit form, and clears the error. Clicking the active tab is
  a no-op.
- Add item via `ItemForm`; `buildNewItemPayload` sends price mode or variants mode plus
  badges/available and, in URL image mode, `para.imageURL`.
- Edit item: converts item to form values, diffs name/description/available, badges
  (deep), price/variants, plus image file, image URL and remove flag.
- Quick “Mark sold out / Mark available” sends `{ available: !current }`.
- Delete with confirm; calls itemService.delete.
- Uses hard-coded `₹` when displaying prices in the admin list, regardless of
  `currencySymbol`.

### 7.6 Item form

- Fields: availability toggle, name, description, image (Upload/URL toggle, upload or URL
  input, remove/preview), pricing mode (single price or variants), badge selector.
- Image `imageMode` is `'upload'` (default) or `'url'`. Switching modes clears `imageFile`
  and `removeImage` but keeps `imageUrl` so the existing image stays visible.
- Upload mode: file validation ≤ 5 MB, MIME starts with `image`; client sets `imageFile`
  and clears `removeImage`. No file chosen on edit ⇒ no image change is sent.
- URL mode: `imageUrl` accepts an http(s) or `/`-relative URL; live preview from the URL.
  On add, a non-empty trimmed value is sent as `para.imageURL`; on edit, `buildItemChanges`
  sends `imageURL` only when it differs from the item's stored `imageURL` (`''` clears it).
- “Remove image” (X on preview) sets `imageFile = null`, `imageUrl = ''`, `removeImage = true`.
- Variants: add/remove rows; each has name + price.
- Submit button is `type="button"` and calls `onSubmit`; parent validates name. HTML
  `required` attributes do not automatically block form submission.
- `emptyItemForm`: name/description blank, price mode, one blank variant, no badges,
  `imageMode: 'upload'`, empty `imageUrl`, no image, `available: true`.

### 7.7 Admin services

`categoryService`:
- `getByRestaurant(restaurantId, includeItems=false)` builds
  `/category/get/${restaurantId}/${params.toString()}`. This puts query data after a slash
  (and leaves a trailing slash when empty) instead of using `?`. The current admin calls
  omit `includeItems`, so it usually works only by Express trailing-slash tolerance;
  `includeItems=true` is broken.
- `add`, `update`, `delete` send the expected `para`/URL shapes.

`itemService`:
- `getByCategory` → `/item/get/:categoryId`.
- `add` → multipart with `para` JSON string + `image` when a file exists, otherwise JSON
  (URL image mode sends `imageURL` in the JSON `para`).
- `update` mutates the payload (adds `item_id`, maybe `removeImage`), uses multipart only
  when replacing an image and not removing; otherwise JSON (including `imageURL` changes).
- `delete` → DELETE URL.

`restaurantService`:
- `getInfo` → `/restaurant/get/:id`.
- `update` → PATCH `/restaurant/update` with `{ para: { restaurant_id, ...updates } }`.

---

## 8. Super-admin panel

Single `App.tsx`, no router. Flow:
1. Lock screen asks for a secret key.
2. `setTempSecret(secret)` stores it in memory; `getAllAdmins()` runs to validate/load.
3. `api.ts` sends `x-tempdata` on every request and always sets
   `Content-Type: application/json`.
4. Failure alerts; if error message includes `400` or `401`, it locks again.

Features:
- Inline **Add Restaurant Admin** form: username, password, restaurant name, tagline,
  primary/accent color, tab style (`dropdown`/`tabs`/`continuous`), roundness, domain, show search,
  show item count, sticky nav. Posts `{ para: formData }` to `/auth/register`.
  **Domain is ignored by the backend**, which sets the generated path domain instead.
- Existing admins list showing username, restaurant name, restaurant `publicId` (copy
  button), Edit, Delete.
- Edit row: admin username/new password (blank keeps current), restaurant name, tagline,
  primary/accent color, tab style, roundness, domain, show search/item count/sticky nav.
  Sends only changed values as `{ admin?: ..., restaurant?: ... }` (no `para`) to
  `PUT /auth/updateAdmin/:restaurantPublicId`.
  **Domain changes are ignored by the backend.**
- Delete sends `DELETE /auth/delete/:adminPublicId` (comment says admin publicId).
- The unlock secret is stored only in module memory (`tempSecret`), sent as `x-tempdata`
  on every request, and never logged or persisted to `localStorage`; the input state is
  cleared after unlocking.
- `getAllAdmins` response omits password and refresh-token hashes.

`src/RegistrationFormComponent.tsx` is an unused duplicate registration form. Its tab-style
options include `buttons`, which is not a valid Prisma `NavStyle`; do not import it without
fixing that.

---

## 9. Theming / customization mapping

CSS variables:
- `--primary`: primary brand color; used for header background, some search/board text.
- `--body-text`: menu body text; item names/prices, variant text, category nav text,
  category headings, footer/search colors. Falls back to `primary`.
- `--accent`: active tabs, borders, highlights, icon colors.
- `--accent-soft` / `--accent-soft-strong`: translucent accent washes.
- `--radius`: cards, tabs, dropdown, search, board.
- `--surface`: page/card/search/nav background.

Header customization fields are persisted on `Restaurant` and passed through
`DigitalMenu`:
- layout (`headerLayout`), align, size, spacing, max width
- logo show/shape/size, accent panel + intensity
- divider visibility/style
- cover photo show/hide via layout, focal X/Y, zoom
- overlay style + intensity
- heading font, name/tagline colors, uppercase tagline
- name gradient flag/from/to/angle
- shimmer animation

Category/items:
- `tabStyle` → tabs/dropdown/continuous
- `categoryVariant` → pill/underline tabs
- `categorySize` → sm/md/lg
- `showItemCount`
- `showItemImage`, `defaultImageUrl`
- `itemSize`, `itemImagePosition`, `itemImageShape`
- `currencySymbol`
- `surfaceColor`
- `BodyTextColor`

Announcement board fields: `boardEnabled`, `boardText`.
PDF fields: `showPdfDownload`, `pdfDownloadPlacement`.

---

## 10. Deployment / infrastructure notes

`nginx.config` (sample):
- Listens on `8080`, `server_name localhost`.
- `location /uploads` aliases placeholder `your_root_upload_path`; denies `.php`, `.js`,
  `.sh`; caches 1 day; `try_files $uri =404`.
- `location /` proxies to `http://localhost:3000` with standard forwarded headers.
- The sample proxy target (`3000`) matches the Vite frontend port, while the backend
  `.env` currently uses `PORT=3001`. Treat this as an incomplete sample and align it for
  the real deployment (static frontend + API server).
- Backend helmet disables `crossOriginResourcePolicy` so images can be embedded
  cross-origin.

Frontend:
- `vercel.json` rewrites all routes to `index.html` (SPA).
- Vite dev server binds `0.0.0.0:3000`.
- Production assets are served by the hosting platform; API base comes from
  `VITE_SERVER_ADDRESS`.

Super admin:
- No deployment config checked in; default Vite build output.
- Its origin must be added to backend CORS if not `localhost:5173`.

---

## 11. Known issues / gotchas (verified against current code)

1. **Backend env loading path is wrong for package-root commands.**
   `src/env.ts` and `src/prisma.config.ts` use `../.env`. Running from
   `DigitalMenuBackend/` injects 0 vars; running from `DigitalMenuBackend/src/` works.
   `npm run dev` and `npm start` run from the package root, so they will not read
   `DigitalMenuBackend/.env` unless the path is fixed or env vars are exported externally.
2. **Prisma commands must run from `DigitalMenuBackend/src`.** From the package root,
   Prisma cannot find the schema/config.
3. **Login default redirect is broken.** `LoginPage` falls back to
   `/admin/dashboard`, which has no route. Direct logins can land on a blank page; use
   `/admin` or remove the fallback.
4. **Logout uses the wrong HTTP method.** Frontend `authService.logout` POSTs to
   `/auth/logout`; backend defines DELETE. Local state clears, but the stored refresh token
   is not cleared server-side.
5. **Category service query string is malformed.**
   `categoryService.getByRestaurant` builds `/category/get/:id/<params>` instead of
   `/category/get/:id?<params>`. `includeItems=true` would not be understood.
6. **Invalid API fallback returns HTTP 200.** `app.ts` sends `ErrorResponse(404)` via
   `res.json` without `res.status(404)`.
7. **No-origin requests are rejected by CORS.** curl/Postman/server-to-server calls must
   send an `Origin` header from the allow-list; the header is spoofable, so this is not
   authentication.
8. **Badges cannot be cleared via update.** Sending `badges: []` is treated as “no
   change” by `items.controller.ts`.
9. **A price of `0` is not displayed** because `Item.tsx` checks
   `itemStructure.price && !hasVariants` instead of `price != null`.
10. **Custom domain is effectively immutable.** Register ignores its `domain` input and
    overwrites it with `${MAIN_DOMAIN}/${publicId}/`; both restaurant update endpoints
    have domain updates commented out.
11. **Super-admin API fallback base path is wrong.** `http://localhost:3000/api` lacks
    `/v1`; set `VITE_SERVER_ADDRESS`.
12. **QR download depends on `api.qrserver.com`.** Network/CORS failures surface as
    “Failed to download QR code”; the QR preview is an external image.
13. **S3 upload errors are swallowed** in `S3StorageAdapter.upload`, so the API may return
    a public URL even if the object was not stored.
14. **Force-logout leaves `refreshToken` in localStorage.** `triggerForceLogout` only
    clears the access token and cached admin info.
15. **`assetUrl` is unused and backend stores full image URLs.** Image fields
    (`imageURL`, `logoUrl`, etc.) are rendered directly; `VITE_ASSET_BASE_URL` only affects
    `assetUrl`.
16. **Two init migrations exist.** `20260816041942_init` creates the full initial schema;
    `20261022152811_init` only adds `BodyTextColor`. Keep this in mind when resetting a DB
    or squashing history.
17. **The Postman collection is stale.** Do not use it as the API source of truth.
18. **Frontend env keys are partly legacy.** `VITE_API_BASE_URL` and
    `VITE_RESTAURANT_ID` are present but unused; code uses `VITE_SERVER_ADDRESS` (and
    `VITE_ASSET_BASE_URL` only in unused `assets.ts`).
19. **Admin item prices are hard-coded to `₹`.** The `currencySymbol` setting only affects
    the public menu/PDF, not `ItemPage.tsx`.
20. **Header `display` font uses `font-display`**, but the app only explicitly loads
    Fraunces and overrides `.font-serif`; verify that the `display` option renders as
    intended in the target Tailwind build.
21. **`admin/login` after successful direct login** can navigate to a non-existent route
    (see #3); also `AuthProvider` requires cached `adminInfo` after refresh, so clearing
    that key while keeping a valid refresh token leaves the admin unauthenticated until
    login.

---

## 12. Conventions

- Do **not** add code comments unless explicitly asked.
- Match existing style:
  - React function components with typed props.
  - Tailwind utility classes plus inline CSS variables for theming.
  - Backend ESM with `.js` extensions in relative imports.
- `src/generated/prisma` is generated; regenerate instead of hand-editing.
- Never commit `.env` files or secrets.
- Only commit when explicitly asked.
- Update this file whenever behavior, routes, schema, env vars, or known issues change.
- Preferred canonical spelling: the persisted field is `BodyTextColor` (PascalCase in
  DB/API) and the radius field is `roundness`; the admin form and public menu now both use
  these. `bodyTextColor`/`cardRadius` are legacy aliases kept only on the admin type.

---

## Change Log

> Newest entries at the top. Include date, area, files, and a short what/why.

### 2026-11-17 — CORS rejects no-origin and unknown origins explicitly
- **Backend**
  - `src/app.ts`: the CORS `origin` callback now returns `403 Origin header is required` for
    requests without an `Origin` header and `403 Origin not allowed` for origins outside
    `STATIC_ORIGINS`. The errors omit the stack trace.
- **Verified:** local requests without an allowed `Origin` get `403`; `http://localhost:3000`
  still gets `200` with CORS headers. `npm run build` passes.
- **Why:** make the existing curl/Postman block intentional and clear instead of a generic
  500 with an internal stack trace. This is still not authentication because `Origin` can be
  spoofed.

### 2026-11-17 — Super-admin secret handling hardened
- **Super admin**
  - `src/api.ts`: removed `console.log(tempSecret)` and `console.log(jsonres)`; the
    `x-tempdata` secret is no longer printed to the browser console, and API responses
    (which may contain sensitive fields) are no longer dumped.
  - `src/App.tsx`: the unlock input state is cleared after `setTempSecret`, so the typed
    secret does not linger in React state.
- **Backend**
  - `src/controllers/auth.controller.ts`: `getAllAdmins` now maps admins to
    `{ id, publicId, username, restaurant }` instead of using `forEach` (which returned
    `undefined` and also failed to reliably hide `password`/`refreshToken`).
- **Why:** keep the shared secret out of frontend logs/state and stop admin password/refresh
  hashes from reaching the browser. Frontend `.env` files only contain `VITE_*` values and no
  backend secrets; no `.env` file is tracked by git.

### 2026-11-17 — Continuous category navigation style
- **Backend**
  - `src/prisma/schema.prisma`: added `continuous` to the `NavStyle` enum; client regenerated.
  - Migration `src/prisma/migrations/20261117130000_continuous_nav_style` (`ALTER TYPE ... ADD VALUE`),
    applied locally with `prisma migrate deploy`.
- **Frontend public**
  - `src/DigitalMenu.tsx`: `tabStyle === 'continuous'` renders every category heading (icon,
  name, optional item count) followed by its items in one vertical scroll, with no tabs or
  dropdown. The sticky bar shows only the search input, and is omitted when search is off.
  Global search results are unchanged and still grouped by category.
- **Frontend admin / super admin**
  - `src/admin/types/index.ts`, `src/admin/pages/SettingsPage.tsx`: added the `continuous`
  option plus an explanatory note.
  - `super-admin-panel/src/App.tsx`: added `continuous` to the `NavStyle` type and both
  tab-style selects.
- **Why:** offer a single-scrolling menu layout (category → items → next category) for menus
  that don't need tab/dropdown switching.

### 2026-11-17 — Item image: URL or upload
- **Backend**
  - `src/controllers/items.controller.ts`: `addItem`/`updateItem` now accept `para.imageURL`
    (http(s) or `/`-relative; invalid values → 400). An uploaded `image` file still takes
    precedence. Storage deletion now only runs for URLs managed by `UPLOAD_PUBLIC_BASE` /
    `S3_PUBLIC_URL_BASE`, so external URLs are never passed to storage adapters.
- **Frontend admin**
  - `src/admin/pages/ItemForm.tsx`: Image section gained an Upload/URL toggle; URL mode has
    a URL input with live preview, upload mode keeps the file picker. Removing an image
    also clears `imageUrl`.
  - `src/admin/types/index.ts`, `src/admin/components/ItemFormValues.ts`: added
    `imageMode`, `imageUrl`, `Item.imageURL`, `ItemPayload.imageURL`.
  - `src/admin/pages/ItemPage.tsx`: new items send `para.imageURL` in URL mode; edits send
    `imageURL` only when it changed (empty string clears it). Editing an item with an image
    defaults to URL mode.
- **Why:** let admins reuse externally hosted images (or existing CDN URLs) without having
  to upload a copy, while keeping the existing upload flow.

### 2026-11-17 — Close item forms on category switch
- **Frontend admin**
  - `src/admin/pages/ItemPage.tsx`: category tab clicks now go through `handleCategoryChange`,
    which closes the Add-item form (resetting it to `emptyItemForm`), cancels any open edit
    form, and clears the error before switching. Clicking the already-active tab is a no-op.
- **Why:** previously the add/edit form stayed open while the item list switched to another
  category, leaving stale form state and risking an item being added to the wrong category.

### 2026-11-17 — Theme presets + fix body text / roundness controls
- **Frontend admin**
  - `src/admin/themePresets.ts` (new): `THEME_PRESETS` — seven ready-made themes (Classic,
    Midnight, Ocean, Sunset, Forest, Rose, Mono), each a `Partial<Restaurant>` plus a
    `getPresetSwatch` helper. Frontend-only.
  - `src/admin/pages/SettingsPage.tsx`: new full-width “Theme Presets” section renders a
    card per preset; clicking merges the preset's values into the form (then the admin
    saves). A preset is highlighted when the form exactly matches it. Body Text now writes
    `BodyTextColor` (was the ignored `bodyTextColor`).
- **Frontend public**
  - `src/types/index.ts`: `RestaurantConfig.cardRadius` → `roundness`.
  - `src/DigitalMenu.tsx`: reads `roundness` for the theme radius and `Header` `radius`.
- **Why:** let admins pick a complete look in one click instead of configuring every
  setting, and make the Body Text and Roundness controls actually apply on the public menu.

### 2026-11-17 — Scope category/item name uniqueness to tenant
- **Backend**
  - `src/prisma/schema.prisma`: removed global `@unique` from `Category.name` and
    `Item.name`; added `@@unique([restaurant_id, name])` on `Category` and
    `@@unique([category_id, name])` on `Item`.
  - Migration: `src/prisma/migrations/20261117120000_scope_name_uniqueness/migration.sql`
    (untracked) drops `Category_name_key` / `Item_name_key` and creates
    `Category_restaurant_id_name_key` / `Item_category_id_name_key`.
  - `src/controllers/category.controller.ts`: add/update duplicate checks now filter by the
    restaurant instead of checking globally.
  - `src/controllers/items.controller.ts`: add/update duplicate checks now filter by the
    target category instead of checking globally.
  - Prisma client regenerated; `npm run build` passes.
- **Why:** the global unique constraints prevented two restaurants from both having a
  category/item with the same name (e.g. “Drinks” or “Burger”). Uniqueness is now scoped:
  categories per restaurant, items per category.

### 2026-11-17 — Full context audit and rewrite
- **Files:** `CONTEXT.md`
- **What:** Rewrote the project context from the current source code. Documented the exact
  repo layout, all three apps, run-directory quirks, every env key name, complete API
  surface, Prisma models/enums/migration status, upload/storage behavior, customer menu,
  admin auth/pages/services, super-admin flow, theming, deployment notes, and verified
  bugs.
- **Why:** The previous file contained stale route/migration/env notes (e.g. Prisma was
  said to run from `DigitalMenuBackend`, but it must run from `DigitalMenuBackend/src`;
  `VITE_SERVER_ADDRESS` is actually used; the old SettingsPage mobile/desktop split no
  longer exists). This rewrite makes the file match the code.

### 2026-11-16 — Customizable PDF download button (visibility & placement)
- **Backend**
  - `src/prisma/schema.prisma`: added enum `pdfDownloadPlacementN` (`bottom_right`,
    `bottom_left`, `top_right`, `top_left`) and `Restaurant` fields `showPdfDownload`
    (default `true`) and `pdfDownloadPlacement` (default `bottom_right`).
  - Migration: `src/prisma/migrations/20261116120000_pdf_download_settings/migration.sql`
    (currently untracked).
  - `src/controllers/restaurant.controller.ts`: accepts/persists `showPdfDownload`,
    `pdfDownloadPlacement`; Prisma client regenerated.
- **Frontend public**
  - `src/types/index.ts`: added `showPdfDownload` and `pdfDownloadPlacement`.
  - `src/DigitalMenu.tsx`: floating Download PDF button respects visibility and placement.
- **Frontend admin**
  - `src/admin/types/index.ts`: added `showPdfDownload` and `pdfDownloadPlacement`.
  - `src/admin/pages/SettingsPage.tsx` (Display Options): “Show PDF download button”
    toggle and placement selector.
- **Why:** let each restaurant control whether and where the PDF download button appears.

### 2026-11-16 — Footer/search bar adaptivity, sticky-bottom layout, QR & PDF downloads
- **Frontend public**
  - `src/component/Footer.tsx`: compact, theme-adaptive footer — `mt-auto`,
    `py-2 px-4 text-xs leading-tight`, top border and text/border from `--body-text` via
    `color-mix`.
  - `src/DigitalMenu.tsx`: search bar icon/input/clear styled from `--body-text`/
    `--surface` via `color-mix`; focus ring uses `--accent-soft-strong`/`--accent`. Layout
    `min-h-screen min-h-dvh flex flex-col` with content in `flex-1` and `<Footer />` last.
    Added client-side PDF download of all categories/items.
  - `src/util/menuPdf.ts`: new `downloadMenuPdf(config, categories)` using jsPDF
    (paginated PDF with restaurant name/tagline, categories, item names/descriptions/
    prices or variants).
  - `src/index.css`: `html, body, #root` min-heights for full-height flex layout.
  - Dependency: added `jspdf`.
- **Frontend admin**
  - `src/admin/pages/SettingsPage.tsx` (Domain): show/hide QR code (qrserver.com image
    for custom domain or `/<restaurantId>` URL) and Download QR action saving a 512×512
    PNG (`<restaurant-name>-qr.png`).
- **Why:** improve readability/adaptivity, keep footer at page end, and let
  admins/customers export menu QR and a full-menu PDF.

### 2026-11-15 — Header alignment fix, photo focal point, name gradient controls
- **Backend**
  - `src/prisma/schema.prisma`: removed enum `headerBackgroundPositionN` and field
    `headerBackgroundPosition`; added `headerBackgroundPositionX` /
    `headerBackgroundPositionY` (Float, default 50), `headerNameGradientFrom` /
    `headerNameGradientTo` (String?) and `headerNameGradientAngle` (Int, default 120).
  - Migration `20261115120000_header_focal_gradient`.
  - `src/controllers/restaurant.controller.ts`: accepts/persists the new focal-point and
    gradient fields; dropped the old enum field. Regenerated Prisma client.
- **Frontend public**
  - `src/component/Header.tsx`: split layout honors `align`; background uses percentage
    focal point X/Y and anchors zoom at that focal point; name gradient takes from/to
    colors + angle.
  - `src/DigitalMenu.tsx`: passes the new focal-point and gradient props.
  - `src/types/index.ts`: updated header config types.
- **Frontend admin**
  - `src/admin/types/index.ts`: updated header types.
  - `src/admin/pages/SettingsPage.tsx`: replaced Photo Position select with Photo Focus
    X/Y sliders and added gradient start/end color pickers + angle slider.
- **Why:** header alignment was ignored in the split layout, the preset background
  position was too coarse, and the name gradient had no adjustable colors/angle.

### 2026-11-15 — Header customization expansion
- **Backend**
  - `src/prisma/schema.prisma`: added enums `logoSizeN`, `headerBackgroundPositionN`,
    `dividerStyleN`, `headerSpacingN`, `headerMaxWidthN`; added `Restaurant` fields
    `headerAccentPanel`, `headerPanelIntensity`, `headerNameGradient`,
    `headerUppercaseTagline`, `headerShimmer`, `headerNameColor`, `headerTaglineColor`,
    `showLogo`, `logoSize`, `headerBackgroundPosition`, `headerBackgroundZoom`,
    `headerDividerStyle`, `headerSpacing`, `headerMaxWidth`.
  - Migration `20261115114128_header_customization`.
  - `src/controllers/restaurant.controller.ts`: accepts/persists the new header fields.
- **Frontend public**
  - `src/types/index.ts`: added the new header config fields.
  - `src/component/Header.tsx`: new logo/photo/divider/spacing/max-width props.
  - `src/DigitalMenu.tsx`: passes the new values into `Header`.
- **Frontend admin**
  - `src/admin/types/index.ts`: added header fields.
  - `src/admin/pages/SettingsPage.tsx`: shared `HeaderStyleSection` exposing header colors,
    logo, accent panel, gradient, tagline case, shimmer, divider, spacing, max width,
    photo focus and zoom.
- **Why:** make the header fully customizable and persist every option.

### 2026-11-06 — Project context file created
- **Files:** `CONTEXT.md` (new, repo root)
- **What:** Documented architecture, stack, API surface, data model, theming, known issues,
  and started this change log.
- **Why:** Provide persistent context across sessions.

### 2026-11-06 — (pre-existing uncommitted work) Header + body text customization
- **Backend**
  - `src/prisma/schema.prisma`: added `Restaurant.BodyTextColor String @default("#ffffff")`.
  - `src/controllers/restaurant.controller.ts`: accepts/persists `BodyTextColor`.
  - Migration `20261022152811_init`.
- **Frontend public**
  - `src/component/Header.tsx`: layout/size styles; `accentPanel`, `panelIntensity`,
    `nameGradient`, `uppercaseTagline`, `shimmer`; sheen/pulse keyframes.
  - `src/component/Item.tsx`: removed `primaryColor` prop; uses `var(--body-text)`; card
    border is full `accentColor`.
  - `src/component/CatgoriesNavs.tsx`: nav text uses `var(--body-text)`.
  - `src/DigitalMenu.tsx`: passes `BodyTextColor` into `useThemeVars`; passes header props;
    category heading uses `var(--body-text)`.
  - `src/util/util.ts`: `useThemeVars` accepts `bodyText` and defines `--body-text`.
  - `src/types/index.ts`: added header flags + `BodyTextColor`.
- **Frontend admin**
  - `src/admin/types/index.ts`: added `bodyTextColor?` and `BodyTextColor?`.
  - `src/admin/pages/SettingsPage.tsx`: added Body Text color field; announcement board
    support.
- **Why:** allow per-restaurant header/body text customization.
