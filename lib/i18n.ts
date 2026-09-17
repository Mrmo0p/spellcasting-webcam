export type Locale = 'en' | 'th';
export const LANGUAGE_KEY = 'spellbound.language.v1';
export const TH: Record<string, string> = {
  'Duel summary': 'สรุปการประลอง',
  'Burn damage dealt': 'ความเสียหายไฟที่สร้าง',
  'Burn damage taken': 'ความเสียหายไฟที่ได้รับ',
  'Your extinguishes': 'ครั้งที่คุณดับไฟ',
  'Opponent extinguishes': 'ครั้งที่คู่ต่อสู้ดับไฟ',
  'Burn damage excludes the initial fire hit.':
    'ความเสียหายไฟนี้ไม่รวมความเสียหายตอนลูกไฟโดนครั้งแรก',

  'Learn Fire → Water': 'เรียนรู้ไฟ → น้ำ',
  'Fire and Water lesson': 'บทเรียนไฟและน้ำ',
  'FIRE → WATER LESSON': 'บทเรียนไฟ → น้ำ',
  '1. Draw Fireball': '1. วาดรูนลูกไฟ',
  '2. Extinguish a practice burn': '2. ฝึกดับไฟบนตัวเอง',
  'Fire and Water mastered': 'เรียนรู้ไฟและน้ำสำเร็จ',
  'Draw a triangle and curl your index finger. In a duel, Fireball ignites your opponent until they cast Water.':
    'วาดสามเหลี่ยมแล้วงอนิ้วชี้ ในการประลอง ลูกไฟทำให้คู่ต่อสู้ติดไฟจนกว่าจะร่ายเวทน้ำ',
  'Imagine you were hit by fire. Draw a rounded U and curl your index finger to cast Water on yourself.':
    'สมมติว่าคุณถูกไฟโจมตี วาดตัว U ที่โค้งมนแล้วงอนิ้วชี้เพื่อร่ายเวทน้ำใส่ตัวเอง',
  'You learned both runes. Fire burns over time; Water extinguishes without healing.':
    'คุณเรียนรู้รูนทั้งสองแล้ว ไฟสร้างความเสียหายต่อเนื่อง ส่วนน้ำดับไฟโดยไม่ฟื้นฟูพลังชีวิต',
  'No health is lost here. These attempts do not affect practice scores or study results.':
    'บทเรียนนี้ไม่เสียพลังชีวิต และไม่กระทบคะแนนฝึกหรือผลทดสอบ',
  'Fireball recognized. Fire causes a lasting burn. Now practice Water on yourself.':
    'ตรวจพบลูกไฟ ไฟจะเผาต่อเนื่อง ต่อไปฝึกร่ายเวทน้ำใส่ตัวเอง',
  'Water recognized. Practice burn extinguished — lesson complete!':
    'ตรวจพบเวทน้ำ ดับไฟในการฝึกแล้ว — จบบทเรียน!',
  'For this step, draw a triangle for Fireball.':
    'ขั้นตอนนี้ ให้วาดสามเหลี่ยมเพื่อร่ายลูกไฟ',
  'For this step, draw a rounded U for Water.':
    'ขั้นตอนนี้ ให้วาดตัว U ที่โค้งมนเพื่อร่ายเวทน้ำ',
  'YOU ARE BURNING': 'คุณกำลังติดไฟ',
  'Draw a rounded U → cast Water on yourself.':
    'วาดตัว U โค้งมน → ร่ายเวทน้ำใส่ตัวเอง',
  'Water stops the burn. Mend only restores health.':
    'น้ำช่วยดับไฟ ส่วนเวทฟื้นฟูเพิ่มพลังชีวิตเท่านั้น',

  Water: 'น้ำ',
  'U shape': 'รูปตัว U',
  'Extinguish your burn': 'ดับไฟที่กำลังเผาคุณ',
  'Deal 8 damage and ignite a lasting burn':
    'สร้างความเสียหาย 8 และทำให้ติดไฟจนกว่าจะดับ',
  'Draw down, round the bottom, then go up to make a wide U. Keep the top open and the bottom curved.':
    'วาดลงมา โค้งที่ด้านล่างแล้วลากขึ้นเป็นตัว U กว้าง ๆ เว้นด้านบนให้เปิดและด้านล่างให้โค้ง',
  'Water recognized, but you are not burning. Save it to extinguish fire on yourself.':
    'ตรวจพบเวทน้ำ แต่คุณไม่ได้ติดไฟ เก็บไว้ใช้ดับไฟบนตัวคุณ',
  'Not burning': 'ไม่ได้ติดไฟ',
  'Fireball ignites the Archivist. Burn deals 4 damage each second.':
    'ลูกไฟทำให้ผู้พิทักษ์ติดไฟ เสียพลังชีวิต 4 ทุกวินาที',
  'Water cast on yourself. Burn extinguished.': 'ร่ายเวทน้ำใส่ตัวเอง ดับไฟแล้ว',
  'The Archivist casts Water on itself. Burn extinguished.':
    'ผู้พิทักษ์ร่ายเวทน้ำใส่ตัวเอง ดับไฟแล้ว',
  'The Archivist takes 4 burn damage.': 'ผู้พิทักษ์เสียพลังชีวิต 4 จากไฟเผา',
  'You take 4 burn damage. Cast Water on yourself.':
    'คุณเสียพลังชีวิต 4 จากไฟเผา ร่ายเวทน้ำใส่ตัวเอง',
  'Ember volley hit for 18. You are burning — cast Water on yourself.':
    'ห่าลูกไฟสร้างความเสียหาย 18 คุณติดไฟ — ร่ายเวทน้ำใส่ตัวเอง',
  'CASTING WATER ON ITSELF': 'กำลังร่ายเวทน้ำใส่ตัวเอง',
  'The Archivist is extinguishing its burn': 'ผู้พิทักษ์กำลังดับไฟบนตัวเอง',
  'You are burning: −4 health / second. Draw a U for Water.':
    'คุณติดไฟ: เสียพลังชีวิต 4 ต่อวินาที วาดตัว U เพื่อร่ายเวทน้ำ',
  'You: not burning': 'คุณ: ไม่ได้ติดไฟ',
  'Opponent burning: −4 health / second': 'คู่ต่อสู้ติดไฟ: เสียพลังชีวิต 4 ต่อวินาที',
  'Opponent: not burning': 'คู่ต่อสู้: ไม่ได้ติดไฟ',
  '100 health. Seven spells. Keep your hand in view.':
    'พลังชีวิต 100 เวทเจ็ดแบบ ให้กล้องเห็นมืออยู่เสมอ',
  'SEVEN RUNES. ONE HAND.': 'รูนเจ็ดแบบ มือข้างเดียว',
  'You are ready to explore the other six runes or enter a duel.':
    'คุณพร้อมฝึกรูนอีกหกแบบหรือเข้าสู่สนามประลองแล้ว',
  '14 practice strokes · 70 measured strokes · 2 duels':
    'ฝึก 14 ครั้ง · ทดสอบ 70 ครั้ง · ประลอง 2 รอบ',
  'GAME UPDATED': 'อัปเดตเกมแล้ว',
  'Start fresh with the new spellbook.': 'เริ่มใหม่ด้วยคัมภีร์เวทฉบับใหม่',
  Training: 'ฝึกต่อสู้',
  'Master every spell.': 'ฝึกฝนเวททุกชนิด',
  'Choose a drill, then draw the matching rune.': 'เลือกแบบฝึก แล้ววาดรูนที่เหมาะสม',
  'TRAINING SANCTUM': 'ห้องฝึกเวท',
  'SAFE SANDBOX · NO SCORES SAVED': 'สนามฝึกปลอดภัย · ไม่บันทึกคะแนน',
  'Training dummy': 'หุ่นฝึกเวท',
  'Free-cast every rune or choose a drill for Ward, Frost, Dispel, Mend, and Water. Nothing is saved.':
    'ร่ายรูนใดก็ได้ หรือเลือกฝึกเกราะเวท น้ำแข็ง สลายเวท ฟื้นฟู และน้ำ โดยจะไม่บันทึกผล',
  'ALL RUNES AVAILABLE · RESULTS ARE NOT SAVED': 'ใช้รูนได้ทุกชนิด · ไม่บันทึกผลการฝึก',
  'TRAINING DUMMY': 'หุ่นฝึกเวท',
  'Training dummy health': 'พลังชีวิตหุ่นฝึก',
  'INCOMING TRAINING ATTACK': 'การโจมตีฝึกกำลังมา',
  'DUMMY STUNNED': 'หุ่นฝึกมึนงง',
  'FREE CASTING': 'ร่ายเวทอิสระ',
  'Star stun active': 'ดาวกำลังทำให้มึนงง',
  'Draw any rune': 'วาดรูนใดก็ได้',
  'You are burning — draw Water.': 'คุณกำลังติดไฟ — วาดรูนน้ำ',
  'You: safe': 'คุณ: ปลอดภัย',
  'Dummy burning': 'หุ่นฝึกกำลังติดไฟ',
  'Dummy: ready': 'หุ่นฝึก: พร้อม',
  'Training drills': 'แบบฝึกเวท',
  'Ward drill': 'ฝึกเกราะเวท',
  'Dispel drill': 'ฝึกสลายเวท',
  'Frost drill': 'ฝึกน้ำแข็ง',
  'Mend drill': 'ฝึกฟื้นฟู',
  'Water drill': 'ฝึกน้ำ',
  'Enable camera to cast': 'เปิดกล้องเพื่อร่ายเวท',
  'Disable cooldowns': 'ปิดคูลดาวน์',
  'Enable cooldowns': 'เปิดคูลดาวน์',
  'No cooldown': 'ไม่มีคูลดาวน์',
  'Training cooldowns enabled.': 'เปิดคูลดาวน์ในห้องฝึกแล้ว',
  'Training cooldowns disabled — cast freely.':
    'ปิดคูลดาวน์ในห้องฝึกแล้ว — ร่ายเวทได้อย่างอิสระ',
  Reset: 'เริ่มใหม่',
  'Choose a drill or draw any rune.': 'เลือกแบบฝึกหรือวาดรูนใดก็ได้',
  'Ward absorbed the training attack.': 'เกราะเวทป้องกันการโจมตีฝึกแล้ว',
  'Dummy defeated — target restored to full health.':
    'เอาชนะหุ่นฝึกแล้ว — ฟื้นพลังเป้าหมายเต็ม',
  'Training damage applied — draw Mend.': 'ได้รับความเสียหายฝึก — วาดรูนฟื้นฟู',
  'Training burn applied — draw Water.': 'ติดไฟฝึก — วาดรูนน้ำ',
  'You take 4 training burn damage. Draw Water.':
    'คุณเสียพลังชีวิต 4 จากไฟฝึก วาดรูนน้ำ',
  'The dummy takes 4 burn damage.': 'หุ่นฝึกเสียพลังชีวิต 4 จากไฟเผา',
  'Ward prepared. It will block the next training attack.':
    'เตรียมเกราะเวทแล้ว จะป้องกันการโจมตีฝึกครั้งถัดไป',
  'Fireball hit for 8 and ignited the dummy.':
    'ลูกไฟสร้างความเสียหาย 8 และทำให้หุ่นฝึกติดไฟ',
  'Lightning hit the dummy for 16.': 'สายฟ้าสร้างความเสียหาย 16 แก่หุ่นฝึก',
  'Frost delayed the training attack by 3 seconds.':
    'น้ำแข็งทำให้การโจมตีฝึกช้าลง 3 วินาที',
  'Dispel cancelled the training attack.': 'สลายเวทยกเลิกการโจมตีฝึกแล้ว',
  'Mend restored up to 22 health.': 'ฟื้นฟูพลังชีวิตสูงสุด 22',
  'Water extinguished your training burn.': 'น้ำดับไฟฝึกของคุณแล้ว',
  'Star stunned the dummy for 3 seconds.': 'ดาวทำให้หุ่นฝึกมึนงง 3 วินาที',
  PvP: 'ผู้เล่นปะทะผู้เล่น',
  'Challenge another spellcaster.': 'ท้าประลองกับจอมเวทคนอื่น',
  'Create a private room and duel in real time.':
    'สร้างห้องส่วนตัวแล้วประลองแบบเรียลไทม์',
  'PLAYER VS PLAYER': 'ผู้เล่นปะทะผู้เล่น',
  LOBBY: 'ห้องรอ',
  WAITING: 'กำลังรอ',
  COUNTDOWN: 'นับถอยหลัง',
  ACTIVE: 'กำลังประลอง',
  PAUSED: 'หยุดชั่วคราว',
  FINISHED: 'จบแล้ว',
  'PRIVATE ONLINE DUEL': 'การประลองออนไลน์ส่วนตัว',
  'Use a guest name, then create a room or join with a six-character code.':
    'ใช้ชื่อชั่วคราว จากนั้นสร้างห้องหรือเข้าร่วมด้วยรหัสหกตัว',
  'Guest name': 'ชื่อผู้เล่น',
  'Your name': 'ชื่อของคุณ',
  'Room code': 'รหัสห้อง',
  'Create room': 'สร้างห้อง',
  'Join room': 'เข้าร่วมห้อง',
  'Only spell events are shared. Camera frames and hand paths stay on each device.':
    'แชร์เฉพาะเหตุการณ์ร่ายเวท ภาพจากกล้องและเส้นทางมือยังอยู่บนอุปกรณ์ของแต่ละคน',
  'Camera frames and hand landmarks stay on your device. During an active duel, normalized rune coordinates are shared temporarily with your opponent.':
    'ภาพจากกล้องและจุดข้อต่อมืออยู่บนอุปกรณ์ของคุณ ระหว่างการประลอง ระบบจะแชร์เฉพาะพิกัดรูนแบบปรับสัดส่วนกับคู่ต่อสู้ชั่วคราว',
  'Connecting to the duel…': 'กำลังเชื่อมต่อการประลอง…',
  'Opening a secure match connection.': 'กำลังเปิดการเชื่อมต่อการแข่งขัน',
  'Leave room': 'ออกจากห้อง',
  'Waiting for an opponent…': 'กำลังรอคู่ต่อสู้…',
  'Both spellcasters are here.': 'จอมเวททั้งสองพร้อมแล้ว',
  'Copy invite': 'คัดลอกคำเชิญ',
  'Not ready': 'ยังไม่พร้อม',
  'Ready — waiting': 'พร้อม — กำลังรอ',
  'Ready to duel': 'พร้อมประลอง',
  'Show your hand to ready': 'แสดงมือให้กล้องเห็นเพื่อเตรียมพร้อม',
  Leave: 'ออก',
  'Invite link copied.': 'คัดลอกลิงก์คำเชิญแล้ว',
  'DUEL BEGINS IN': 'การประลองจะเริ่มใน',
  'Curl your index finger to prepare.': 'งอนิ้วชี้เพื่อเตรียมพร้อม',
  'CONNECTION PAUSED': 'หยุดชั่วคราวเนื่องจากการเชื่อมต่อ',
  'Waiting for a spellcaster to reconnect.': 'กำลังรอจอมเวทเชื่อมต่ออีกครั้ง',
  'Leave match': 'ออกจากการแข่งขัน',
  'PVP DUEL COMPLETE': 'จบการประลอง PVP',
  'The duel is a draw.': 'การประลองเสมอกัน',
  'Victory is yours.': 'คุณชนะการประลอง',
  'Both players must request a rematch.': 'ผู้เล่นทั้งสองต้องขอแข่งใหม่',
  'Rematch requested. Waiting for your opponent.': 'ขอแข่งใหม่แล้ว กำลังรอคู่ต่อสู้',
  'Request rematch': 'ขอแข่งใหม่',
  'Rematch requested': 'ขอแข่งใหม่แล้ว',
  'Your health': 'พลังชีวิตของคุณ',
  'You are burning — cast Water.': 'คุณกำลังติดไฟ — ร่ายเวทน้ำ',
  'Opponent is burning': 'คู่ต่อสู้กำลังติดไฟ',
  'INCOMING SPELL': 'เวทกำลังพุ่งมา',
  'Cast Ward, Frost, or Dispel.': 'ร่ายเกราะเวท น้ำแข็ง หรือสลายเวท',
  'REAL-TIME DUEL': 'การประลองเรียลไทม์',
  'Draw a rune to cast.': 'วาดรูนเพื่อร่ายเวท',
  'Attacks give your opponent four seconds to counter.':
    'การโจมตีให้เวลาคู่ต่อสู้สี่วินาทีเพื่อโต้กลับ',
  'PvP spell cooldowns': 'คูลดาวน์เวท PvP',
  'Your wand is recovering. Try again in a moment.':
    'ไม้กายสิทธิ์กำลังฟื้นตัว ลองอีกครั้งในอีกสักครู่',
  'Camera is off. The duel continues.': 'กล้องปิดอยู่ แต่การประลองยังดำเนินต่อ',
  'PvP spellcasting': 'การร่ายเวท PvP',
  'Your camera stays local. Only accepted rune events are sent to the match server.':
    'กล้องของคุณทำงานในอุปกรณ์เท่านั้น ส่งไปยังเซิร์ฟเวอร์เฉพาะเหตุการณ์รูนที่ยอมรับแล้ว',
  'Your camera stays local. Active PvP shares normalized rune coordinates, never frames or landmarks.':
    'กล้องของคุณทำงานในอุปกรณ์เท่านั้น PvP จะแชร์พิกัดรูนแบบปรับสัดส่วน แต่ไม่แชร์ภาพหรือจุดข้อต่อมือ',
  match: 'การแข่งขัน',
  runes: 'รูน',
  'The spell could not be sent. Check your connection.':
    'ส่งเวทไม่ได้ โปรดตรวจสอบการเชื่อมต่อ',
  'PvP service is not configured for this deployment.':
    'ยังไม่ได้ตั้งค่าบริการ PvP สำหรับการติดตั้งนี้',
  'The PvP connection was interrupted. Reconnecting…':
    'การเชื่อมต่อ PvP ขาดหาย กำลังเชื่อมต่อใหม่…',
  'Not connected to the match service yet.': 'ยังไม่ได้เชื่อมต่อบริการการแข่งขัน',
  'That room already has two players.': 'ห้องนี้มีผู้เล่นครบสองคนแล้ว',
  'Room not found. Check the code and try again.':
    'ไม่พบห้อง โปรดตรวจสอบรหัสแล้วลองใหม่',
  'Enter a name between 1 and 24 characters.': 'กรอกชื่อความยาว 1 ถึง 24 ตัวอักษร',
  'Could not open that room.': 'เปิดห้องนั้นไม่ได้',
  idle: 'ว่าง',
  connecting: 'กำลังเชื่อมต่อ',
  open: 'เชื่อมต่อแล้ว',
  reconnecting: 'กำลังเชื่อมต่อใหม่',
  closed: 'ปิดแล้ว',
  error: 'ผิดพลาด',

  Practice: 'ฝึกวาด',
  Duel: 'ประลอง',
  Study: 'ทดสอบ',
  'Game modes': 'โหมดเกม',
  Language: 'ภาษา',
  'THE WEBCAM GRIMOIRE': 'คัมภีร์เวทผ่านกล้อง',
  'YOUR HAND IS THE WAND': 'มือของคุณคือไม้กายสิทธิ์',
  'Make your first mark.': 'เริ่มวาดรูนแรกของคุณ',
  'Point to draw. Curl your index finger to cast.': 'ชี้นิ้วเพื่อวาด งอนิ้วชี้เพื่อร่ายเวท',
  'Enter the circle.': 'ก้าวเข้าสู่สนามประลอง',
  'Read the attack. Draw your answer.': 'ดูท่าโจมตี แล้ววาดรูนโต้กลับ',
  'Put the magic to the test.': 'ทดสอบพลังเวทของคุณ',
  'Guided rune trials and two duel conditions.':
    'ทดสอบการวาดรูนและประลองสองรูปแบบ',
  'CAMERA CONNECTED': 'เชื่อมต่อกล้องแล้ว',
  'LOCAL SESSION': 'เล่นบนอุปกรณ์นี้',
  'Mute sounds': 'ปิดเสียง',
  'Enable sounds': 'เปิดเสียง',
  'Camera settings': 'ตั้งค่ากล้อง',
  'Camera setup': 'ตั้งค่ากล้อง',
  'Restart camera': 'เริ่มกล้องใหม่',
  'Enable camera': 'เปิดกล้อง',
  'Stop camera': 'ปิดกล้อง',
  'Front camera': 'กล้องหน้า',
  'Back camera': 'กล้องหลัง',
  'Camera direction': 'เลือกกล้อง',
  'Larger drawing view': 'ขยายพื้นที่วาด',
  'Exit large drawing view': 'ออกจากมุมมองขยาย',
  'Use one hand in even light, with your palm facing the camera. Keep the entire hand in frame. On a phone, prop it up with room to move. Use Front camera to see yourself, or Back camera with help positioning the phone. Both previews are mirrored. Mobile performance is experimental.':
    'ใช้มือข้างเดียวในที่มีแสงสม่ำเสมอ หันฝ่ามือเข้าหากล้องและให้เห็นมือทั้งข้าง หากใช้โทรศัพท์ ให้วางเครื่องไว้โดยมีพื้นที่ขยับมือ ใช้กล้องหน้าเพื่อมองเห็นตัวเอง หรือให้คนช่วยจัดตำแหน่งเมื่อใช้กล้องหลัง ภาพทั้งสองกล้องแสดงแบบกระจก การใช้งานบนโทรศัพท์ยังอยู่ระหว่างทดลอง',
  'Frames stay on your device. No video or audio is recorded.':
    'ภาพจากกล้องอยู่บนอุปกรณ์ของคุณ ไม่มีการบันทึกวิดีโอหรือเสียง',
  'Browser storage is unavailable. Export your study before leaving this page.':
    'ไม่สามารถบันทึกข้อมูลในเบราว์เซอร์ได้ กรุณาส่งออกผลทดสอบก่อนออกจากหน้านี้',
  'Guided first spell': 'บทเรียนเวทแรก',
  'YOUR FIRST SPELL': 'เวทแรกของคุณ',
  '1. Curl your index finger': '1. งอนิ้วชี้',
  '2. Point and draw a circle': '2. ชี้นิ้วแล้ววาดวงกลม',
  '3. Curl and hold to cast': '3. งอนิ้วค้างไว้เพื่อร่ายเวท',
  'You cast Ward!': 'คุณร่ายเวทเกราะสำเร็จ!',
  'Enable your camera below to follow the lesson.': 'เปิดกล้องด้านล่างเพื่อเริ่มบทเรียน',
  'Show your whole hand to the camera in even light.':
    'ให้กล้องเห็นมือทั้งข้างในที่มีแสงสม่ำเสมอ',
  'Keep your palm facing the camera. Curl your index finger until the tracker is ready.':
    'หันฝ่ามือเข้าหากล้อง งอนิ้วชี้จนระบบพร้อม',
  'Extend your index finger, keeping the others curled. Wait for “Drawing”, then trace the circle guide.':
    'เหยียดนิ้วชี้และงอนิ้วอื่นไว้ รอข้อความ “กำลังวาด” แล้ววาดตามวงกลมตัวอย่าง',
  'Complete the circle, then curl your index finger and hold for about a third of a second.':
    'วาดวงกลมให้ครบ แล้วงอนิ้วชี้ค้างไว้ประมาณหนึ่งในสามวินาที',
  'You are ready to explore the other five runes or enter a duel.':
    'คุณพร้อมฝึกรูนอีกห้าแบบหรือเข้าสู่สนามประลองแล้ว',
  'Curl to prepare': 'งอนิ้วเพื่อเตรียม',
  'Draw a circle': 'วาดวงกลม',
  'Curl to cast': 'งอนิ้วเพื่อร่ายเวท',
  'Keep your casting hand ready.': 'เตรียมมือให้พร้อมร่ายเวท',
  'Learn your first spell with the camera.': 'เรียนรู้เวทแรกผ่านกล้อง',
  'Follow three live steps. Tutorial attempts do not affect practice accuracy or study results.':
    'ทำตามสามขั้นตอนกับกล้อง การลองในบทเรียนไม่กระทบคะแนนฝึกหรือผลทดสอบ',
  'Continue practicing': 'ฝึกต่อ',
  'Exit tutorial': 'ออกจากบทเรียน',
  'Replay tutorial': 'เรียนซ้ำ',
  'Start tutorial': 'เริ่มบทเรียน',
  'PRACTICE CHAMBER': 'ห้องฝึกเวท',
  'THE ARCHIVIST': 'ผู้พิทักษ์คัมภีร์',
  'GUIDED STUDY': 'การทดสอบตามขั้นตอน',
  'Live fingertip drawing trail': 'เส้นวาดจากปลายนิ้วแบบเรียลไทม์',
  'A LITTLE MAGIC STARTS HERE': 'เวทมนตร์เริ่มต้นที่นี่',
  'Preparing your hand tracker…': 'กำลังเตรียมระบบติดตามมือ…',
  'Bring your hand into play.': 'ใช้มือของคุณร่วมเล่น',
  'The first load may take a moment.': 'การโหลดครั้งแรกอาจใช้เวลาสักครู่',
  'Enable your camera to begin tracing spells.': 'เปิดกล้องเพื่อเริ่มวาดรูนร่ายเวท',
  'Loading…': 'กำลังโหลด…',
  'Retry camera': 'ลองเปิดกล้องอีกครั้ง',
  'Your camera stays on your device.': 'ภาพจากกล้องอยู่บนอุปกรณ์ของคุณ',
  'DRAW A': 'วาด',
  'YOUR OPPONENT AWAITS': 'คู่ต่อสู้กำลังรอคุณ',
  'The Archivist': 'ผู้พิทักษ์คัมภีร์',
  '100 health. Six spells. Keep your hand in view.':
    'พลังชีวิต 100 เวทหกแบบ ให้กล้องเห็นมืออยู่เสมอ',
  'Start adaptive duel': 'ประลองแบบปรับความยาก',
  'Fixed difficulty': 'ความยากคงที่',
  'Practice results set your adaptive counter windows.':
    'ผลการฝึกช่วยกำหนดเวลาที่ให้คุณโต้กลับ',
  'Show your hand to begin.': 'ให้กล้องเห็นมือเพื่อเริ่ม',
  'INPUT UPDATED': 'อัปเดตการควบคุมแล้ว',
  'SESSION COMPLETE': 'จบการทดสอบ',
  'GUIDED EVALUATION': 'ประเมินตามขั้นตอน',
  'Start fresh with smoother drawing.': 'เริ่มใหม่ด้วยการวาดที่ลื่นไหลขึ้น',
  'Your results are ready.': 'ผลทดสอบของคุณพร้อมแล้ว',
  'A repeatable test of your runes.': 'ทดสอบการวาดรูนอย่างเป็นระบบ',
  '12 practice strokes · 60 measured strokes · 2 duels':
    'ฝึก 12 ครั้ง · ทดสอบ 60 ครั้ง · ประลอง 2 รอบ',
  'Test device': 'อุปกรณ์ที่ใช้ทดสอบ',
  'e.g. iPhone 15 / Windows laptop': 'เช่น iPhone 15 / แล็ปท็อป Windows',
  'Participant sequence': 'ลำดับผู้เข้าร่วม',
  'I agree to store anonymous results on this device.':
    'ฉันยินยอมให้บันทึกผลโดยไม่ระบุตัวตนบนอุปกรณ์นี้',
  'Start a new session': 'เริ่มการทดสอบใหม่',
  'Begin practice': 'เริ่มฝึก',
  'Export this session below before starting another.':
    'ส่งออกผลการทดสอบนี้ด้านล่างก่อนเริ่มใหม่',
  PRACTICE: 'ฝึกวาด',
  'MEASURED TRIAL': 'ครั้งที่ทดสอบ',
  DUEL: 'ประลอง',
  'OF 2': 'จาก 2 รอบ',
  Adaptive: 'ปรับตามผู้เล่น',
  Fixed: 'คงที่',
  difficulty: 'ระดับความยาก',
  'Counter windows use your practice accuracy.':
    'เวลาโต้กลับปรับตามความแม่นยำจากการฝึก',
  'Each attack starts with a four-second warning.':
    'แต่ละการโจมตีมีคำเตือนล่วงหน้าสี่วินาที',
  'Begin duel': 'เริ่มประลอง',
  YOU: 'คุณ',
  'Player health': 'พลังชีวิตของคุณ',
  'Opponent health': 'พลังชีวิตคู่ต่อสู้',
  'INCOMING ATTACK': 'กำลังจะถูกโจมตี',
  'COUNTERATTACK NOW': 'โต้กลับตอนนี้',
  'BARRIER ACTIVE': 'คู่ต่อสู้กางเกราะ',
  'The Archivist is recovering': 'ผู้พิทักษ์กำลังพักฟื้น',
  'Damage is halved': 'ความเสียหายลดลงครึ่งหนึ่ง',
  Try: 'ลองใช้',
  Pause: 'หยุดพัก',
  Paused: 'หยุดพักแล้ว',
  Resume: 'เล่นต่อ',
  'Curl your index finger before resuming.': 'งอนิ้วชี้ก่อนเล่นต่อ',
  'Bring your hand back into view.': 'นำมือกลับมาให้กล้องเห็น',
  'DUEL COMPLETE': 'จบการประลอง',
  'DUEL COMPLETE ·': 'จบการประลอง ·',
  'The circle is yours.': 'คุณชนะการประลอง',
  'The Archivist prevails.': 'ผู้พิทักษ์เป็นฝ่ายชนะ',
  'spells cast ·': 'เวทที่ร่าย ·',
  seconds: 'วินาที',
  s: 'วิ',
  'Play again': 'เล่นอีกครั้ง',
  'How did that feel?': 'คุณรู้สึกอย่างไรบ้าง?',
  Enjoyment: 'ความสนุก',
  Responsiveness: 'ความรวดเร็วในการตอบสนอง',
  Fatigue: 'ความเมื่อยล้า',
  '— Low': '— น้อย',
  '— High': '— มาก',
  'Save ratings': 'บันทึกคะแนน',
  'Curl your index finger to arm, then point to draw. Curl it again and hold briefly to cast.':
    'งอนิ้วชี้เพื่อเตรียม แล้วชี้นิ้วเพื่อวาด งอนิ้วอีกครั้งค้างไว้สั้น ๆ เพื่อร่ายเวท',
  'Camera permission is required to cast.': 'ต้องอนุญาตให้ใช้กล้องก่อนร่ายเวท',
  'Drawing — curl index to cast': 'กำลังวาด — งอนิ้วชี้เพื่อร่ายเวท',
  'Hold index curled to cast…': 'งอนิ้วชี้ค้างไว้เพื่อร่ายเวท…',
  'Curl index to arm': 'งอนิ้วชี้เพื่อเตรียม',
  'Hand tracked': 'ตรวจพบมือ',
  'Brief tracking gap — keeping your stroke':
    'ติดตามมือขาดช่วงสั้น ๆ — ยังเก็บเส้นวาดไว้',
  'No hand detected': 'ไม่พบมือ',
  'Loading tracker…': 'กำลังโหลดระบบติดตาม…',
  'Camera off': 'กล้องปิดอยู่',
  'POINT TO DRAW · CURL INDEX TO CAST': 'ชี้นิ้วเพื่อวาด · งอนิ้วชี้เพื่อร่ายเวท',
  'YOUR CASTING HAND': 'มือที่ใช้ร่ายเวท',
  'THE FIRST LESSON': 'บทเรียนแรก',
  'Mirrored webcam preview': 'ภาพตัวอย่างกล้องแบบกระจก',
  'BACK · MIRRORED': 'กล้องหลัง · ภาพกระจก',
  'FRONT · MIRRORED': 'กล้องหน้า · ภาพกระจก',
  'CAMERA OFF': 'กล้องปิดอยู่',
  'Keep your hand in view.': 'ให้กล้องเห็นมืออยู่เสมอ',
  'One stroke at a time.': 'วาดทีละเส้นต่อเนื่อง',
  'Point with your index finger to draw. Curl the other fingers. Curl your index finger to cast.':
    'เหยียดนิ้วชี้เพื่อวาดและงอนิ้วอื่นไว้ งอนิ้วชี้เมื่อพร้อมร่ายเวท',
  Tracking: 'การติดตาม',
  Inference: 'ประมวลผลภาพ',
  'Frame → trail': 'ภาพ → เส้นวาด',
  'Release → cast': 'งอนิ้ว → ร่ายเวท',
  'correct for': 'ถูกต้องสำหรับ',
  'in prompted practice.': 'ในการฝึกตามรูนเป้าหมาย',
  'Trace. Release. Cast.': 'วาด งอนิ้ว ร่ายเวท',
  'Find your frame': 'จัดมือให้อยู่ในภาพ',
  'Keep one hand visible, with room to move.': 'ให้กล้องเห็นมือข้างเดียวและมีพื้นที่ขยับ',
  'Point to draw': 'ชี้นิ้วเพื่อวาด',
  'Extend your index finger. Curl the others.': 'เหยียดนิ้วชี้และงอนิ้วอื่นไว้',
  'Release the spell': 'ปล่อยพลังเวท',
  'Curl your index finger when the rune is complete.': 'งอนิ้วชี้เมื่อวาดรูนเสร็จ',
  'Your spellbook': 'คัมภีร์เวทของคุณ',
  'SELECT A RUNE TO PRACTICE': 'เลือกรูนที่จะฝึก',
  'SIX RUNES. ONE HAND.': 'รูนหกแบบ มือข้างเดียว',
  'Recent battle events': 'เหตุการณ์ล่าสุดในการประลอง',
  '· SAVED ON THIS DEVICE': '· บันทึกบนอุปกรณ์นี้',
  'Session results': 'ผลการทดสอบ',
  'Measured accuracy': 'ความแม่นยำในการทดสอบ',
  'Measured attempts': 'จำนวนครั้งที่ทดสอบ',
  'Rejected attempts': 'จำนวนครั้งที่ไม่ผ่าน',
  'Duels recorded': 'รอบประลองที่บันทึก',
  'Per-rune accuracy and confusion matrix': 'ความแม่นยำรายรูนและตารางผลการจำแนก',
  'Rows: target rune · Columns: detected rune':
    'แถว: รูนเป้าหมาย · คอลัมน์: รูนที่ตรวจพบ',
  Target: 'เป้าหมาย',
  Rejected: 'ไม่ผ่าน',
  Accuracy: 'ความแม่นยำ',
  'Rejected strokes count as incorrect. Thresholds are fixed for this version; pilot tuning and human evaluation are pending.':
    'เส้นวาดที่ไม่ผ่านนับเป็นคำตอบผิด เกณฑ์คงที่สำหรับเวอร์ชันนี้ การปรับจากข้อมูลนำร่องและการประเมินกับผู้เล่นยังไม่เสร็จสิ้น',
  'End duel early and record as aborted': 'จบการประลองก่อนกำหนดและบันทึกว่ายุติ',
  'Last recognition details': 'รายละเอียดการจำแนกล่าสุด',
  'Match score:': 'คะแนนความคล้าย:',
  '· Distance:': '· ระยะห่าง:',
  '· Runner-up:': '· อันดับสอง:',
  '· Recognition:': '· เวลาจำแนก:',
  Accepted: 'ผ่าน',
  'A match score is a geometric similarity score, not a probability.':
    'คะแนนนี้แสดงความคล้ายของรูปทรง ไม่ใช่ค่าความน่าจะเป็น',
  'WEBCAM MAGIC, NO EXTRA HARDWARE.': 'ร่ายเวทผ่านกล้อง ไม่ต้องใช้อุปกรณ์เสริม',
  'Research prototype ·': 'ต้นแบบเพื่อการวิจัย ·',
  Ward: 'เกราะเวท',
  Fireball: 'ลูกไฟ',
  Lightning: 'สายฟ้า',
  Frost: 'น้ำแข็ง',
  Mend: 'ฟื้นฟู',
  Dispel: 'สลายเวท',
  Circle: 'วงกลม',
  Triangle: 'สามเหลี่ยม',
  Zigzag: 'ซิกแซก',
  'V shape': 'รูปตัว V',
  Spiral: 'เกลียว',
  'Horizontal line': 'เส้นแนวนอน',
  'Block the next attack': 'ป้องกันการโจมตีครั้งถัดไป',
  'Deal 28 damage': 'สร้างความเสียหาย 28',
  'Deal 16 damage': 'สร้างความเสียหาย 16',
  'Delay an attack by 3 seconds': 'เลื่อนการโจมตีออกไป 3 วินาที',
  'Restore 22 health': 'ฟื้นฟูพลังชีวิต 22',
  'Cancel a charged attack': 'ยกเลิกการร่ายเวทของศัตรู',
  'Ember volley': 'ห่าลูกไฟ',
  'Charged nova': 'ระเบิดพลังเวท',
  'Glacial lance': 'หอกน้ำแข็ง',
  'The Archivist prepares an ember volley.': 'ผู้พิทักษ์กำลังเตรียมห่าลูกไฟ',
  'Ward absorbed the attack.': 'เกราะเวทป้องกันการโจมตีไว้ได้',
  'The Archivist raises a barrier. Damage is halved.':
    'ผู้พิทักษ์กางเกราะ ความเสียหายลดลงครึ่งหนึ่ง',
  'Duel ended': 'จบการประลองแล้ว',
  'Shield active': 'มีเกราะอยู่แล้ว',
  'Health full': 'พลังชีวิตเต็ม',
  'Needs incoming attack': 'ใช้ขณะมีคำเตือนโจมตี',
  Ready: 'พร้อม',
  'Game paused while away': 'หยุดเกมระหว่างออกจากหน้านี้',
  'Hand tracking lost': 'ระบบติดตามมือขาดหาย',
  'Camera unavailable': 'ไม่สามารถใช้กล้องได้',
  'Camera stopped': 'ปิดกล้องแล้ว',
  'Camera changed — resume when your hand is visible':
    'เปลี่ยนกล้องแล้ว — เล่นต่อเมื่อกล้องเห็นมือ',
  'Show one whole hand in even light.': 'ให้กล้องเห็นมือทั้งข้างในที่มีแสงสม่ำเสมอ',
  'Move your hand toward the center. Keep every fingertip in view.':
    'ขยับมือเข้ากลางภาพ ให้กล้องเห็นปลายนิ้วทุกนิ้ว',
  'Try moving your hand a little closer to the camera.':
    'ลองขยับมือเข้าหากล้องอีกเล็กน้อย',
  'Move your hand a little farther away to leave room to draw.':
    'ขยับมือออกห่างอีกเล็กน้อยเพื่อให้มีพื้นที่วาด',
  'Hand in frame. Leave room around your fingertips to draw.':
    'มืออยู่ในภาพแล้ว เว้นพื้นที่รอบปลายนิ้วไว้สำหรับวาด',
  'Not enough movement to read a rune. Wait for “Drawing”, then trace the whole shape before curling your index finger.':
    'การเคลื่อนไหวยังน้อยเกินไป รอข้อความ “กำลังวาด” แล้ววาดรูนให้ครบก่อนงอนิ้วชี้',
  'Rune too small. Use more of the drawing area and trace one complete shape.':
    'รูนเล็กเกินไป ใช้พื้นที่วาดให้มากขึ้นและวาดรูปให้ครบ',
  'Stroke timed out. Finish within 20 seconds, then curl your index finger to cast.':
    'หมดเวลาวาด กรุณาวาดให้เสร็จใน 20 วินาที แล้วงอนิ้วชี้เพื่อร่ายเวท',
  'Tracking was lost. Bring your whole hand into view, curl your index finger, then redraw.':
    'ติดตามมือไม่ได้ นำมือทั้งข้างกลับเข้าภาพ งอนิ้วชี้ แล้ววาดใหม่',
  'Stroke interrupted. Curl your index finger to start fresh, then redraw.':
    'การวาดถูกขัดจังหวะ งอนิ้วชี้เพื่อเตรียมแล้ววาดใหม่',
  'The shape matched more than one rune. Make its corners or curves more distinct, then try again.':
    'รูปทรงคล้ายรูนมากกว่าหนึ่งแบบ วาดมุมหรือเส้นโค้งให้ชัดขึ้นแล้วลองใหม่',
  'Shape not recognized. Follow the rune reference in one stroke, then curl your index finger and hold briefly.':
    'ไม่รู้จักรูปทรงนี้ วาดตามตัวอย่างเป็นเส้นต่อเนื่อง แล้วงอนิ้วชี้ค้างไว้สั้น ๆ',
  'Mend recognized, but your health is full. Try Fireball or Lightning to attack.':
    'ตรวจพบเวทฟื้นฟู แต่พลังชีวิตเต็มแล้ว ลองใช้ลูกไฟหรือสายฟ้าโจมตี',
  'Ward recognized, but your shield is already active. Try an attack while it protects you.':
    'ตรวจพบเกราะเวท แต่มีเกราะอยู่แล้ว ลองโจมตีระหว่างที่เกราะป้องกันคุณ',
  'The duel has ended. Start another duel to cast again.':
    'การประลองจบแล้ว เริ่มรอบใหม่เพื่อร่ายเวทอีกครั้ง',
  'Ward recognized. Your first spell is complete!':
    'ตรวจพบเกราะเวท คุณร่ายเวทแรกสำเร็จแล้ว!',
  'Camera access requires HTTPS or localhost in desktop Chrome or Edge.':
    'การใช้กล้องต้องเปิดผ่าน HTTPS หรือ localhost ใน Chrome หรือ Edge บนคอมพิวเตอร์',
  'The camera disconnected. Reconnect it and try again.':
    'กล้องถูกตัดการเชื่อมต่อ เชื่อมต่อใหม่แล้วลองอีกครั้ง',
  'Camera preview is unavailable.': 'ไม่สามารถแสดงภาพตัวอย่างกล้องได้',
  'Tracking stopped responding. Restart the camera.':
    'ระบบติดตามไม่ตอบสนอง กรุณาเริ่มกล้องใหม่',
  'Could not read a camera frame. Try restarting the camera.':
    'อ่านภาพจากกล้องไม่ได้ ลองเริ่มกล้องใหม่',
  'The tracking worker could not start. Reload the page and try again.':
    'เริ่มระบบติดตามไม่ได้ โหลดหน้านี้ใหม่แล้วลองอีกครั้ง',
  'Hand tracking could not load. Check your connection and restart the camera.':
    'โหลดระบบติดตามมือไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วเริ่มกล้องใหม่',
  'Loading hand tracking took too long. Check your connection and retry.':
    'โหลดระบบติดตามมือนานเกินไป ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
  'That camera is unavailable. Select the front camera and try again.':
    'ไม่พบกล้องที่เลือก เลือกกล้องหน้าแล้วลองใหม่',
  'Camera permission was denied. Allow camera access in your browser, then try again.':
    'ไม่ได้รับอนุญาตให้ใช้กล้อง เปิดสิทธิ์กล้องในเบราว์เซอร์แล้วลองใหม่',
  'No webcam was found. Connect a camera and retry.':
    'ไม่พบกล้อง เชื่อมต่อกล้องแล้วลองใหม่',
  'The camera is busy. Close other apps using it and retry.':
    'กล้องถูกใช้งานอยู่ ปิดแอปอื่นที่ใช้กล้องแล้วลองใหม่',
  'Rune drawing guide': 'วิธีวาดรูน',
  'DOT = START': 'จุด = จุดเริ่มต้น',
  TRACE: 'วาดตาม',
  'Either drawing direction works. Curl your index finger and hold briefly when finished.':
    'วาดได้ทั้งสองทิศทาง เมื่อเสร็จให้งอนิ้วชี้ค้างไว้สั้น ๆ',
  'No prompted attempts for this rune yet.': 'ยังไม่ได้ฝึกรูนนี้ตามเป้าหมาย',
  'Watch the stroke': 'ดูวิธีลากเส้น',
  next: 'ถัดไป',
  'Next-rune suggestions use your practice results on this device.':
    'รูนที่แนะนำถัดไปอ้างอิงผลการฝึกบนอุปกรณ์นี้',
  'Make one round loop and return to where you started. Leave the center empty.':
    'วาดวงกลมหนึ่งรอบให้กลับมาจุดเริ่มต้น เว้นตรงกลางให้ว่าง',
  'Draw three straight sides with three clear corners, then close the triangle.':
    'วาดเส้นตรงสามด้านและมุมที่ชัดเจนสามมุม แล้วปิดสามเหลี่ยม',
  'Draw a tall zigzag with two sharp bends. Keep its top and bottom well apart.':
    'วาดซิกแซกแนวตั้งที่มีมุมหักสองมุม เว้นด้านบนกับด้านล่างให้ห่างกัน',
  'Draw down to one sharp point, then back up. Leave the top open.':
    'วาดลงมาบรรจบที่มุมแหลมหนึ่งมุม แล้ววาดขึ้นไป เว้นด้านบนไว้ไม่ต้องปิด',
  'Start near the center and spiral outward for almost two turns. Keep space between the coils.':
    'เริ่มใกล้ตรงกลางแล้ววนออกเป็นเกลียวเกือบสองรอบ เว้นช่องว่างระหว่างวง',
  'Draw one straight line from side to side. Keep it roughly level.':
    'ลากเส้นตรงจากด้านหนึ่งไปอีกด้านหนึ่ง ให้เส้นอยู่ในแนวระดับ',
  Star: 'ดาว',
  'Five-point star': 'ดาวห้าแฉก',
  'Stun the enemy for 3 seconds': 'ทำให้ศัตรูมึนงง 3 วินาที',
  'Draw one continuous five-point star. Cross through the center and return to the top point.':
    'วาดดาวห้าแฉกเป็นเส้นต่อเนื่อง ลากตัดผ่านตรงกลางแล้วกลับสู่จุดยอดด้านบน',
  '100 health. Eight spells. Keep your hand in view.':
    'พลังชีวิต 100 เวทแปดแบบ ให้กล้องเห็นมืออยู่เสมอ',
  'EIGHT RUNES. ONE HAND.': 'รูนแปดแบบ มือข้างเดียว',
  'You are ready to explore the other seven runes or enter a duel.':
    'คุณพร้อมฝึกรูนอีกเจ็ดแบบหรือเข้าสู่สนามประลองแล้ว',
  '16 practice strokes · 80 measured strokes · 2 duels':
    'ฝึก 16 ครั้ง · ทดสอบ 80 ครั้ง · ประลอง 2 รอบ',
  'Star stunned the Archivist for 3 seconds.': 'เวทดาวทำให้ผู้พิทักษ์มึนงง 3 วินาที',
  'ENEMY STUNNED': 'ศัตรูมึนงง',
  'The Archivist cannot act': 'ผู้พิทักษ์ยังเคลื่อนไหวไม่ได้',
  'YOU ARE STUNNED': 'คุณกำลังมึนงง',
  'Casting is disabled briefly.': 'ไม่สามารถร่ายเวทได้ชั่วครู่',
  'Wait for the stun to end.': 'รอให้อาการมึนงงสิ้นสุด',
  'You are stunned and cannot cast yet.': 'คุณกำลังมึนงงและยังร่ายเวทไม่ได้',
  victory: 'ชนะ',
  defeat: 'แพ้',
  aborted: 'ยุติ',
  MEASURED: 'ทดสอบ',
  'DUEL-READY': 'พร้อมประลอง',
  RATING: 'ให้คะแนน',
  COMPLETE: 'เสร็จสิ้น',
  'too-short': 'เส้นสั้นเกินไป',
  'too-small': 'รูนเล็กเกินไป',
  'too-long': 'วาดนานเกินไป',
  'tracking-lost': 'ติดตามมือไม่ได้',
  interrupted: 'ถูกขัดจังหวะ',
  ambiguous: 'รูปทรงกำกวม',
  'unknown-shape': 'ไม่รู้จักรูปทรง',
  'invalid-path': 'เส้นวาดไม่ถูกต้อง',
};

