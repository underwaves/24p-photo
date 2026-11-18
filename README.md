# 📸 24p PHOTO - เว็บไซต์แกลเลอรี่ภาพถ่ายสำหรับช่างภาพมืออาชีพ

เว็บไซต์แกลเลอรี่ภาพถ่ายสำหรับช่างภาพอิสระและสตูดิโอ **24p PHOTO** (ภาษาไทยทั้งระบบ) ออกแบบสไตล์โมเดิร์นคลาสสิก โดยเน้นภาพถ่ายเป็นพระเอก รองรับทั้งโหมดมืด (Dark Mode) และโหมดสว่าง (Light Mode) 

ขับเคลื่อนด้วย **Cloudflare Workers**, **Cloudflare D1 Database** และ **Cloudflare R2 Object Storage** 100% พร้อมระบบหลังบ้าน (Admin Dashboard) สำหรับจัดการอัลบั้มงาน, อัปโหลดรูปภาพ 10-20 รูปต่ออัลบั้มพร้อมการย่อภาพอัตโนมัติฝั่ง Client

🔗 **เว็บไซต์จริงที่รันอยู่บน Cloudflare Workers:**  
👉 [https://24p-photo.wo-nad.workers.dev](https://24p-photo.wo-nad.workers.dev)

---

## 🌟 ฟีเจอร์เด่นของระบบ

### 🖥️ หน้าบ้าน (Client Showcase)
- **Hero Slider เต็มจอ:** สลับภาพอัตโนมัติทุก 5 วินาที แสดงชื่อช่างภาพตัวใหญ่ด้วยฟอนต์ Prompt (น้ำหนักเบา 200-300 ดูหรูหรา), คำโปรย, สรุปจำนวนงานและรูปภาพ, และปุ่มติดต่อจ้างงาน
- **Text Ticker:** แถบตัวหนังสือวิ่งต่อเนื่อง (งานแต่งงาน / งานบวช / งานอื่นๆ) สไตล์ Editorial
- **Bento Category Grid:** การ์ดเลือกหมวดหมู่แบบ Bento Grid (งานแต่งงานเป็นการ์ดใหญ่, งานบวชและงานอื่นๆ เป็นการ์ดเล็ก) พร้อมดึงภาพปกของงานล่าสุดมาแสดงอัตโนมัติ
- **Recent Works Strip:** แถบแสดงผลงานล่าสุดเลื่อนแนวนอนแบบ Scroll-Snap ใช้งานลื่นไหลบนมือถือ
- **หน้าผลงานรวม (`/portfolio`):** รวมผลงานทุกหมวดไว้ในหน้าเดียว พร้อมแท็บกรองแยกหมวดหมู่ (ทั้งหมด / งานแต่งงาน / งานบวช / งานอื่นๆ) และสวิตช์เปิด-ปิดโหมดภาพขาวดำ (B&W) สไตล์ Fine-Art
- **ดีไซน์ขาว-ดำ (Black & White Minimalist Luxury):** โทนสีขาวดำคอนทราสต์สูง เรียบหรู สะอาดตา รองรับ Dark / Light Mode โดยเน้นผลงานภาพถ่ายเป็นพระเอก
- **Lightbox ภาพเต็มจอ:** คมชัดระดับ Hi-Res, รองรับปุ่มคีย์บอร์ด (←, →, Esc), ปัดนิ้วซ้าย-ขวาบนมือถือ (Touch Gesture), แสดงตัวนับลำดับภาพ `n / total` และแถบรูปขนาดย่อ
- **รองรับ Safe-Area:** ออกแบบรองรับขอบจอ Notch และ Home Indicator ของ iPhone ทั้งหมด
- **Typography ป้องกันข้อความตัดบรรทัดผิด:** ใช้ `whitespace-nowrap` สำหรับเมนูนำทางและปุ่มหลัก ป้องกันคำภาษาไทยตกบรรทัด

### ⚙️ หลังบ้าน (Admin Back-Office)
- **ระบบความปลอดภัย (Admin Authentication):** ป้องกันทุกหน้า `/admin` ด้วย Route Guard และ Server-Side JWT Verification
  - เข้าใช้งานที่: `/admin` หรือ `/admin/login`
  - อีเมลแอดมิน: `admin@24pphoto.com`
  - รหัสผ่าน: `Admin@24pPhoto!` (หรือ `admin123456`)
- **ระบบย่อภาพอัตโนมัติฝั่ง Client ก่อนอัปโหลด:**
  - ย่อภาพหลัก: ปรับด้านที่ยาวที่สุดไม่เกิน 2,000px คุณภาพ WebP/JPEG ~82% (ลดขนาดไฟล์จาก 15MB เหลือเพียง ~300KB-800KB โดยภาพยังคมชัดสูง)
  - สร้าง Thumbnail: ขนาดไม่เกิน 600px เพื่อให้โหลดกริดหน้าเว็บได้รวดเร็วทันใจ
- **จัดการอัลบั้มงาน:** เพิ่ม/แก้ไข/ลบงาน, กำหนดวันที่จัดงาน, สลับสถานะเผยแพร่ (Public) หรือซ่อนเป็นแบบร่าง (Draft)
- **จัดการรูปภาพในอัลบั้ม:**
  - เลือกหลายไฟล์พร้อมกันหรือลากวาง (Drag & Drop)
  - กำหนด 1-20 รูปต่อ 1 งาน (มีระบบแจ้งเตือนสีส้มหากมีน้อยกว่า 10 รูป และบล็อกไม่ให้เกิน 20 รูป)
  - แสดงแถบ Progress Bar ระหว่างอัปโหลด
  - จัดเรียงลำดับภาพ (เลื่อนขึ้น/ลง)
  - กำหนดรูปปกของงาน (Cover Photo)
  - ลบรูปภาพพร้อมระบบยืนยัน (Confirmation Modal)
- **ตั้งค่าเว็บไซต์:** แก้ไขชื่อช่างภาพ, คำโปรย (Tagline), คำแนะนำตัว (Bio), เบอร์โทร, LINE, Facebook, IG, Email, และภาพสไลด์ Hero

---

## 🛠️ โครงสร้างเทคโนโลยี (Architecture)

- **Frontend:** Vite, React 19, TypeScript, React Router 7, Tailwind CSS v3
- **Edge Compute:** Cloudflare Workers (`worker/index.ts`)
- **Database:** Cloudflare D1 (`24p-photo-db` SQLite at the Edge)
- **File Storage:** Cloudflare R2 (`24p-photo-bucket` S3-Compatible Object Storage)
- **Deployment:** Cloudflare Workers Static Assets + Serverless Worker API

---

## 🚀 วิธีการรันในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Dev Server
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ `http://localhost:5173` (ระบบมี Vite Proxy ส่งคำขอ `/api/*` ไปยัง Cloudflare Worker จริงทันที)

---

## ☁️ การจัดการ Cloudflare D1 และ R2

### 1. โครงสร้างฐานข้อมูล D1
ฐานข้อมูลถูกสร้างขึ้นใน Cloudflare D1 ด้วยคำสั่ง:
```bash
npx wrangler d1 execute 24p-photo-db --remote --file=./schema.sql -y
```

### 2. นำเข้าข้อมูลตัวอย่าง (Seed Data)
```bash
npx wrangler d1 execute 24p-photo-db --remote --file=./seed_d1.sql -y
```

### 3. Deploy ขึ้น Cloudflare Workers
```bash
npm run deploy
```
หรือ
```bash
npm run build && npx wrangler deploy
```

---

## 🔐 ข้อมูลเข้าสู่ระบบหลังบ้าน (Admin Credentials)

| ข้อมูล | ค่าเริ่มต้น |
|---|---|
| URL | `https://24p-photo.wo-nad.workers.dev/admin/login` |
| Email | `admin@24pphoto.com` |
| Password | `Admin@24pPhoto!` หรือ `admin123456` |
