import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
const supabase=createClient('https://nbqvdvtaqvfwkcvmhled.supabase.co','sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn',{auth:{persistSession:true,autoRefreshToken:true}});
const OWNER='laythaziz.3@gmail.com',$=s=>document.querySelector(s),feedback=$('#feedback');
const say=(t,e=false)=>{feedback.textContent=t;feedback.classList.toggle('error',e)};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=(v,c='IQD')=>Number(v||0).toLocaleString('en-US')+' '+(c==='IQD'?'د.ع':esc(c));
const statuses={pending:'قيد الانتظار',confirmed:'مؤكد',in_progress:'قيد التنفيذ',completed:'مكتمل',cancelled:'ملغي'};
const payments={unpaid:'غير مدفوع',awaiting_review:'بانتظار المراجعة',paid:'مدفوع',refunded:'مسترجع'};
let services=[],customers=[];
const empty=t=>'<div class="empty-state">'+t+'</div>';
const stats=a=>a.map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');
function orderTable(data){return data.length?'<table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الخدمة</th><th>السعر</th><th>السجل</th><th>الحالة</th><th>الدفع</th><th>التاريخ</th></tr></thead><tbody>'+data.map(o=>'<tr><td><b>'+esc(o.order_code)+'</b></td><td>'+esc(o.customers?.full_name||'—')+'</td><td>'+esc(o.service_name_snapshot)+'</td><td>'+money(o.price_snapshot,o.currency)+'</td><td><button class="history-button" type="button" data-order-history="'+o.id+'">السجل</button></td><td><select class="inline-select" data-order-status="'+o.id+'">'+Object.entries(statuses).map(([v,l])=>'<option value="'+v+'" '+(o.status===v?'selected':'')+'>'+l+'</option>').join('')+'</select></td><td><select class="inline-select" data-payment-status="'+o.id+'">'+Object.entries(payments).map(([v,l])=>'<option value="'+v+'" '+(o.payment_status===v?'selected':'')+'>'+l+'</option>').join('')+'</select></td><td>'+new Date(o.created_at).toLocaleDateString('ar-IQ')+'</td></tr>').join('')+'</tbody></table>':empty('لا توجد طلبات مسجلة بعد');}
async function loadOrders(recent=false){const {data,error}=await supabase.from('orders').select('id,order_code,service_name_snapshot,price_snapshot,currency,status,payment_status,created_at,customers(full_name)').order('created_at',{ascending:false}).limit(recent?6:100);if(error)throw error;const out=orderTable(data||[]);$(recent?'#recent-orders':'#orders-table').innerHTML=out;}
async function loadCustomers(){const {data,error}=await supabase.from('customers').select('id,full_name,phone,email,social_handle,created_at').order('created_at',{ascending:false}).limit(200);if(error)throw error;customers=data||[];$('#customers-table').innerHTML=customers.length?'<table><thead><tr><th>الاسم</th><th>الحساب</th><th>الهاتف</th><th>البريد</th><th>التاريخ</th></tr></thead><tbody>'+customers.map(c=>'<tr><td>'+esc(c.full_name)+'</td><td>'+esc(c.social_handle||'—')+'</td><td>'+esc(c.phone||'—')+'</td><td>'+esc(c.email||'—')+'</td><td>'+new Date(c.created_at).toLocaleDateString('ar-IQ')+'</td></tr>').join('')+'</tbody></table>':empty('لا يوجد عملاء بعد');$('#order-customer').innerHTML='<option value="">اختر العميل</option>'+customers.map(c=>'<option value="'+c.id+'">'+esc(c.full_name)+'</option>').join('');}
async function loadServices(){
 const {data,error}=await supabase.from('services').select('id,service_code,name_ar,description_ar,price,currency,is_active,sort_order').order('sort_order');
 if(error)throw error;services=data||[];
 const activeCount=services.filter(s=>s.is_active).length;
 $('#service-total-label').textContent=activeCount+' خدمة مفعّلة من أصل '+services.length;
 $('#services-table').innerHTML=services.map(s=>'<div class="service-admin-row" data-service-row="'+esc(s.service_code||'')+'"><span class="service-code">'+esc(s.service_code||'—')+'</span><input class="service-name-input" aria-label="اسم الخدمة" value="'+esc(s.name_ar)+'"><input class="service-price-input" aria-label="السعر" type="number" min="0" step="1" value="'+Number(s.price||0)+'"><label class="active-toggle"><input type="checkbox" '+(s.is_active?'checked':'')+'> مفعّلة</label><button type="button" data-save-service="'+s.id+'">حفظ</button><button type="button" class="service-delete-button" data-delete-service="'+s.id+'">'+(s.is_active?'إزالة':'معطّلة')+'</button></div>').join('');
 $('#order-service').innerHTML='<option value="">اختر الخدمة</option>'+services.filter(s=>s.is_active).map(s=>'<option value="'+s.id+'">'+esc(s.service_code)+' — '+esc(s.name_ar)+' ('+money(s.price,s.currency)+')</option>').join('');
}
async function loadAnalytics(){
 const [{data,error},{count:views},{count:beats},{count:ordersCount}]=await Promise.all([
  supabase.from('analytics_events').select('event_type,page_path,created_at,visitor_session_id,ip_address,device_type,os_name,browser_name,visitor_name').order('created_at',{ascending:false}).limit(2000),
  supabase.from('analytics_events').select('*',{count:'exact',head:true}).eq('event_type','page_view'),
  supabase.from('analytics_events').select('*',{count:'exact',head:true}).eq('event_type','heartbeat'),
  supabase.from('orders').select('*',{count:'exact',head:true})
 ]);
 if(error)throw error;
 const events=data||[],sessions=new Map();
 for(const event of events){
  const key=event.visitor_session_id||event.ip_address||String(event.created_at);
  let item=sessions.get(key);
  if(!item){item={session:key,ip:event.ip_address||'غير متاح',device:event.device_type||'—',os:event.os_name||'—',browser:event.browser_name||'—',name:event.visitor_name||'—',views:0,beats:0,last:event.created_at,pages:new Set()};sessions.set(key,item);}
  if(event.event_type==='page_view'){item.views++;if(event.page_path)item.pages.add(event.page_path);}
  if(event.event_type==='heartbeat')item.beats++;
  if(new Date(event.created_at)>new Date(item.last))item.last=event.created_at;
  if(event.visitor_name)item.name=event.visitor_name;
 }
 const visitors=[...sessions.values()].sort((a,b)=>new Date(b.last)-new Date(a.last));
 const active=visitors.filter(v=>Date.now()-new Date(v.last).getTime()<30000).length;
 const ips=new Set(visitors.map(v=>v.ip).filter(ip=>ip!=='غير متاح'));
 $('#analytics-stats').innerHTML=stats([['الطلبات',ordersCount??0],['مشاهدات الصفحات',views??0],['الزوار النشطون الآن',active],['عناوين IP المسجلة',ips.size],['نبضات النشاط',beats??0]]);
 const query=($('#visitor-search')?.value||'').trim().toLocaleLowerCase();
 const filtered=visitors.filter(v=>[v.ip,v.name,v.device,v.os,v.browser,[...v.pages].join(' ')].join(' ').toLocaleLowerCase().includes(query));
 $('#visitor-table').innerHTML=filtered.length?'<table><thead><tr><th>الاسم</th><th>IP الكامل</th><th>الجهاز</th><th>النظام</th><th>المتصفح</th><th>مشاهدات</th><th>نبضات 10 ثوانٍ</th><th>آخر ظهور</th><th>الصفحات</th></tr></thead><tbody>'+filtered.map(v=>'<tr><td>'+esc(v.name)+'</td><td dir="ltr">'+esc(v.ip)+'</td><td>'+esc(v.device)+'</td><td>'+esc(v.os)+'</td><td>'+esc(v.browser)+'</td><td>'+v.views+'</td><td>'+v.beats+'</td><td>'+new Date(v.last).toLocaleString('ar-IQ')+'</td><td>'+esc([...v.pages].join('، ')||'—')+'</td></tr>').join('')+'</tbody></table>':empty('لا توجد زيارات مطابقة. سيظهر الزائر بعد موافقته على التتبع.');
 $('#analytics-table').innerHTML=events.length?'<table><thead><tr><th>الحدث</th><th>IP</th><th>الصفحة</th><th>الجهاز</th><th>التاريخ</th></tr></thead><tbody>'+events.slice(0,100).map(x=>'<tr><td>'+(x.event_type==='page_view'?'مشاهدة صفحة':'نبضة نشاط')+'</td><td dir="ltr">'+esc(x.ip_address||'—')+'</td><td>'+esc(x.page_path||'—')+'</td><td>'+esc([x.device_type,x.os_name,x.browser_name].filter(Boolean).join(' / ')||'—')+'</td><td>'+new Date(x.created_at).toLocaleString('ar-IQ')+'</td></tr>').join('')+'</tbody></table>':empty('لا توجد أحداث مسجلة بعد.');
}
async function loadOverview(){const [c,o,s,a]=await Promise.all([supabase.from('customers').select('*',{count:'exact',head:true}),supabase.from('orders').select('*',{count:'exact',head:true}),supabase.from('services').select('*',{count:'exact',head:true}),supabase.from('analytics_events').select('*',{count:'exact',head:true})]);$('#overview-stats').innerHTML=stats([['العملاء',c.count??'—'],['الطلبات',o.count??'—'],['الخدمات',s.count??'—'],['الأحداث',a.count??'—']]);await loadOrders(true);}
async function refreshAll(){try{await Promise.all([loadOverview(),loadCustomers(),loadServices(),loadAnalytics()]);}catch(e){say(e.message||'تعذر تحميل البيانات',true);}}
function view(n){document.querySelectorAll('.dashboard-view').forEach(v=>{v.hidden=v.id!=='view-'+n;});document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===n));$('#view-title').textContent=({overview:'نظرة عامة',orders:'إدارة الطلبات',customers:'العملاء',services:'الخدمات والأسعار',analytics:'الإحصائيات'})[n];}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.go)));
document.addEventListener('click',async e=>{const b=e.target.closest('[data-order-history]');if(!b)return;try{const {data,error}=await supabase.from('order_history').select('old_status,new_status,note,created_at').eq('order_id',b.dataset.orderHistory).order('created_at',{ascending:false});if(error)throw error;$('#order-history-panel').hidden=false;$('#order-history-table').innerHTML=data?.length?'<table><thead><tr><th>من</th><th>إلى</th><th>ملاحظة</th><th>التاريخ</th></tr></thead><tbody>'+data.map(x=>'<tr><td>'+esc(statuses[x.old_status]||'—')+'</td><td>'+esc(statuses[x.new_status]||x.new_status)+'</td><td>'+esc(x.note||'—')+'</td><td>'+new Date(x.created_at).toLocaleString('ar-IQ')+'</td></tr>').join('')+'</tbody></table>':empty('لا توجد تغييرات مسجلة لهذا الطلب.');$('#order-history-panel').scrollIntoView({behavior:'smooth',block:'nearest'});}catch(x){say(x.message,true);}});
document.addEventListener('change',async e=>{const a=e.target.closest('[data-order-status]'),p=e.target.closest('[data-payment-status]');try{if(a){const {error}=await supabase.from('orders').update({status:a.value}).eq('id',a.dataset.orderStatus);if(error)throw error;say('تم تحديث حالة الطلب.');await loadOrders();}if(p){const {error}=await supabase.from('orders').update({payment_status:p.value}).eq('id',p.dataset.paymentStatus);if(error)throw error;say('تم تحديث حالة الدفع.');await loadOrders();}}catch(x){say(x.message,true);}});
$('#services-table').addEventListener('click',async e=>{
 const remove=e.target.closest('[data-delete-service]');
 if(remove){const service=services.find(s=>s.id===remove.dataset.deleteService);if(!service||!confirm('إزالة الخدمة من الموقع؟ ستبقى بيانات الطلبات السابقة محفوظة.'))return;remove.disabled=true;try{const {error}=await supabase.from('services').update({is_active:false}).eq('id',service.id);if(error)throw error;say('تمت إزالة الخدمة من الموقع.');await Promise.all([loadServices(),loadOverview()]);}catch(x){say(x.message,true);}finally{remove.disabled=false;}return;}
 const b=e.target.closest('[data-save-service]');if(!b)return;const row=b.closest('.service-admin-row'),name=row.querySelector('.service-name-input').value.trim(),price=Number(row.querySelector('.service-price-input').value),active=row.querySelector('input[type=checkbox]').checked;if(!name||!Number.isFinite(price)||price<0)return say('تحقق من الاسم والسعر.',true);b.disabled=true;try{const {error}=await supabase.from('services').update({name_ar:name,price,is_active:active}).eq('id',b.dataset.saveService);if(error)throw error;say('تم حفظ الخدمة والسعر.');await loadServices();}catch(x){say(x.message,true);}finally{b.disabled=false;}});
