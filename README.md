# CMS E-commerce - Hướng dẫn cài đặt và sử dụng

Dự án CMS E-commerce được xây dựng với Next.js 16, Prisma ORM, SQLite, và JWT authentication.

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt từng bước](#cài-đặt-từng-bước)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Tính năng đã implement](#tính-năng-đã-implement)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Troubleshooting](#troubleshooting)

## 🖥️ Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **npm** hoặc **yarn** hoặc **pnpm**
- **Git**

## 🚀 Cài đặt từng bước

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd cms
```

### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### Bước 3: Tạo file cấu hình môi trường

Tạo file `.env` trong thư mục gốc của dự án:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa file `.env` với các thông tin của bạn (xem phần [Cấu hình môi trường](#cấu-hình-môi-trường)).

### Bước 4: Cấu hình Database

Dự án sử dụng SQLite, bạn cần:

1. **Tạo database và chạy migrations:**

```bash
npx prisma db push
```

Lệnh này sẽ:
- Tạo file database SQLite tại `prisma/dev.db` (nếu chưa có)
- Đồng bộ schema từ `prisma/schema.prisma` với database
- Tạo các bảng cần thiết

2. **Generate Prisma Client:**

```bash
npx prisma generate
```

Lệnh này sẽ tạo Prisma Client tại `lib/generated/prisma/`.

### Bước 5: Seed dữ liệu mẫu (Tùy chọn)

Nếu muốn có dữ liệu mẫu để test:

```bash
npm run seed
```

Lệnh này sẽ tạo:
- Categories (Danh mục)
- Brands (Thương hiệu)
- Products (Sản phẩm)
- Banners (Banner quảng cáo)
- Articles (Bài viết)

### Bước 6: Tạo tài khoản Admin

Tạo tài khoản admin để truy cập CMS:

```bash
npx tsx scripts/create-admin.ts
```

Tài khoản admin mặc định:
- **Email**: `admin@admin.com`
- **Password**: `password`

> ⚠️ **Lưu ý**: Đổi mật khẩu ngay sau khi deploy lên production!

### Bước 7: Tạo thư mục uploads

Tạo thư mục để lưu file upload:

```bash
mkdir -p public/uploads/avatars
```

### Bước 8: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

## ⚙️ Cấu hình môi trường

File `.env` cần có các biến sau:

### Database

```env
DATABASE_URL="file:/home/dangkhoa/Data/nextjs/cms/prisma/dev.db"
```

> **Lưu ý**: Thay đổi đường dẫn tuyệt đối phù hợp với máy của bạn.

### JWT Secrets

```env
ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-change-this-in-production"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-change-this-in-production"
```

> ⚠️ **Quan trọng**: Trong production, phải sử dụng các secret key mạnh và bảo mật!

### Email Configuration (Tùy chọn)

Nếu muốn gửi email OTP, cấu hình SMTP:

```env
# Cách 1: Sử dụng tên biến mới (khuyến nghị)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_USERNAME="your-email@gmail.com"
MAIL_PASSWORD="your-app-password"
MAIL_ENCRYPTION="tls"
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="CMS System"

# Cách 2: Sử dụng tên biến cũ (backward compatibility)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_SECURE="false"
MAIL_FROM="your-email@gmail.com"
```

> **Lưu ý**: 
> - Nếu không cấu hình email, hệ thống vẫn hoạt động nhưng sẽ chỉ log email ra console (development mode).
> - Với Gmail, bạn cần tạo "App Password" thay vì sử dụng mật khẩu thường.
> - `MAIL_ENCRYPTION` có thể là `"tls"` (port 587) hoặc `"ssl"` (port 465).

## 🎯 Chạy ứng dụng

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## ✨ Tính năng đã implement

### 1. Authentication & Authorization

- ✅ **Đăng ký tài khoản**: `/register`
  - Form đăng ký với validation
  - Nút hiển thị/ẩn mật khẩu
  - Gửi OTP qua email để xác minh

- ✅ **Xác minh email**: `/verify-email`
  - Nhập OTP để xác minh email
  - Tự động redirect về trang mua hàng sau khi xác minh thành công

- ✅ **Đăng nhập**: `/login`
  - JWT authentication với access token và refresh token
  - Remember me
  - Redirect dựa trên role:
    - ADMIN → `/cms`
    - USER → `/` (trang mua hàng)

- ✅ **Đăng xuất**: `/api/auth/logout`
  - Xóa cookies và refresh token

- ✅ **Proxy bảo vệ routes**:
  - Chặn truy cập `/account` và `/cms` nếu chưa đăng nhập
  - Chỉ ADMIN mới truy cập được `/cms`
  - Redirect về trang ban đầu sau khi đăng nhập

### 2. User Account Management

- ✅ **Trang tài khoản**: `/account`
  - Hiển thị thông tin cá nhân (avatar, email, tên, SĐT, giới tính)
  - Hiển thị thông tin tài khoản (role, trạng thái, ngày tạo)
  - Thay đổi avatar:
    - Upload file ảnh (lưu trên server)
    - Nhập URL avatar
    - Preview trước khi lưu
  - Navigation menu để quay lại trang mua hàng

### 3. File Upload

- ✅ **API Upload**: `/api/upload`
  - Upload file ảnh lên server
  - Lưu vào `public/uploads/avatars/`
  - Validate: chỉ nhận hình ảnh, tối đa 5MB
  - Yêu cầu authentication

### 4. Database Models

- ✅ User (với roles: USER, ADMIN, EDITOR)
- ✅ Category (hierarchical)
- ✅ Brand
- ✅ Product (với variants và images)
- ✅ Order & OrderItem
- ✅ Banner
- ✅ Article
- ✅ OTP (cho email verification và reset password)
- ✅ RefreshToken

### 5. UI Components

Sử dụng `shadcn/ui`:
- Card, Button, Input, Label
- Avatar, Badge
- Navigation Menu
- Responsive design với Tailwind CSS

## 📁 Cấu trúc thư mục

```
cms/
├── app/                      # Next.js App Router
│   ├── account/              # Trang tài khoản
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication APIs
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   ├── update-avatar/
│   │   │   └── verify-email/
│   │   ├── upload/          # Upload file API
│   │   ├── products/        # Product APIs
│   │   ├── categories/      # Category APIs
│   │   └── ...
│   ├── cms/                 # CMS Dashboard (chỉ ADMIN)
│   ├── login/               # Trang đăng nhập
│   ├── register/            # Trang đăng ký
│   ├── verify-email/        # Trang xác minh email
│   └── ...
├── components/              # React Components
│   ├── ui/                 # shadcn/ui components
│   ├── store/              # Store components
│   └── cms/                # CMS components
├── lib/                     # Utilities
│   ├── generated/prisma/   # Prisma Client (auto-generated)
│   ├── jwt.ts              # JWT utilities
│   ├── mailer.ts           # Email utilities
│   ├── prisma.ts           # Prisma client instance
│   └── ...
├── prisma/                  # Prisma configuration
│   ├── schema.prisma       # Database schema
│   ├── dev.db              # SQLite database file
│   └── seed.ts             # Seed data script
├── public/                  # Static files
│   └── uploads/            # Uploaded files
│       └── avatars/        # User avatars
├── scripts/                 # Utility scripts
│   └── create-admin.ts    # Script tạo admin
├── proxy.ts                # Next.js proxy (auth)
├── .env                    # Environment variables (không commit)
└── package.json
```

## 🔧 Troubleshooting

### Lỗi: "Cannot find module '@/lib/jwt'"

**Nguyên nhân**: Proxy không hỗ trợ alias imports.

**Giải pháp**: Đã fix trong code, proxy sử dụng direct import `jsonwebtoken`.

### Lỗi: "The table main.User does not exist"

**Nguyên nhân**: Database chưa được tạo hoặc schema chưa được sync.

**Giải pháp**:
```bash
npx prisma db push
npx prisma generate
```

### Lỗi: "Port 3000 is in use"

**Nguyên nhân**: Port 3000 đang được sử dụng bởi process khác.

**Giải pháp**:
```bash
# Tìm và kill process
lsof -ti:3000 | xargs kill -9

# Hoặc xóa lock file
rm -rf .next/dev/lock
```

### Lỗi: "Environment variable not found: DATABASE_URL"

**Nguyên nhân**: File `.env` chưa được tạo hoặc thiếu biến.

**Giải pháp**: Tạo file `.env` và thêm `DATABASE_URL` (xem phần [Cấu hình môi trường](#cấu-hình-môi-trường)).

### Email không gửi được

**Nguyên nhân**: Chưa cấu hình SMTP hoặc thông tin SMTP sai.

**Giải pháp**:
1. Kiểm tra lại thông tin SMTP trong `.env`
2. Với Gmail, sử dụng "App Password" thay vì mật khẩu thường
3. Trong development, nếu không cấu hình SMTP, email sẽ chỉ log ra console

### Avatar không hiển thị sau khi upload

**Nguyên nhân**: File không được lưu đúng hoặc URL không đúng.

**Giải pháp**:
1. Kiểm tra thư mục `public/uploads/avatars/` có tồn tại không
2. Kiểm tra quyền ghi file
3. Kiểm tra URL trong database có đúng format `/uploads/avatars/...` không

### Không thể đăng nhập với tài khoản mới đăng ký

**Nguyên nhân**: Email chưa được xác minh.

**Giải pháp**: 
1. Vào `/verify-email` để xác minh email
2. Hoặc với admin account, `emailVerifiedAt` đã được set sẵn nên có thể đăng nhập ngay

## 📝 Scripts hữu ích

```bash
# Development
npm run dev

# Build production
npm run build
npm start

# Database
npx prisma db push          # Sync schema với database
npx prisma generate          # Generate Prisma Client
npx prisma studio            # Mở Prisma Studio (GUI để xem DB)

# Seed data
npm run seed

# Create admin
npx tsx scripts/create-admin.ts

# Lint
npm run lint
```

## 🔐 Security Notes

1. **JWT Secrets**: Luôn sử dụng secret key mạnh trong production
2. **Database**: SQLite phù hợp cho development, nên dùng PostgreSQL/MySQL trong production
3. **File Upload**: Đã validate file type và size, nhưng nên thêm virus scanning trong production
4. **HTTPS**: Luôn sử dụng HTTPS trong production
5. **Environment Variables**: Không commit file `.env` lên Git

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

[Thêm license của bạn ở đây]

---

**Chúc bạn code vui vẻ! 🚀**
