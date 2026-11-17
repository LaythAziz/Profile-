
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.skill').forEach(skill=>skill.addEventListener('click',()=>{skill.setAttribute('aria-pressed',String(skill.getAttribute('aria-pressed')!=='true'));}));
document.querySelectorAll('[data-project-card]').forEach(card=>{
 const toggle=()=>card.setAttribute('aria-pressed',String(card.getAttribute('aria-pressed')!=='true'));
 card.addEventListener('click',event=>{if(event.target.closest('a'))return;toggle();});
 card.addEventListener('keydown',event=>{if(event.target!==card)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
});
if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}
const sections=[...document.querySelectorAll('main section[id]')],navLinks=[...document.querySelectorAll('.navlinks a')],progress=document.querySelector('#progress');
function onScroll(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';let current=sections.filter(s=>scrollY>=s.offsetTop-170).pop();navLinks.forEach(a=>{const active=!!current&&a.getAttribute('href')==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
const hero=document.querySelector('.hero'),glow=document.querySelector('#gridGlow');
if(!reduceMotion&&matchMedia('(pointer:fine)').matches){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();glow.style.setProperty('--mx',(e.clientX-r.left)+'px');glow.style.setProperty('--my',(e.clientY-r.top)+'px')});}
const canvas=document.querySelector('#particles'),ctx=canvas?.getContext('2d');let points=[],width=0,height=0,raf=0,heroVisible=true;
const particlesEnabled=!reduceMotion&&!matchMedia('(max-width:650px)').matches&&!navigator.connection?.saveData;
function resizeCanvas(){
 if(!canvas||!ctx||!particlesEnabled)return;
 const dpr=Math.min(devicePixelRatio||1,1.25);width=canvas.clientWidth;height=canvas.clientHeight;
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const count=Math.min(34,Math.max(12,Math.floor(width/34)));
 points=Array.from({length:count},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18}));
}
function draw(){
 if(!ctx||document.hidden||!heroVisible||!particlesEnabled)return;
 ctx.clearRect(0,0,width,height);
 for(let i=0;i<points.length;i++){
  const p=points[i];p.x+=p.vx;p.y+=p.vy;
  if(p.x<0||p.x>width)p.vx*=-1;if(p.y<0||p.y>height)p.vy*=-1;
  ctx.fillStyle='rgba(197,255,72,.55)';ctx.fillRect(p.x,p.y,1.3,1.3);
  for(let j=i+1;j<points.length;j++){
   const q=points[j],dist=Math.hypot(p.x-q.x,p.y-q.y);
   if(dist<105){ctx.strokeStyle='rgba(81,245,220,'+((1-dist/105)*.11)+')';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
  }
 }
 raf=requestAnimationFrame(draw);
}
if(particlesEnabled&&canvas&&ctx){
 resizeCanvas();draw();window.addEventListener('resize',resizeCanvas,{passive:true});
 if('IntersectionObserver'in window){const particleObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(heroVisible&&!document.hidden)draw();else cancelAnimationFrame(raf);},{threshold:0});particleObserver.observe(document.querySelector('.hero'));}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else if(heroVisible)draw();});
}

