const DB={
 users:'rp_users',chars:'rp_chars',departments:'rp_departments',posts:'rp_posts',ids:'rp_ids',
 licenses:'rp_licenses',dispatch:'rp_dispatch',appointments:'rp_appointments',cases:'rp_cases',
 dm:'rp_dm',deptPosts:'rp_dept_posts',current:'rp_current',socials:'rp_socials',audit:'rp_audit',loginLogs:'rp_login_logs'
};
let ROLE_NAMES={user:'ผู้ใช้ทั่วไป',rank1:'สมาชิกยศ 1',rank2:'สมาชิกยศ 2',admin:'แอดมินทั่วไป',superadmin:'Super Admin'};
let RANKS=['พลเมือง','ฝึกงาน','เจ้าหน้าที่','Senior','Sergeant','Lieutenant','Captain','Chief'];
const RP_SETTINGS='rp_settings';
function R(k){try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}}
function W(k,v){localStorage.setItem(k,JSON.stringify(v))}
function uid(p='id'){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function me(){try{return JSON.parse(localStorage.getItem(DB.current))}catch(e){return null}}
function isAdmin(){let u=me();return !!u&&(u.role==='admin'||u.role==='superadmin')}
function isSuperAdmin(){return me()?.role==='superadmin'}
function roleOk(rs){let u=me();return !!u&&rs.includes(u.role)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function now(){return new Date().toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'})}
function dateOnly(){return new Date().toLocaleDateString('th-TH')}
function logout(){localStorage.removeItem(DB.current);location.href='index.html'}
function charOf(username){return R(DB.chars).find(c=>c.username===username)||null}
function levelNeed(level){return 1000+Math.max(0,level-1)*350}
function addXP(username,n){const a=R(DB.chars),c=a.find(x=>x.username===username);if(!c)return;c.xp=(c.xp||0)+n;while(c.xp>=levelNeed(c.level||1)){c.xp-=levelNeed(c.level||1);c.level=(c.level||1)+1}W(DB.chars,a)}
function setCurrent(u){localStorage.setItem(DB.current,JSON.stringify(u))}
function protect(){if(!me()){location.href='index.html';return false}return true}
function siteSettings(){return Object.assign({name:'FriendHub RP',city:'City Management',description:'ศูนย์กลางบริการเมือง Roleplay',logo:'',footer:'FriendHub RP • ระบบต้นแบบสำหรับเมือง Roleplay • ข้อมูลจัดเก็บในเบราว์เซอร์เครื่องนี้'},R(DB.settings)[0]||{})}
function logAction(action,detail=''){if(!isAdmin())return;let a=R(DB.logs);a.push({id:uid('log'),time:now(),by:me()?.username||'-',action,detail});W(DB.logs,a.slice(-500))}
function seed(){
 if(!localStorage.getItem(DB.users))W(DB.users,[{username:'admin_big',password:'123',role:'superadmin',roleName:ROLE_NAMES.superadmin},{username:'admin_general',password:'123',role:'admin',roleName:ROLE_NAMES.admin},{username:'rank1_user',password:'123',role:'rank1',roleName:ROLE_NAMES.rank1},{username:'rank2_user',password:'123',role:'rank2',roleName:ROLE_NAMES.rank2},{username:'general_user',password:'123',role:'user',roleName:ROLE_NAMES.user}]);
 if(!localStorage.getItem(DB.chars))W(DB.chars,[{id:'c1',username:'admin_big',name:'Alexander Morgan',dob:'12/04/1990',gender:'ชาย',phone:'080-000-0001',rank:'Chief',level:35,xp:8450,money:250000,job:'Police Department',bio:'หัวหน้าหน่วยงานตำรวจ'},{id:'c2',username:'admin_general',name:'Sarah Miller',dob:'20/08/1994',gender:'หญิง',phone:'080-000-0002',rank:'Captain',level:28,xp:6120,money:180000,job:'EMS',bio:'เจ้าหน้าที่แพทย์'},{id:'c3',username:'rank1_user',name:'John Anderson',dob:'15/01/1998',gender:'ชาย',phone:'080-000-0003',rank:'Sergeant',level:22,xp:5300,money:125000,job:'Police Department',bio:'เจ้าหน้าที่ภาคสนาม'},{id:'c4',username:'rank2_user',name:'Michael Brown',dob:'09/11/1996',gender:'ชาย',phone:'080-000-0004',rank:'Senior',level:17,xp:3200,money:90000,job:'News Agency',bio:'ผู้สื่อข่าว'},{id:'c5',username:'general_user',name:'David Wilson',dob:'02/06/2000',gender:'ชาย',phone:'080-000-0005',rank:'พลเมือง',level:8,xp:920,money:45000,job:'พลเมือง',bio:'ประชาชนทั่วไป'}]);
 if(!localStorage.getItem(DB.departments))W(DB.departments,DEPTS.map((name,i)=>({id:'d'+i,name,chief:['admin_big','admin_general','rank1_user','rank2_user','rank1_user','general_user'][i],members:i===0?['admin_big','rank1_user']:i===1?['admin_general']:i===4?['rank2_user']:[]})));
 if(!localStorage.getItem(DB.posts))W(DB.posts,[{id:'p1',type:'news',title:'ประกาศเปิดใช้งาน FriendHub RP',body:'ศูนย์กลางข่าวสารและบริการสำหรับประชาชนเปิดให้ใช้งานแล้ว',author:'admin_big',time:now(),image:''},{id:'p2',type:'news',title:'ข่าวเมืองประจำวัน',body:'โปรดติดตามประกาศจากหน่วยงานต่าง ๆ ผ่านระบบ FriendHub',author:'admin_general',time:now(),image:''}]);
 if(!localStorage.getItem(DB.ids))W(DB.ids,[{id:'id1',char:'c3',number:'CITY-10003',status:'ใช้งาน'}]);
 if(!localStorage.getItem(DB.licenses))W(DB.licenses,[{id:'l1',char:'c3',type:'ใบขับขี่',number:'DL-10003',status:'ปกติ',issued:'01/01/2026',expire:'01/01/2027'}]);
 if(!localStorage.getItem(DB.dispatch))W(DB.dispatch,[{id:'call1',type:'อุบัติเหตุ',location:'Downtown',detail:'รถชนบริเวณสี่แยก',sender:'general_user',status:'รอหน่วยงาน',time:now(),assigned:''}]);
 if(!localStorage.getItem(DB.appointments))W(DB.appointments,[{id:'a1',title:'ประชุม Police Department',date:'25/08/2026',time:'20:00',place:'Police HQ',owner:'admin_big',detail:'ประชุมเจ้าหน้าที่ประจำสัปดาห์'}]);
 if(!localStorage.getItem(DB.cases))W(DB.cases,[{id:'case1',number:'CASE-1001',citizen:'c3',charge:'ขับรถเร็วเกินกำหนด',detail:'ตรวจพบการใช้ความเร็วเกินที่กำหนด',fine:5000,status:'ปิดคดี',officer:'rank1_user',date:dateOnly()}]);
 if(!localStorage.getItem(DB.dm))W(DB.dm,[]);if(!localStorage.getItem(DB.deptPosts))W(DB.deptPosts,[{id:'dp1',dept:'Police Department',title:'ประชุมเจ้าหน้าที่',body:'ขอให้สมาชิกทุกคนเข้าประชุมเวลา 20:00',author:'admin_big',time:now()}]);
 if(!localStorage.getItem(DB.logs))W(DB.logs,[]);if(!localStorage.getItem(DB.settings))W(DB.settings,[{name:'FriendHub RP',city:'City Management',description:'ศูนย์กลางบริการเมือง Roleplay',logo:'',footer:'FriendHub RP • ระบบต้นแบบสำหรับเมือง Roleplay • ข้อมูลจัดเก็บในเบราว์เซอร์เครื่องนี้'}]);
 // migration: ensure every user has a character
 let chars=R(DB.chars),changed=false;R(DB.users).forEach(u=>{if(!chars.some(c=>c.username===u.username)){chars.push({id:uid('char'),username:u.username,name:u.username,dob:'',gender:'',phone:'',rank:'พลเมือง',level:1,xp:0,money:0,job:'พลเมือง',bio:''});changed=true}});if(changed)W(DB.chars,chars)
}
seed();
function loadRPSettings(){const s=R(RP_SETTINGS);if(s.roleNames) ROLE_NAMES=Object.assign({},ROLE_NAMES,s.roleNames);if(Array.isArray(s.ranks)&&s.ranks.length) RANKS=s.ranks;}
function saveRPSettings(){W(RP_SETTINGS,{roleNames:ROLE_NAMES,ranks:RANKS});}
function syncRoleNamesToUsers(){const a=R(DB.users);a.forEach(u=>u.roleName=ROLE_NAMES[u.role]||u.roleName||u.role);W(DB.users,a);}

const DEPTS=['Police Department','EMS','Fire Department','Government','News Agency','Mechanic'];
function R(k){try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}}
function W(k,v){localStorage.setItem(k,JSON.stringify(v));if(typeof fbPush==='function')fbPush(k,v)}
function uid(p='id'){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function me(){try{return JSON.parse(localStorage.getItem(DB.current))}catch(e){return null}}
function roleOk(rs){const u=me();return !!u&&rs.includes(u.role)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function now(){return new Date().toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'})}
function dateOnly(){return new Date().toLocaleDateString('th-TH')}
function logout(){localStorage.removeItem(DB.current);location.href='index.html'}
function logAudit(action,target,detail){let a=R(DB.audit);a.unshift({id:uid('audit'),time:now(),actor:me()?.username||'system',target:target||'',action,detail:detail||''});W(DB.audit,a.slice(0,1000))}
function logLogin(username,method='password'){let a=R(DB.loginLogs);a.unshift({id:uid('login'),time:now(),username,method});W(DB.loginLogs,a.slice(0,1000))}
function socialOf(username){return R(DB.socials).find(x=>x.username===username)||{username,discord:null,xbox:null}}
function saveSocial(s){let a=R(DB.socials),i=a.findIndex(x=>x.username===s.username);if(i<0)a.push(s);else a[i]=s;W(DB.socials,a)}

const LOGO_KEY='rp_logo';
function getLogo(){try{return JSON.parse(localStorage.getItem(LOGO_KEY))||''}catch(e){return ''}}
function setLogo(dataUrl){W(LOGO_KEY,dataUrl)}
function clearLogo(){localStorage.removeItem(LOGO_KEY);if(typeof fbPush==='function')fbPush(LOGO_KEY,null)}
function applyLogo(){document.querySelectorAll('.js-logo-slot').forEach(el=>{const l=getLogo();el.innerHTML=l?`<img src="${l}" alt="logo">`:(el.dataset.fallback||'F')})}
function seed(){
 if(!localStorage.getItem(DB.users))W(DB.users,[
  {username:'admin_big',password:'123',role:'superadmin',roleName:'แอดมินใหญ่',createdAt:now()},
  {username:'admin_general',password:'123',role:'admin',roleName:'แอดมินทั่วไป',createdAt:now()},
  {username:'rank1_user',password:'123',role:'rank1',roleName:'ผู้ใช้มียศ 1'},
  {username:'rank2_user',password:'123',role:'rank2',roleName:'ผู้ใช้มียศ 2'},
  {username:'general_user',password:'123',role:'user',roleName:'ผู้ใช้ทั่วไป',createdAt:now()}
 ]);
 if(!localStorage.getItem(DB.chars))W(DB.chars,[
  {id:'c1',username:'admin_big',name:'Alexander Morgan',dob:'12/04/1990',gender:'ชาย',phone:'080-000-0001',rank:'Chief',level:35,xp:8450,money:250000,job:'Police Department',bio:'หัวหน้าหน่วยงานตำรวจ'},
  {id:'c2',username:'admin_general',name:'Sarah Miller',dob:'20/08/1994',gender:'หญิง',phone:'080-000-0002',rank:'Captain',level:28,xp:6120,money:180000,job:'EMS',bio:'เจ้าหน้าที่แพทย์'},
  {id:'c3',username:'rank1_user',name:'John Anderson',dob:'15/01/1998',gender:'ชาย',phone:'080-000-0003',rank:'Sergeant',level:22,xp:5300,money:125000,job:'Police Department',bio:'เจ้าหน้าที่ภาคสนาม'},
  {id:'c4',username:'rank2_user',name:'Michael Brown',dob:'09/11/1996',gender:'ชาย',phone:'080-000-0004',rank:'Senior',level:17,xp:3200,money:90000,job:'News Agency',bio:'ผู้สื่อข่าว'},
  {id:'c5',username:'general_user',name:'David Wilson',dob:'02/06/2000',gender:'ชาย',phone:'080-000-0005',rank:'พลเมือง',level:8,xp:920,money:45000,job:'พลเมือง',bio:'ประชาชนทั่วไป'}
 ]);
 if(!localStorage.getItem(DB.departments))W(DB.departments,DEPTS.map((name,i)=>({id:'d'+i,name,chief:['admin_big','admin_general','rank1_user','rank2_user','rank1_user','general_user'][i],members:i===0?['admin_big','rank1_user']:i===1?['admin_general']:i===4?['rank2_user']:[]})));
 if(!localStorage.getItem(DB.posts))W(DB.posts,[
  {id:'p1',type:'news',title:'ประกาศเปิดใช้งาน FriendHub RP',body:'ศูนย์กลางข่าวสารและบริการสำหรับประชาชนเปิดให้ใช้งานแล้ว',author:'admin_big',time:now(),image:''},
  {id:'p2',type:'news',title:'ข่าวเมืองประจำวัน',body:'โปรดติดตามประกาศจากหน่วยงานต่าง ๆ ผ่านระบบ FriendHub',author:'admin_general',time:now(),image:''}
 ]);
 if(!localStorage.getItem(DB.ids))W(DB.ids,[{id:'id1',char:'c3',number:'CITY-10003',status:'ใช้งาน'}]);
 if(!localStorage.getItem(DB.licenses))W(DB.licenses,[{id:'l1',char:'c3',type:'ใบขับขี่',number:'DL-10003',status:'ปกติ',issued:'01/01/2026',expire:'01/01/2027'}]);
 if(!localStorage.getItem(DB.dispatch))W(DB.dispatch,[{id:'call1',type:'อุบัติเหตุ',location:'Downtown',detail:'รถชนบริเวณสี่แยก',sender:'general_user',status:'รอหน่วยงาน',time:now(),assigned:''}]);
 if(!localStorage.getItem(DB.appointments))W(DB.appointments,[{id:'a1',title:'ประชุม Police Department',date:'25/08/2026',time:'20:00',place:'Police HQ',owner:'admin_big',detail:'ประชุมเจ้าหน้าที่ประจำสัปดาห์'}]);
 if(!localStorage.getItem(DB.cases))W(DB.cases,[{id:'case1',number:'CASE-1001',citizen:'c3',charge:'ขับรถเร็วเกินกำหนด',detail:'ตรวจพบการใช้ความเร็วเกินที่กำหนด',fine:5000,status:'ปิดคดี',officer:'rank1_user',date:dateOnly()}]);
 if(!localStorage.getItem(DB.dm))W(DB.dm,[]);
 if(!localStorage.getItem(DB.deptPosts))W(DB.deptPosts,[{id:'dp1',dept:'Police Department',title:'ประชุมเจ้าหน้าที่',body:'ขอให้สมาชิกทุกคนเข้าประชุมเวลา 20:00',author:'admin_big',time:now()}]);
}
seed();
loadRPSettings();
syncRoleNamesToUsers();
function charOf(username){return R(DB.chars).find(c=>c.username===username)||null}
function levelNeed(level){return 1000+Math.max(0,level-1)*350}
function addXP(username,n){const a=R(DB.chars),c=a.find(x=>x.username===username);if(!c)return;c.xp+=n;while(c.xp>=levelNeed(c.level)){c.xp-=levelNeed(c.level);c.level++}W(DB.chars,a)}
function setCurrent(u){localStorage.setItem(DB.current,JSON.stringify(u))}
function protect(){if(!me()){location.href='index.html';return false}return true}
