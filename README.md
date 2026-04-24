# Pet.ai — AI Pet Portrait Generator

Generate artistic AI portraits of your pets using fine-tuned image generation models.

Upload photos of your pet, train a personalized AI model, and generate portraits in any style — oil painting, anime, watercolor, studio photography.

---

## Features

- Fine-tuned AI model training per pet via Astria AI
- Multi-style portrait generation
- Payment integration (Iyzico)
- Cloud storage for all generated images (AWS S3)
- JWT authentication with secure sessions

---

## Tech Stack

**Frontend:** React.js, Material-UI, React Dropzone
**Backend:** Node.js, Express.js, PostgreSQL, JWT
**AI:** Astria AI API (fine-tuned Stable Diffusion)
**Infrastructure:** AWS S3, Iyzico Payments

---

## Setup

```bash
git clone https://github.com/kutluhaneniste/Pet.ai-
cd Pet.ai-

# Install all dependencies
npm install
cd client && npm install
cd ../server && npm install
```

Configure `/server/.env`:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL
PGHOST=localhost
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=petai_db
PGPORT=5432

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Astria AI
ASTRIA_API_KEY=your_astria_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket

# Iyzico (payments)
IYZICO_API_KEY=your_key
IYZICO_SECRET_KEY=your_secret
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

```bash
# Run backend
cd server && npm run dev

# Run frontend
cd client && npm start
```

Frontend: http://localhost:3000
Backend: http://localhost:5001

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/images/generate` | Generate portrait |
| GET | `/api/images/status/:jobId` | Check generation status |
| GET | `/api/images/user` | Get user's portraits |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Order details |

---

## License

MIT
