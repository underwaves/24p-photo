-- ==============================================================================
-- seed.sql
-- ตัวอย่างข้อมูล 3 งาน (หมวดละ 1 งาน) พร้อมรูปภาพหมวดละ 12-14 รูป
-- ==============================================================================

DO $$
DECLARE
  v_wedding_id uuid := '11111111-1111-1111-1111-111111111111';
  v_ordination_id uuid := '22222222-2222-2222-2222-222222222222';
  v_events_id uuid := '33333333-3333-3333-3333-333333333333';
  v_cover_wedding uuid := '11111111-aaaa-1111-aaaa-111111111101';
  v_cover_ordination uuid := '22222222-aaaa-2222-aaaa-222222222201';
  v_cover_events uuid := '33333333-aaaa-3333-aaaa-333333333301';
BEGIN

  -- 1. ลบข้อมูลเดิมของ seed test id (ถ้ามี)
  DELETE FROM public.jobs WHERE id IN (v_wedding_id, v_ordination_id, v_events_id);

  -- 2. สร้างงานที่ 1: งานแต่งงาน (Wedding)
  INSERT INTO public.jobs (id, category, title, description, event_date, is_published, cover_photo_id, sort_order)
  VALUES (
    v_wedding_id,
    'wedding',
    'พิธีฉลองมงคลสมรส คุณพลอย & คุณกานต์ (Ploy & Karn Wedding)',
    'บรรยากาศงานวิวาห์แสนอบอุ่นท่ามกลางแสงธรรมชาติตอนเย็น รายล้อมด้วยรอยยิ้มของคนในครอบครัวและเพื่อนสนิท',
    '2024-11-09',
    true,
    v_cover_wedding,
    1
  );

  -- รูปภาพงานแต่งงาน 12 รูป
  INSERT INTO public.photos (id, job_id, storage_path, thumb_path, sort_order, width, height, alt_text) VALUES
  (v_cover_wedding, v_wedding_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', 1, 2000, 1333, 'ภาพถ่ายคู่บ่าวสาวในชุดแต่งงานสไตล์มินิมอล'),
  ('11111111-aaaa-1111-aaaa-111111111102', v_wedding_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', 2, 2000, 1333, 'แหวนแต่งงานวางบนช่อดอกไม้สด'),
  ('11111111-aaaa-1111-aaaa-111111111103', v_wedding_id, 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80', 3, 2000, 1333, 'เจ้าสาวเตรียมตัวก่อนเข้าสู่พิธี'),
  ('11111111-aaaa-1111-aaaa-111111111104', v_wedding_id, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80', 4, 2000, 1333, 'รอยยิ้มระหว่างเดินเข้าสู่ทางเดินพิธี'),
  ('11111111-aaaa-1111-aaaa-111111111105', v_wedding_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80', 5, 2000, 1333, 'บรรยากาศกลางแจ้งริมสวน'),
  ('11111111-aaaa-1111-aaaa-111111111106', v_wedding_id, 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80', 6, 2000, 1333, 'การสัมผัสมือและช่วงเวลาซึ้งใจ'),
  ('11111111-aaaa-1111-aaaa-111111111107', v_wedding_id, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80', 7, 2000, 1333, 'โต๊ะอาหารและไฟประดับโทนอบอุ่น'),
  ('11111111-aaaa-1111-aaaa-111111111108', v_wedding_id, 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80', 8, 2000, 1333, 'ช่วงตัดเค้กและกล่าวคำขอบคุณ'),
  ('11111111-aaaa-1111-aaaa-111111111109', v_wedding_id, 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80', 9, 2000, 1333, 'รายละเอียดการ์ดเชิญและของชำร่วย'),
  ('11111111-aaaa-1111-aaaa-111111111110', v_wedding_id, 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80', 10, 2000, 1333, 'ช่วงเวลาสวมแหวน'),
  ('11111111-aaaa-1111-aaaa-111111111111', v_wedding_id, 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=600&q=80', 11, 2000, 1333, 'เสียงหัวเราะและรอยยิ้มของแขกผู้มีเกียรติ'),
  ('11111111-aaaa-1111-aaaa-111111111112', v_wedding_id, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80', 12, 2000, 1333, 'ภาพถ่ายรวมครอบครัวส่งท้ายค่ำคืน');


  -- 3. สร้างงานที่ 2: งานอุปสมบท (Ordination)
  INSERT INTO public.jobs (id, category, title, description, event_date, is_published, cover_photo_id, sort_order)
  VALUES (
    v_ordination_id,
    'ordination',
    'พิธีอุปสมบท พระธนภัทร (ภทฺรธมฺโม) ณ วัดสุทัศนเทพวราราม',
    'พิธีขลิบผม ปลงผม พิธีทำขวัญนาค และแห่นาครอบพระอุโบสถ เพื่อทดแทนพระคุณบุพการีในบรรยากาศเปี่ยมด้วยศรัทธา',
    '2024-10-20',
    true,
    v_cover_ordination,
    2
  );

  -- รูปภาพงานบวช 11 รูป
  INSERT INTO public.photos (id, job_id, storage_path, thumb_path, sort_order, width, height, alt_text) VALUES
  (v_cover_ordination, v_ordination_id, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', 1, 2000, 1333, 'พิธีปลงผมนาคโดยบิดามารดา'),
  ('22222222-aaaa-2222-aaaa-222222222202', v_ordination_id, 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=600&q=80', 2, 2000, 1333, 'บรรยากาศวัดไทยและความสงบงาม'),
  ('22222222-aaaa-2222-aaaa-222222222203', v_ordination_id, 'https://images.unsplash.com/photo-1561571994-3c61c554181a?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1561571994-3c61c554181a?auto=format&fit=crop&w=600&q=80', 3, 2000, 1333, 'พานพุ่มดอกบัวและเครื่องอัฐบริขาร'),
  ('22222222-aaaa-2222-aaaa-222222222204', v_ordination_id, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80', 4, 2000, 1333, 'การพนมมือไหว้ขอขมาญาติผู้ใหญ่'),
  ('22222222-aaaa-2222-aaaa-222222222205', v_ordination_id, 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80', 5, 2000, 1333, 'ขบวนแห่นาครอบพระอุโบสถ 3 รอบ'),
  ('22222222-aaaa-2222-aaaa-222222222206', v_ordination_id, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', 6, 2000, 1333, 'รอยยิ้มของโยมแม่ขณะถือผ้าไตรจีวร'),
  ('22222222-aaaa-2222-aaaa-222222222207', v_ordination_id, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', 7, 2000, 1333, 'การโปรยทานหน้าพระอุโบสถ'),
  ('22222222-aaaa-2222-aaaa-222222222208', v_ordination_id, 'https://images.unsplash.com/photo-1548625361-195982f1b09b?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1548625361-195982f1b09b?auto=format&fit=crop&w=600&q=80', 8, 2000, 1333, 'พิธีอุปสมบทภายในพระอุโบสถ'),
  ('22222222-aaaa-2222-aaaa-222222222209', v_ordination_id, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 9, 2000, 1333, 'พระภิกษุใหม่รับการกราบอนุโมทนา'),
  ('22222222-aaaa-2222-aaaa-222222222210', v_ordination_id, 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80', 10, 2000, 1333, 'ญาติมิตรถวายภัตตาหารเพลแด่พระสงฆ์'),
  ('22222222-aaaa-2222-aaaa-222222222211', v_ordination_id, 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80', 11, 2000, 1333, 'ภาพถ่ายรวมครอบครัวในวันแห่งความปิติ');


  -- 4. สร้างงานที่ 3: งานอื่นๆ (Events / Concert & Ceremony)
  INSERT INTO public.jobs (id, category, title, description, event_date, is_published, cover_photo_id, sort_order)
  VALUES (
    v_events_id,
    'events',
    'งานแสดงดนตรีและศิลปะร่วมสมัย Rhythm in the Park 2024',
    'เก็บบรรยากาศแสงสี เวทีคอนเสิร์ตกลางแจ้ง และอารมณ์ความสุขของผู้เข้าร่วมงานกว่า 2,000 คนในค่ำคืนวันหยุดสุดสัปดาห์',
    '2024-09-15',
    true,
    v_cover_events,
    3
  );

  -- รูปภาพงานอื่นๆ 11 รูป
  INSERT INTO public.photos (id, job_id, storage_path, thumb_path, sort_order, width, height, alt_text) VALUES
  (v_cover_events, v_events_id, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80', 1, 2000, 1333, 'เวทีคอนเสิร์ตกลางแจ้งพร้อมแสงสีตระการตา'),
  ('33333333-aaaa-3333-aaaa-333333333302', v_events_id, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', 2, 2000, 1333, 'ดีเจและแสงไฟเลเซอร์ยามค่ำคืน'),
  ('33333333-aaaa-3333-aaaa-333333333303', v_events_id, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', 3, 2000, 1333, 'บรรยากาศผู้ร่วมงานและเวทีคอนเสิร์ต'),
  ('33333333-aaaa-3333-aaaa-333333333304', v_events_id, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', 4, 2000, 1333, 'ไฟนีออนและประกายสปาร์คเลอร์'),
  ('33333333-aaaa-3333-aaaa-333333333305', v_events_id, 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=600&q=80', 5, 2000, 1333, 'ศิลปินร้องเพลงกับผู้ชมแถวหน้า'),
  ('33333333-aaaa-3333-aaaa-333333333306', v_events_id, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80', 6, 2000, 1333, 'ค็อกเทลและแก้วแชมเปญในงานสังสรรค์'),
  ('33333333-aaaa-3333-aaaa-333333333307', v_events_id, 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80', 7, 2000, 1333, 'นักกีตาร์โซโล่บนเวที'),
  ('33333333-aaaa-3333-aaaa-333333333308', v_events_id, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', 8, 2000, 1333, 'ไมโครโฟนและแสงสปอตไลท์วินเทจ'),
  ('33333333-aaaa-3333-aaaa-333333333309', v_events_id, 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80', 9, 2000, 1333, 'กลุ่มผู้ชมโยกตามจังหวะดนตรี'),
  ('33333333-aaaa-3333-aaaa-333333333310', v_events_id, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80', 10, 2000, 1333, 'การแสดงพลุไฟปิดท้ายคอนเสิร์ต'),
  ('33333333-aaaa-3333-aaaa-333333333311', v_events_id, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=2000&q=82', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80', 11, 2000, 1333, 'ปาร์ตี้คอนเฟตติและแสงสีสุดอลังการ');

END $$;