const uppercase = Object.fromEntries(
  Object.entries(TH).map(([key, value]) => [key.toUpperCase(), value]),
);
const lookup = (key: string): string | undefined =>
  Object.hasOwn(TH, key)
    ? TH[key]
    : Object.hasOwn(uppercase, key)
      ? uppercase[key]
      : undefined;
const name = (s: string) => lookup(s) ?? s;
const patterns: [RegExp, (...parts: string[]) => string][] = [
  [
    /^(\d+) casts · (\d+) counters$/,
    (_, casts, counters) => `ร่าย ${casts} ครั้ง · ป้องกัน ${counters} ครั้ง`,
  ],
  [
    /^Wand recovery (\d+(?:\.\d+)?)s$/,
    (_, seconds) => `ไม้กายสิทธิ์ฟื้นตัว ${seconds} วิ`,
  ],
  [
    /^(.+) incoming — try (.+)\.$/,
    (_, attack, counter) => `${name(attack)}กำลังมา — ลองใช้${name(counter)}`,
  ],
  [
    /^(.+) landed for (\d+)\.$/,
    (_, attack, damage) => `${name(attack)}สร้างความเสียหาย ${damage}`,
  ],
  [
    /^(.+) recognized, but still cooling down\. Wait about (\d+) seconds, then draw it again\.$/,
    (_, n, s) => `ตรวจพบ${name(n)} แต่ยังคูลดาวน์อยู่ รอประมาณ ${s} วินาทีแล้ววาดอีกครั้ง`,
  ],
  [
    /^(.+) recognized\. Save it for an incoming attack warning; try Fireball or Lightning now\.$/,
    (_, n) => `ตรวจพบ${name(n)} เก็บไว้ใช้เมื่อมีคำเตือนโจมตี ตอนนี้ลองใช้ลูกไฟหรือสายฟ้า`,
  ],
  [
    /^(.+) recognized\. For this lesson, trace a circle for Ward\.$/,
    (_, n) => `ตรวจพบ${name(n)} สำหรับบทเรียนนี้ ให้วาดวงกลมเพื่อร่ายเกราะเวท`,
  ],
  [
    /^(.+) detected — the target was (.+)\.$/,
    (_, n, target) => `ตรวจพบ${name(n)} — รูนเป้าหมายคือ${name(target)}`,
  ],
  [/^(.+) recognized\.$/, (_, n) => `ตรวจพบ${name(n)}`],
  [/^(.+) cast\.$/, (_, n) => `ร่าย${name(n)}แล้ว`],
  [
    /^(.+) sent to the match server\.$/,
    (_, n) => `ส่ง${name(n)}ไปยังเซิร์ฟเวอร์การแข่งขันแล้ว`,
  ],
  [
    /^(.+) cast (ward|fireball|lightning|frost|mend|dispel|water|star)\.$/,
    (_, player, rune) =>
      `${player} ร่าย${name(rune[0].toUpperCase() + rune.slice(1))}`,
  ],
  [
    /^(.+)'s (ward|fireball|lightning|frost|mend|dispel|water|star) fizzled\.$/,
    (_, player, rune) =>
      `${name(rune[0].toUpperCase() + rune.slice(1))}ของ${player}ร่ายไม่สำเร็จ`,
  ],
  [
    /^(.+) (lost|restored) (\d+) health\.$/,
    (_, player, action, amount) =>
      `${player}${action === 'lost' ? 'เสีย' : 'ฟื้นฟู'}พลังชีวิต ${amount}`,
  ],
  [
    /^(.+) is (burning|no longer burning|stunned|no longer stunned)\.$/,
    (_, player, status) =>
      `${player}${status === 'burning' ? 'กำลังติดไฟ' : status === 'no longer burning' ? 'หายจากไฟแล้ว' : status === 'stunned' ? 'กำลังมึนงง' : 'หายมึนงงแล้ว'}`,
  ],
  [
    /^(.+)'s Ward (formed|was consumed)\.$/,
    (_, player, state) =>
      `เกราะเวทของ${player}${state === 'formed' ? 'ก่อตัวแล้ว' : 'ถูกใช้ไปแล้ว'}`,
  ],
  [
    /^(fireball|lightning) resolved\.$/,
    (_, rune) => `${name(rune[0].toUpperCase() + rune.slice(1))}โจมตีแล้ว`,
  ],
  [
    /^You are stunned — (\d+(?:\.\d+)?)s$/,
    (_, seconds) => `คุณกำลังมึนงง — ${seconds} วิ`,
  ],
  [
    /^Opponent stunned — (\d+(?:\.\d+)?)s$/,
    (_, seconds) => `คู่ต่อสู้มึนงง — ${seconds} วิ`,
  ],
  [
    /^The Archivist is stunned — (\d+(?:\.\d+)?)s$/,
    (_, seconds) => `ผู้พิทักษ์มึนงง — ${seconds} วิ`,
  ],
  [/^(\d+) seconds remaining$/, (_, seconds) => `เหลือ ${seconds} วินาที`],
  [/^Room code: (.+)$/, (_, code) => `รหัสห้อง: ${code}`],
  [/^(.+) wins\.$/, (_, player) => `${player} ชนะ`],
  [/^(.+) hit for (\d+)\.$/, (_, n, d) => `${name(n)}สร้างความเสียหาย ${d}`],
  [/^(.+) incoming\.$/, (_, n) => `${name(n)}กำลังมา`],
  [/^(\d+(?:\.\d+)?)s cooldown$/, (_, n) => `คูลดาวน์ ${n} วิ`],
  [/^(.+) cooldown recovery$/, (_, n) => `การฟื้นคูลดาวน์ของ${name(n)}`],
  [
    /^(.+) example\. The dot marks one possible starting point\.$/,
    (_, n) => `ตัวอย่าง${name(n)} จุดแสดงตำแหน่งเริ่มต้นแบบหนึ่ง`,
  ],
  [
    /^(\d+) of (\d+) prompted attempts correct \((\d+)%\)\.$/,
    (_, a, b, p) => `ฝึกตามเป้าหมายถูกต้อง ${a} จาก ${b} ครั้ง (${p}%)`,
  ],
  [
    /^(.+)\. Trace the guide and curl your index finger to finish\.$/,
    (_, effect) => `${name(effect)} วาดตามตัวอย่างแล้วงอนิ้วชี้เพื่อจบ`,
  ],
  [/^(\d+ \/ \d+ · )(.+)$/, (_, prefix, n) => prefix + name(n)],
  [
    /^(ADAPTIVE|FIXED) DIFFICULTY$/,
    (_, n) => (n === 'ADAPTIVE' ? 'ความยากปรับตามผู้เล่น' : 'ความยากคงที่'),
  ],
  [/^(\d+) Hz · (\d+) ms trail$/, (_, hz, ms) => `${hz} Hz · เส้นวาด ${ms} ms`],
];

// Translate only presentation strings; stored rune IDs, study exports and input values stay canonical.
export function translate(text: string, locale: Locale): string {
  if (locale === 'en' || !text.trim()) return text;
  const key = text.trim(),
    known = lookup(key);
  let result = known;
  if (result === undefined)
    for (const [pattern, format] of patterns) {
      const match = key.match(pattern);
      if (match) {
        result = format(...match);
        break;
      }
    }
  return result === undefined
    ? text
    : text.slice(0, text.indexOf(key)) +
        result +
        text.slice(text.indexOf(key) + key.length);
}
export function savedLocale(value: string | null): Locale {
  return value === 'th' ? 'th' : 'en';
}
