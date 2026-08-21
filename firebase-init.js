/* ==========================================================================
   FriendHub RP — Firebase Realtime Database Sync Layer
   --------------------------------------------------------------------------
   ไฟล์นี้เพิ่มระบบซิงค์ข้อมูล (ที่เดิมเก็บใน localStorage ของเบราว์เซอร์เท่านั้น)
   ขึ้นไปเก็บบน Firebase Realtime Database ด้วย เพื่อให้เมื่อนำเว็บไปโฮสต์บน
   GitHub Pages แล้ว ข้อมูลจะไม่หายเมื่อเปลี่ยนเครื่อง/เปลี่ยนเบราว์เซอร์ และผู้ใช้
   หลายคนจะเห็นข้อมูลชุดเดียวกัน

   วิธีตั้งค่า Firebase ของคุณเอง (แนะนำให้ทำ ถ้าจะใช้งานจริงแบบสาธารณะ):
   1) ไปที่ https://console.firebase.google.com แล้วสร้างโปรเจกต์ใหม่ (หรือใช้ของเดิม)
   2) เมนูซ้าย > Build > Realtime Database > Create Database (เลือกโหมด Test/Locked ก็ได้
      แล้วค่อยไปตั้ง Rules เองตามด้านล่าง)
   3) ไปที่ Project settings (รูปเฟือง) > General > Your apps > เพิ่มแอปแบบ Web (</>) 
      แล้วคัดลอกค่า firebaseConfig มาวางแทนของด้านล่างนี้
   4) แท็บ Rules ของ Realtime Database ตั้งค่าประมาณนี้ระหว่างทดสอบ/ใช้ในวงจำกัด:
      {
        "rules": { ".read": true, ".write": true }
      }
      ⚠️ Rules ด้านบนเปิดให้ใครก็อ่าน/เขียนข้อมูลได้ทั้งหมด เหมาะกับการทดสอบหรือ
      ใช้ในกลุ่มที่ไว้ใจกันเท่านั้น ระบบนี้ไม่มี Firebase Authentication ผูกอยู่
      (การล็อกอินยังเป็นระบบ username/password ภายในแอปเหมือนเดิม)

   ค่าด้านล่างนี้เป็นค่าที่เคยตั้งไว้แล้ว (จากไฟล์ config เดิมที่อัปโหลดมา) ใช้งานได้เลย
   แต่แนะนำให้เปลี่ยนเป็นโปรเจกต์ของคุณเองเมื่อจะใช้งานจริง
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyC9emUQgRfiMmFML272Ue2rLimj6g3B4q8",
  authDomain: "kkkk-c0436.firebaseapp.com",
  projectId: "kkkk-c0436",
  storageBucket: "kkkk-c0436.appspot.com",
  messagingSenderId: "268898744682",
  appId: "1:268898744682:web:32c774a6f36c081b448d13",
  measurementId: "G-NNSB108BRQ",
  databaseURL: "https://kkkk-c0436-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// เส้นทางหลักบน Realtime Database ที่จะเก็บข้อมูลทั้งหมดของระบบนี้
const FB_ROOT = 'friendhub_rp';

// รายชื่อ key ใน localStorage ที่จะถูกซิงค์ขึ้น/ลง Firebase
// (ไม่รวม rp_current เพราะเป็นสถานะ "ใครล็อกอินอยู่บนเครื่องนี้" เฉพาะเบราว์เซอร์นั้น ๆ)
const FB_KEYS = ['rp_users','rp_chars','rp_departments','rp_posts','rp_ids','rp_licenses',
 'rp_dispatch','rp_appointments','rp_cases','rp_dm','rp_dept_posts','rp_socials',
 'rp_audit','rp_login_logs','rp_settings','rp_logo'];

let fbdb = null, fbReady = false;
try{
  if(typeof firebase!=='undefined'){
    firebase.initializeApp(firebaseConfig);
    fbdb = firebase.database();
    fbReady = true;
  }
}catch(e){
  console.warn('[Firebase] เชื่อมต่อ Firebase ไม่สำเร็จ ระบบจะทำงานแบบ localStorage อย่างเดียวต่อไป:',e);
}

// stringify แบบเรียง key ให้คงที่ ใช้เทียบว่าเนื้อหาต่างกันจริงหรือไม่
// (ป้องกันการ reload วนซ้ำ เพราะลำดับ key จาก Firebase อาจไม่ตรงกับ localStorage เดิม)
function stableStringify(obj){
  if(Array.isArray(obj)) return '['+obj.map(stableStringify).join(',')+']';
  if(obj&&typeof obj==='object') return '{'+Object.keys(obj).sort().map(k=>JSON.stringify(k)+':'+stableStringify(obj[k])).join(',')+'}';
  return JSON.stringify(obj===undefined?null:obj);
}

// เรียกทุกครั้งที่มีการบันทึกข้อมูลผ่าน W() ใน auth.js เพื่อดันข้อมูลขึ้น Cloud แบบเบื้องหลัง
function fbPush(key,value){
  if(!fbReady||FB_KEYS.indexOf(key)===-1)return;
  try{
    const ref=fbdb.ref(FB_ROOT+'/'+key);
    if(value===null||value===undefined) ref.remove(); else ref.set(value);
  }catch(e){console.warn('[Firebase] บันทึกข้อมูลขึ้น Cloud ไม่สำเร็จ:',e)}
}

// ดึงข้อมูลทั้งหมดจาก Cloud มาเทียบ/อัปเดตใส่ localStorage
// คืนค่า true ถ้ามีข้อมูลที่เปลี่ยนไปจริง (ใช้ตัดสินใจว่าควรรีเฟรชหน้าหรือไม่)
async function fbPullAll(){
  if(!fbReady)return false;
  try{
    const snap = await fbdb.ref(FB_ROOT).once('value');
    if(!snap.exists())return false;
    const data = snap.val()||{};
    let changed=false;
    FB_KEYS.forEach(k=>{
      if(data[k]===undefined)return;
      const incoming=stableStringify(data[k]);
      const localRaw=localStorage.getItem(k);
      const local=localRaw?stableStringify(JSON.parse(localRaw)):stableStringify(null);
      if(incoming!==local){localStorage.setItem(k,JSON.stringify(data[k]));changed=true}
    });
    return changed;
  }catch(e){console.warn('[Firebase] ดึงข้อมูลจาก Cloud ไม่สำเร็จ:',e);return false}
}

// ซิงค์อัตโนมัติทุกครั้งที่เปิดหน้าเว็บ: ถ้าข้อมูลบน Cloud ใหม่กว่า/ต่างจากในเครื่อง
// ให้ดึงมาใส่ localStorage แล้วรีเฟรชหน้าหนึ่งครั้งเพื่อให้ UI แสดงข้อมูลล่าสุด
(async function fbSyncOnLoad(){
  const changed = await fbPullAll();
  if(changed) location.reload();
})();