$('#service-filter').addEventListener('input',e=>{const q=e.target.value.trim().toLocaleLowerCase();document.querySelectorAll('.service-admin-row').forEach(r=>r.hidden=!r.textContent.toLocaleLowerCase().includes(q));});

$('#new-service-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const name=$('#new-service-name').value.trim(),description=$('#new-service-description').value.trim(),price=Number($('#new-service-price').value);
 if(!name||!Number.isFinite(price)||price<0)return say('تحقق من اسم الخدمة والسعر.',true);
 const nextCode=String(Math.max(0,...services.map(s=>Number(s.service_code)||0))+1).padStart(2,'0');
 const nextSort=Math.max(0,...services.map(s=>Number(s.sort_order)||0))+1;
 const button=e.submitter||e.target.querySelector('[type=submit]');button.disabled=true;
 try{
  const {error}=await supabase.from('services').insert({category:'instagram',service_code:nextCode,name_ar:name,description_ar:description,name_en:'',description_en:'',price,currency:'IQD',is_active:true,sort_order:nextSort});
  if(error)throw error;e.target.reset();$('#new-service-price').value='0';say('تمت إضافة الخدمة رقم '+nextCode+'، وسيظهر العدد الجديد في الموقع.');await Promise.all([loadServices(),loadOverview()]);
 }catch(x){say(x.message||'تعذرت إضافة الخدمة.',true);}finally{button.disabled=false;}
});
$('#visitor-search').addEventListener('input',()=>loadAnalytics().catch(e=>say(e.message,true)));
$('#refresh-analytics').addEventListener('click',()=>loadAnalytics().then(()=>say('تم تحديث الإحصائيات.')).catch(e=>say(e.message,true)));
\n$('#new-customer-form').addEventListener('submit',async e=>{e.preventDefault();const payload={full_name:$('#customer-name').value.trim(),phone:$('#customer-phone').value.trim()||null,email:$('#customer-email').value.trim()||null,social_handle:$('#customer-handle').value.trim()||null,notes:$('#customer-notes').value.trim()||null};try{const {error}=await supabase.from('customers').insert(payload);if(error)throw error;e.target.reset();say('تم حفظ العميل.');await loadCustomers();}catch(x){say(x.message,true);}});
$('#new-order-form').addEventListener('submit',async e=>{e.preventDefault();const customer=$('#order-customer').value,service=services.find(s=>s.id===$('#order-service').value);if(!customer||!service)return say('اختر العميل والخدمة.',true);if(Number(service.price)<=0)return say('حدد سعر الخدمة أولاً.',true);try{const {error}=await supabase.from('orders').insert({customer_id:customer,service_id:service.id,service_name_snapshot:service.name_ar,price_snapshot:service.price,currency:service.currency,status:'pending',payment_method:$('#order-payment').value||null,customer_note:$('#order-note').value.trim()||null});if(error)throw error;e.target.reset();say('تم إنشاء الطلب.');await Promise.all([loadOrders(),loadOverview()]);}catch(x){say(x.message,true);}});
$('#refresh-orders').addEventListener('click',()=>loadOrders().then(()=>say('تم تحديث الطلبات.')).catch(e=>say(e.message,true)));$('#refresh-customers').addEventListener('click',()=>loadCustomers().then(()=>say('تم تحديث العملاء.')).catch(e=>say(e.message,true)));$('#logout').addEventListener('click',async()=>{await supabase.auth.signOut();location.replace('/admin.html');});
const {data:{session}}=await supabase.auth.getSession();if(!session||session.user.email?.toLowerCase()!==OWNER)location.replace('/admin.html');else{const {data:admin,error}=await supabase.from('admin_users').select('role,is_active').eq('user_id',session.user.id).maybeSingle();if(error||!admin||admin.role!=='owner'||!admin.is_active){await supabase.auth.signOut();location.replace('/admin.html');}else{$('#admin-status').textContent='دخول بصلاحية المالك — '+OWNER;await refreshAll();setInterval(()=>{if(!document.hidden)loadAnalytics().catch(e=>say(e.message,true));},10000);}}