
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

// Services: compact search and on-demand order flow; no credentials are collected.
(()=>{
 const order=document.getElementById('service-order');
 const search=document.getElementById('service-search');
 const groups=[...document.querySelectorAll('.offer-group')];
 const openOrder=()=>{
  if(!order)return;
  order.hidden=false;
  order.classList.add('visible');
  order.scrollIntoView({behavior:'smooth',block:'start'});
 };
 document.querySelectorAll('[data-open-order]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const field=document.getElementById('orderNote');if(field&&!field.value.trim())field.value='طلب عام من باقة Instagram — أرجو التواصل لتحديد الخدمة';openOrder();}));
 document.querySelectorAll('.offer-item').forEach(item=>{
  item.setAttribute('tabindex','0');item.setAttribute('role','button');
  item.addEventListener('click',()=>{const label=item.innerText.replace(/^\s*\d+\s*/, '').trim();const field=document.getElementById('orderNote');if(field)field.value=label;openOrder();});
  item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();item.click();}});
 });
 search?.addEventListener('input',()=>{
  const query=search.value.trim().toLocaleLowerCase();
  groups.forEach(group=>{
   const items=[...group.querySelectorAll('.offer-item')];
   let matches=0;
   items.forEach(item=>{const match=!query||item.textContent.toLocaleLowerCase().includes(query);item.hidden=!match;if(match)matches++;});
   group.hidden=matches===0;
   if(query&&matches)group.open=true;
   if(!query)group.open=false;
  });
 });
 document.querySelector('[data-copy-payment]')?.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('7168843873');const b=document.querySelector('[data-copy-payment]');b.textContent='تم النسخ ✓';setTimeout(()=>b.textContent='نسخ الرقم',1600);}
  catch{alert('انسخ الرقم يدوياً: 7168843873');}
 });
 document.querySelector('#serviceForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const input=document.querySelector('#igUser');
  const user=input.value.trim().replace(/^@/,'');
  if(!/^[a-zA-Z0-9._]{1,30}$/.test(user)){
   input.setCustomValidity('اكتب اسم مستخدم Instagram صحيحاً بدون رابط الحساب.');
   input.reportValidity();
   return;
  }
  input.setCustomValidity('');
  const note=document.querySelector('#orderNote').value.trim();
  const msg=[
   'طلب خدمة Instagram من بروفايل ليث',
   'اسم المستخدم: @'+user,
   'السعر المعروض: 20,000 د.ع',
   'الخدمة: '+(note||'يرجى التواصل لتحديد الخدمة'),
   'سأرفق إثبات التحويل في المحادثة.'
  ].join('\n');
  window.open('https://t.me/share/url?url='+encodeURIComponent('https://laythaziz.vercel.app')+'&text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
 });
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