// Services catalog and order submission
(()=>{
 const order=document.getElementById('service-order');
 const search=document.getElementById('service-search');
 const groups=[...document.querySelectorAll('.offer-group')];
 const list=document.querySelector('.offer-list');
 const form=document.getElementById('serviceForm');
 const feedback=document.getElementById('orderFeedback');
 const payment=document.getElementById('paymentAfterOrder');
 const hiddenCode=document.getElementById('serviceCode');
 const openOrder=()=>{
  if(!order)return;
  order.hidden=false;order.classList.add('visible');
  order.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
 };
 const say=(text,error=false)=>{if(feedback){feedback.textContent=text;feedback.dataset.error=error?'true':'false';}};
 const formatPrice=(value,currency='IQD')=>Number(value||0)>0?Number(value).toLocaleString('en-US')+' '+(currency==='IQD'?'د.ع':currency):'السعر عند الطلب';
 const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function loadCatalog(){
  try{
   const response=await fetch('https://nbqvdvtaqvfwkcvmhled.supabase.co/rest/v1/services?select=service_code,name_ar,description_ar,price,currency,is_active&order=sort_order.asc',{
    headers:{apikey:'sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn',Authorization:'Bearer sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn'}
   });
   if(!response.ok)throw new Error('catalog');
   const services=await response.json();
   const byCode=new Map(services.map(s=>[s.service_code,s]));
   document.querySelectorAll('.offer-item').forEach(item=>{
    const code=item.querySelector('.offer-no')?.textContent.trim().padStart(2,'0');
    const service=byCode.get(code);
    if(!service){item.hidden=true;return;}
    item.dataset.serviceCode=service.service_code;
    item.dataset.active=String(service.is_active);
    item.hidden=!service.is_active;
    const label=item.querySelectorAll('span')[1];
    if(label)label.textContent=service.name_ar+(service.description_ar?' — '+service.description_ar:'')+' · '+formatPrice(service.price,service.currency);
   });
   groups.forEach(group=>{
    const items=[...group.querySelectorAll('.offer-item')].filter(item=>!item.hidden);
    const count=group.querySelector('.group-count');
    if(count)count.textContent=items.length+' خدمات';
    group.hidden=items.length===0;
   });
  }catch{/* Keep the verified static catalog visible if the API is temporarily unavailable. */}
 }
 document.querySelectorAll('[data-open-order]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();hiddenCode.value='';say('اختر خدمة محددة من القائمة حتى نسجل الطلب ونحسب سعره.');
  const field=document.getElementById('orderNote');if(field)field.value='';
  if(payment)payment.hidden=true;openOrder();
 }));
 list?.addEventListener('click',event=>{
  const item=event.target.closest('.offer-item');if(!item||item.hidden)return;
  const code=item.dataset.serviceCode||item.querySelector('.offer-no')?.textContent.trim().padStart(2,'0');
  hiddenCode.value=code||'';
  const label=item.querySelectorAll('span')[1]?.textContent.trim()||item.textContent.trim();
  const field=document.getElementById('orderNote');if(field)field.value=label;
  say('تم اختيار الخدمة رقم '+code+'. أدخل اسم المستخدم لتأكيد الطلب.');
  if(payment)payment.hidden=true;openOrder();
 });
 list?.addEventListener('keydown',event=>{const item=event.target.closest('.offer-item');if(item&&(event.key==='Enter'||event.key===' ')){event.preventDefault();item.click();}});
 search?.addEventListener('input',()=>{
  const query=search.value.trim().toLocaleLowerCase();
  groups.forEach(group=>{
   const items=[...group.querySelectorAll('.offer-item')];let matches=0;
   items.forEach(item=>{const match=item.dataset.active!=='false'&&(!query||item.textContent.toLocaleLowerCase().includes(query));item.hidden=!match;if(match)matches++;});
   group.hidden=matches===0;if(query&&matches)group.open=true;if(!query)group.open=false;
  });
 });
 document.querySelector('[data-copy-payment]')?.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('7168843873');const b=document.querySelector('[data-copy-payment]');b.textContent='تم النسخ ✓';setTimeout(()=>b.textContent='نسخ الرقم',1600);}
  catch{say('انسخ الرقم يدوياً: 7168843873',true);}
 });
 form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const input=document.getElementById('igUser'),user=input.value.trim().replace(/^@/,'');
  const code=hiddenCode.value.trim(),note=document.getElementById('orderNote').value.trim();
  if(!/^[A-Za-z0-9._]{1,30}$/.test(user)){input.setCustomValidity('اكتب اسم مستخدم Instagram صحيحاً.');input.reportValidity();return;}
  input.setCustomValidity('');
  if(!/^\d{2}$/.test(code)){say('اختَر خدمة محددة من قائمة الخدمات أولاً.',true);return;}
  const button=document.getElementById('submitServiceOrder');button.disabled=true;button.textContent='جارٍ تسجيل الطلب…';say('يتم حفظ طلبك بشكل آمن…');
  try{
   const response=await fetch('https://nbqvdvtaqvfwkcvmhled.supabase.co/functions/v1/create-profile-order',{
    method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn'},
    body:JSON.stringify({username:user,serviceCode:code,note})
   });
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'تعذر إنشاء الطلب.');
   if(payment)payment.hidden=false;
   const confirm=document.getElementById('orderConfirmation');
   if(confirm)confirm.textContent='تم تسجيل طلبك '+result.orderCode+' — '+result.service+' — '+Number(result.price).toLocaleString('en-US')+' د.ع. حوّل المبلغ ثم أرسل الإثبات.';
   const message=['طلب خدمة Instagram من موقع ليث','رقم الطلب: '+result.orderCode,'اسم المستخدم: @'+user,'الخدمة: '+result.service,'المبلغ: '+Number(result.price).toLocaleString('en-US')+' د.ع','سأرفق إثبات الدفع.'].join('\n');
   const telegram=document.getElementById('orderTelegram');
   if(telegram)telegram.href='https://t.me/share/url?url='+encodeURIComponent('https://laythaziz.vercel.app')+'&text='+encodeURIComponent(message);
   say('تم إنشاء الطلب بنجاح. احتفظ برقم الطلب.');
   form.querySelector('button[type="submit"]').hidden=false;
   form.querySelector('button[type="submit"]').textContent='تأكيد طلب آخر';
  }catch(error){say(error.message||'تعذر إرسال الطلب. حاول لاحقاً.',true);}
  finally{button.disabled=false;button.textContent='تأكيد الطلب';}
 });
 loadCatalog();
})();

