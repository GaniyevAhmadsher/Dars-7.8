# NestJS - Guard va Cookie'lar bilan ishlash amaliy mashqi

## Vazifa maqsadi

## Loyiha talablari

### Funksional talablar

1. **Foydalanuvchi autentifikatsiyasi**:

   - Foydalanuvchilar ro'yxatdan o'tishi va tizimga kirishi mumkin
   - Autentifikatsiya JWT yoki session-based cookie orqali amalga oshirilishi kerak
   - Tizimga kirgan foydalanuvchilar cookie'da saqlanadigan token olishlari kerak

2. **Blog postlari bilan ishlash**:

   - Faqat tizimga kirgan foydalanuvchilar postlar yaratishi mumkin
   - Foydalanuvchilar faqat o'zlari yaratgan postlarni tahrirlashi va o'chirishi mumkin
   - Hamma postlarni ko'rish mumkin (login qilinmagan holatda ham)

3. **Adminlar uchun maxsus imkoniyatlar**:
   - Admin rolili foydalanuvchilar har qanday postni tahrirlashi va o'chirishi mumkin
   - Admin foydalanuvchilar ro'yxatini ko'rishi mumkin

### Texnik talablar

1. NestJS frameworki ishlatilishi kerak
2. Har bir zo'riq api uchun alohida guard'lar yozilishi kerak
3. Autentifikatsiya uchun cookie'lardan foydalanilishi kerak
4. Har xil roldagi foydalanuvchilar uchun RolesGuard ishlatilishi kerak
5. Custom metadataga asoslangan guard'lar bo'lishi kerak
6. Yaxshi xatolik ishlovi amalga oshirilishi kerak

## API endpointlari

Quyidagi API endpointlarini yaratishingiz kerak:

### Authentication

| Metod | Endpoint       | Tavsif                                   | Guard kerak |
| ----- | -------------- | ---------------------------------------- | ----------- |
| POST  | /auth/register | Yangi foydalanuvchi ro'yxatdan o'tkazish | Yo'q        |
| POST  | /auth/login    | Tizimga kirish va cookie o'rnatish       | Yo'q        |
| POST  | /auth/logout   | Tizimdan chiqish va cookie'ni o'chirish  | AuthGuard   |
| GET   | /auth/profile  | Joriy foydalanuvchi ma'lumotlarini olish | AuthGuard   |

### Posts

| Metod  | Endpoint   | Tavsif                         | Guard kerak                      |
| ------ | ---------- | ------------------------------ | -------------------------------- |
| GET    | /posts     | Barcha postlarni olish         | Yo'q                             |
| GET    | /posts/:id | Bitta postni ID bo'yicha olish | Yo'q                             |
| POST   | /posts     | Yangi post yaratish            | AuthGuard                        |
| PUT    | /posts/:id | Postni tahrirlash              | AuthGuard, OwnerGuard/RolesGuard |
| DELETE | /posts/:id | Postni o'chirish               | AuthGuard, OwnerGuard/RolesGuard |

### Admin

| Metod  | Endpoint         | Tavsif                          | Guard kerak           |
| ------ | ---------------- | ------------------------------- | --------------------- |
| GET    | /admin/users     | Barcha foydalanuvchilarni olish | AuthGuard, RolesGuard |
| DELETE | /admin/users/:id | Foydalanuvchini o'chirish       | AuthGuard, RolesGuard |

## Test ma'lumotlari

### Foydalanuvchi ro'yxatdan o'tish

**Request:**

```
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "fullName": "Test User",
  "role": "user",
  "createdAt": "2023-04-10T12:00:00Z"
}
```

### Foydalanuvchi kirishi

**Request:**

```
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "user"
  }
}
```

Set-Cookie headeri orqali JWT yoki session ID jo'natiladi:

```
Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiIsIn...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

### Post yaratish

**Request:**

```
POST /posts
Content-Type: application/json
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsIn...

{
  "title": "My First Post",
  "content": "This is the content of my first post."
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "authorId": 1,
  "author": {
    "id": 1,
    "username": "testuser"
  },
  "createdAt": "2023-04-10T14:30:00Z",
  "updatedAt": "2023-04-10T14:30:00Z"
}
```

### Postni tahrirlash uchun Guard tomonidan bloklangan so'rov

**Request:**

```
PUT /posts/2
Content-Type: application/json
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsIn...  (boshqa foydalanuvchining tokeni)

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response (403 Forbidden):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Adminlik huquqidan foydalanish

**Request:**

```
GET /admin/users
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsIn...  (admin rolili foydalanuvchi tokeni)
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "user",
    "createdAt": "2023-04-10T12:00:00Z"
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin",
    "createdAt": "2023-04-09T10:00:00Z"
  }
]
```

## Guard yaratish uchun yo'nalishlar

### AuthGuard

`AuthGuard` barcha so'rovlar uchun foydalanuvchi autentifikatsiya qilinganini tekshirishi kerak:

1. Cookies headeridan auth_token ni olish
2. Tokenni tekshirish (JWT yoki boshqa usulda)
3. Agar token to'g'ri bo'lsa, foydalanuvchini request obyektiga qo'shish
4. Agar token yaroqsiz bo'lsa, 401 Unauthorized qaytarish

### RolesGuard

`RolesGuard` foydalanuvchi rolini tekshirishi kerak:

1. Decorator orqali ko'rsatilgan ruxsat etilgan rollarni olish
2. Request obyektidan foydalanuvchi ma'lumotlarini olish
3. Foydalanuvchi rolini tekshirish
4. Agar rol mos kelmasa, 403 Forbidden qaytarish

### OwnerGuard

`OwnerGuard` foydalanuvchi o'z resursini (masalan, postni) tahrirlamoqchi yoki o'chirmoqchi ekanligini tekshirishi kerak:

1. Request parametrlaridan resurs ID sini olish
2. Bazadan resursni topish
3. Resurs foydalanuvchiga tegishli ekanligini tekshirish
4. Agar resource boshqa foydalanuvchiga tegishli bo'lsa, 403 Forbidden qaytarish
