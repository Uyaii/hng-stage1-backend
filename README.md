# HNG Stage 1 Backend — Profile Classification API

A REST API that accepts a name, fetches data from three external APIs (Genderize, Agify, Nationalize), classifies the result, stores it in a database, and exposes endpoints to manage the stored profiles.

**Base URL:** `https://uyaiprojects.me`

---

## Endpoints

### 1. Create Profile
**POST** `/api/profiles`

Accepts a name, calls the three external APIs, and stores the result. If the name already exists, returns the existing profile without creating a duplicate.

**Request Body:**
```json
{
  "name": "ella"
}
```

**Success Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

**Duplicate Response (200 OK):**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { ...existing profile... }
}
```

---

### 2. Get Single Profile
**GET** `/api/profiles/:id`

Returns a single profile by its UUID.

**Example:**
```
GET https://uyaiprojects.me/api/profiles/b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

---

### 3. Get All Profiles
**GET** `/api/profiles`

Returns all profiles. Supports optional query parameters for filtering.

**Query Parameters (all optional):**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `gender` | Filter by gender (case-insensitive) | `gender=male` |
| `country_id` | Filter by country code (case-insensitive) | `country_id=NG` |
| `age_group` | Filter by age group (case-insensitive) | `age_group=adult` |

**Example:**
```
GET https://uyaiprojects.me/api/profiles?gender=male&country_id=NG
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "id-2",
      "name": "sarah",
      "gender": "female",
      "age": 28,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

---

### 4. Delete Profile
**DELETE** `/api/profiles/:id`

Deletes a profile by its UUID.

**Example:**
```
DELETE https://uyaiprojects.me/api/profiles/b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12
```

**Success Response:** `204 No Content`

---

## Error Responses

All errors follow this structure:
```json
{
  "status": "error",
  "message": "<error message>"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Missing or empty name |
| 404 | Profile not found |
| 422 | Invalid name type (e.g. numeric) |
| 502 | External API returned an invalid response |
| 500 | Internal server error |

---

## Classification Rules

**Age Group (from Agify):**
| Age Range | Group |
|-----------|-------|
| 0 – 12 | child |
| 13 – 19 | teenager |
| 20 – 59 | adult |
| 60+ | senior |

**Nationality:** The country with the highest probability from the Nationalize API response is used.

---

## Testing the API

You can test the endpoints using any HTTP client such as curl, Postman, or HTTPie.

**Create a profile:**
```bash
curl -X POST https://uyaiprojects.me/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "mary"}'
```

**Get all profiles:**
```bash
curl https://uyaiprojects.me/api/profiles
```

**Get all profiles filtered by gender:**
```bash
curl https://uyaiprojects.me/api/profiles?gender=female
```

**Get a single profile:**
```bash
curl https://uyaiprojects.me/api/profiles/<id>
```

**Delete a profile:**
```bash
curl -X DELETE https://uyaiprojects.me/api/profiles/<id>
```

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (via Supabase)
- **External APIs:** Genderize, Agify, Nationalize
- **ID Generation:** UUID v7

---

## Setup (Local Development)

1. Clone the repository:
```bash
git clone https://github.com/Uyaii/hng-stage1-backend
cd hng-stage1-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`.
# hng-stage2-backend
