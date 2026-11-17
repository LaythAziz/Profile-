import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
const supabase=createClient('https://nbqvdvtaqvfwkcvmhled.supabase.co','sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn',{auth:{persistSession:true,autoRefreshToken:true}});
const OWNER='laythaziz.3@gmail.com';
const status=document.querySelector('#admin-status'),feedback=document.querySelector('#feedback'),content=document.querySelector('#admin-content'),stats=document.querySelector('#stats');
const say=(text,error=false)=>{feedback.textContent=text;feedback.classList.toggle('error',error)};
const {data:{session}}=await supabase.auth.getSession();
if(!session||session.user.email?.toLowerCase()!==OWNER){location.replace('/admin.html');}
else{
 const {data:admin,error}=await supabase.from('admin_users').select('role,is_active').eq('user_id',session.user.id).maybeSingle();
 if(error||!admin||admin.role!=='owner'||!admin.is_active){await supabase.auth.signOut();location.replace('/admin.html');}
 else{
  status.textContent='تم التحقق من بريدك وصلاحية المالك.';
  content.hidden=false;
  const queries=await Promise.all([
   supabase.from('customers').select('*',{count:'exact',head:true}),
   supabase.from('orders').select('*',{count:'exact',head:true}),
   supabase.from('services').select('*',{count:'exact',head:true}),
   supabase.from('analytics_events').select('*',{count:'exact',head:true})
  ]);
  const labels=['العملاء','الطلبات','الخدمات','الأحداث المسجلة'];
  stats.innerHTML=queries.map((q,i)=>'<div class="stat"><span>'+labels[i]+'</span><strong>'+((q.error)?'—':q.count??0)+'</strong></div>').join('');
  if(queries.some(q=>q.error))say('تعذر تحميل بعض الإحصائيات؛ تحقق من إعدادات Data API.',true);
 }
}
document.querySelector('#logout').addEventListener('click',async()=>{await supabase.auth.signOut();location.replace('/admin.html');});