/* Non-blocking Telegram proxy refresh: keep the last good list visible. */
(()=>{
 const list=document.getElementById('proxy-live-list'),status=document.getElementById('proxy-live-status'),button=document.getElementById('proxy-refresh-now'),chip=document.getElementById('proxy-state-chip'),chipLabel=document.getElementById('proxy-state-label'),progress=document.querySelector('.proxy-progress-track');
 if(!list||!status||!button)return;
 let loading=false,lastSuccess=0,lastAttempt=0;
 const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const setState=(state,label)=>{if(chip)chip.dataset.state=state;if(chipLabel)chipLabel.textContent=label;};
 const skeleton='<div class="proxy-skeleton"><span></span><i></i><b></b></div>'.repeat(3);
 function render(proxies){
  const cards=proxies.map((proxy,index)=>{let url;try{url=new URL(String(proxy.href||''));}catch{return '';}if(url.protocol!=='https:'||url.hostname!=='t.me'||url.pathname!=='/proxy')return '';return '<article class="proxy-entry"><div><strong>'+escapeHtml(proxy.server||'Telegram MTProto')+'</strong><small>MTProto · Port '+escapeHtml(proxy.port||'—')+' · '+(index===0?'خادم مقترح':'متاح للإضافة')+'</small></div><a href="'+escapeHtml(url.href)+'" target="_blank" rel="noopener noreferrer">إضافة إلى Telegram</a></article>';}).join('');
  if(!cards)throw new Error('No valid proxy links');list.innerHTML=cards;list.setAttribute('aria-busy','false');
 }
 async function refresh(){
  if(loading)return;loading=true;lastAttempt=Date.now();button.disabled=true;button.classList.add('is-refreshing');button.setAttribute('aria-busy','true');if(progress)progress.classList.add('is-active');setState('loading','يتم التحديث');
  status.textContent=list.querySelector('.proxy-entry')?'نتحقق من القائمة ونُبقي الخوادم الحالية ظاهرة…':'نجهّز قائمة الاتصال…';list.setAttribute('aria-busy','true');if(!list.children.length)list.innerHTML=skeleton;
  try{
   const response=await fetch('/api/telegram-proxies',{headers:{'Accept':'application/json'},cache:'no-store'});if(!response.ok)throw new Error('Proxy feed unavailable');const data=await response.json();if(!Array.isArray(data.proxies)||!data.proxies.length)throw new Error('Empty proxy feed');render(data.proxies);lastSuccess=Date.now();
   const count=list.querySelectorAll('.proxy-entry').length,updated=data.updatedAt?new Date(data.updatedAt).toLocaleTimeString('ar-IQ',{hour:'2-digit',minute:'2-digit'}):'الآن';status.textContent='القائمة جاهزة · '+count+' خوادم · آخر تحديث '+updated;setState('ready','القائمة جاهزة');
  }catch(error){
   list.setAttribute('aria-busy','false');if(!list.querySelector('.proxy-entry'))list.innerHTML='<div class="proxy-empty"><span>تعذّر تحميل القائمة حالياً</span><small>اضغط تحديث القائمة للمحاولة مرة أخرى.</small></div>';status.textContent=list.querySelector('.proxy-entry')?'تعذّر التحديث الآن؛ ما زالت القائمة السابقة متاحة.':'تعذّر تحميل القائمة. حاول مجدداً بعد قليل.';setState('error','تعذّر التحديث');
  }finally{loading=false;button.disabled=false;button.classList.remove('is-refreshing');button.removeAttribute('aria-busy');if(progress)progress.classList.remove('is-active');}
 }
 button.addEventListener('click',refresh);refresh();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-Math.max(lastSuccess,lastAttempt)>10*60*1000)refresh();});
 setInterval(()=>{if(!document.hidden)refresh();},10*60*1000);
})();;;


/* --- Original interaction module boundary --- */


/* Always start at the hero on a fresh load/refresh; in-page links still work normally. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.addEventListener('pageshow', () => window.scrollTo({top:0,left:0,behavior:'auto'}));

// Privacy-friendly page-view counter: stores only the page path, not personal identifiers.
(()=>{if(document.visibilityState==='prerender')return;fetch('https://nbqvdvtaqvfwkcvmhled.supabase.co/functions/v1/track-profile-view',{method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_0CUY19touCOxCcF6hu7sFQ_MIMxNmRn'},body:JSON.stringify({path:location.pathname}),keepalive:true}).catch(()=>{});})();
