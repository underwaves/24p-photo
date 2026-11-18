/**
 * จัดรูปแบบวันที่เป็นภาษาไทย เช่น "9 พฤศจิกายน 2567"
 */
export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.

    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * รวมคลาส Tailwind CSS
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ResizedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * ย่อขนาดรูปภาพฝั่ง client ก่อนอัปโหลด
 * ปรับด้านที่ยาวที่สุดไม่เกิน maxDimension (เช่น 2000px สำหรับรูปเต็ม, 600px สำหรับ thumbnail)
 * คุณภาพการบีบอัด ~82%
 */
export async function resizeImageClient(
  file: File,
  maxDimension: number = 2000,
  quality: number = 0.82
): Promise<ResizedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // คำนวณอัตราส่วนการย่อ
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        // เพิ่มการ render ให้เรียบเนียน
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // เลือกระหว่าง webp หรือ jpeg
        const mimeType = 'image/webp';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // fallback เป็น jpeg
              canvas.toBlob(
                (fallbackBlob) => {
                  if (!fallbackBlob) {
                    reject(new Error('Image conversion failed'));
                    return;
                  }
                  resolve({
                    blob: fallbackBlob,
                    dataUrl: canvas.toDataURL('image/jpeg', quality),
                    width,
                    height,
                  });
                },
                'image/jpeg',
                quality
              );
              return;
            }

            resolve({
              blob,
              dataUrl: canvas.toDataURL(mimeType, quality),
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('ไม่สามารถโหลดภาพเพื่อแปลงขนาดได้'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ภาพได้'));
    reader.readAsDataURL(file);
  });
}
