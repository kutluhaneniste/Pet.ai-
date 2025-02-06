# Astria AI Pet Portrait Generator

Evcil hayvanlarınız için yapay zeka ile sanatsal portreler oluşturan modern bir web uygulaması.

## Özellikler

- 🐾 Evcil hayvan fotoğraflarından sanatsal portreler oluşturma
- 🎨 Astria AI entegrasyonu
- 💳 Ödeme sistemi (Iyzico)
- 📦 AWS S3 depolama
- 🔐 JWT tabanlı kimlik doğrulama
- 🎯 Modern ve kullanıcı dostu arayüz

## Teknolojiler

### Frontend
- React.js
- Material-UI (MUI)
- React Dropzone

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT

### Servisler
- Astria AI API
- AWS S3
- Iyzico Payment

## Kurulum

1. Repoyu klonlayın:
```bash
git clone [repo-url]
cd modern-fullstack-app
```

2. Gerekli paketleri yükleyin:
```bash
# Root dizininde
npm install

# Client dizininde
cd client
npm install

# Server dizininde
cd ../server
npm install
```

3. `.env` dosyasını oluşturun:
```bash
# /server/.env dosyası
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL
PGHOST=localhost
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=modern_fullstack_db
PGPORT=5432

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Astria AI
ASTRIA_API_KEY=your_astria_api_key
ASTRIA_API_URL=https://api.astria.ai/v1

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Iyzico
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

4. PostgreSQL veritabanını oluşturun:
```sql
CREATE DATABASE modern_fullstack_db;
```

## Çalıştırma

1. Backend'i başlatın:
```bash
cd server
npm run dev
```

2. Frontend'i başlatın:
```bash
cd client
npm start
```

3. Tarayıcıda açın:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## API Endpoints

### Auth
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/profile` - Kullanıcı profili

### Images
- `POST /api/images/generate` - Görsel oluşturma
- `GET /api/images/status/:jobId` - Görsel durumu kontrolü
- `GET /api/images/user` - Kullanıcının görselleri

### Orders
- `POST /api/orders` - Yeni sipariş oluşturma
- `GET /api/orders` - Siparişleri listeleme
- `GET /api/orders/:id` - Sipariş detayı

## Lisans

MIT 