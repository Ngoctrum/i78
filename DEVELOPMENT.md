# Hướng Dẫn Develop Trên GitHub

## Bước 1: Clone Repository

```bash
git clone <your-github-repo-url>
cd <your-repo-name>
```

## Bước 2: Cài Đặt Dependencies

```bash
npm install
```

## Bước 3: Tạo File .env

Tạo file `.env` ở thư mục root với nội dung sau:

```env
VITE_SUPABASE_PROJECT_ID="mebctcjwshfhyzevdigt"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYmN0Y2p3c2hmaHl6ZXZkaWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTQ5MzYsImV4cCI6MjA3ODg5MDkzNn0.ASXJMrAidob4c-p2GSSPshecSMesxp-LX36KqMRAPvU"
VITE_SUPABASE_URL="https://mebctcjwshfhyzevdigt.supabase.co"
```

⚠️ **LƯU Ý**: File `.env` đã có trong `.gitignore` nên sẽ không bị push lên GitHub (an toàn).

## Bước 4: Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại: `http://localhost:8080`

## Bước 5: Build Cho Production

```bash
npm run build
```

Thư mục `dist` sẽ chứa các file build.

## Deploy Lên GitHub Pages

Khi bạn push code lên nhánh `main`, GitHub Actions sẽ tự động:
1. Build project
2. Deploy lên GitHub Pages

## Cấu Trúc Project

```
├── src/
│   ├── components/       # React components
│   ├── pages/           # Các trang
│   ├── integrations/    # Supabase integration
│   └── ...
├── public/              # Static files
├── .env                 # Environment variables (tạo thủ công)
├── vite.config.ts       # Vite config
└── package.json         # Dependencies
```

## Các Lệnh Quan Trọng

- `npm run dev` - Chạy dev server
- `npm run build` - Build production
- `npm run preview` - Preview build
- `npm run lint` - Check code

## Troubleshooting

### Lỗi: Cannot find module

```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Environment variables not found

Kiểm tra file `.env` đã tạo đúng chưa và có đúng format.

### Lỗi khi build

```bash
npm run build -- --debug
```

## Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. File `.env` đã được tạo
2. Dependencies đã được cài đặt
3. Node version >= 18
