/* J&C Dreamscape — shared behavior */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CONTACT={phone:'7066120447',email:'dreamscape.jc@gmail.com'};

/* ---- EDIT THESE: starting price rates used by the instant quote calculator ---- */
const RATES={
  lawn:{label:'Sod / Bermuda lawn install',unit:'sq ft',min:200,max:6000,step:100,def:1500,lo:1.1,hi:2.2},
  mow:{label:'Lawn care visit',unit:'sq ft',min:1000,max:20000,step:500,def:5000,lo:.012,hi:.03,freq:true},
  patio:{label:'Patio or paver walkway',unit:'sq ft',min:50,max:1000,step:10,def:200,lo:14,hi:26},
  wall:{label:'Retaining wall',unit:'linear ft',min:10,max:200,step:5,def:30,lo:35,hi:70},
  junk:{label:'Junk removal',unit:'truck loads',min:.25,max:4,step:.25,def:1,lo:150,hi:400}
};
const FREQ={once:0,weekly:.15,biweekly:.10,monthly:.05};

/* header, promo bar, menu */
const hd=$('header.top');addEventListener('scroll',()=>hd.classList.toggle('scrolled',scrollY>8),{passive:true});
$('.burger')?.addEventListener('click',e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)});
$('.dd>button')?.addEventListener('click',e=>{const d=e.currentTarget.parentElement;d.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',d.classList.contains('open'))});
$('.promo button')?.addEventListener('click',()=>$('.promo').remove());
$$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());

/* hero headline: split into words that rise in */
$$('[data-split]').forEach(el=>{let i=0;el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(' ')});

/* animated counters */
function count(el){const to=parseFloat(el.dataset.to),d=el.dataset.dec|0,t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-k,3);el.textContent=(to*e).toFixed(d);if(k<1)requestAnimationFrame(f)})(t0)}
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('show');if(x.target.dataset.to)count(x.target);io.unobserve(x.target)}}),{threshold:.2});
$$('.rv,[data-to]').forEach(e=>io.observe(e));

/* magnetic buttons */
if(!reduce&&matchMedia('(hover:hover)').matches)$$('.btn').forEach(b=>{
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.28}px)`});
  b.addEventListener('pointerleave',()=>b.style.transform='')});

/* hero: swaying grass field reacting to the cursor, drifting pollen, sun parallax */
const cv=$('#grass');
if(cv&&!reduce){
  const c=cv.getContext('2d');let W,H,blades=[],motes=[],mx=-999,my=-999,vx=0,on=true,last=0;
  const dpr=Math.min(devicePixelRatio||1,2);
  function size(){const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.floor(W/(W<700?5:4));blades=Array.from({length:n},(_,i)=>({x:i/n*W+Math.random()*6,h:50+Math.random()*(H*.2),p:Math.random()*6.28,s:.6+Math.random()*.8,g:Math.random()}));
    motes=Array.from({length:28},()=>({x:Math.random()*W,y:Math.random()*H*.8,r:1+Math.random()*2,v:.15+Math.random()*.4,p:Math.random()*6}))}
  size();addEventListener('resize',size);
  cv.parentElement.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();vx=e.clientX-mx;mx=e.clientX-r.left;my=e.clientY-r.top;
    const s=$('.sun');if(s)s.style.transform=`translate(${(mx/W-.5)*-40}px,${(my/H-.5)*-30}px)`});
  cv.parentElement.addEventListener('pointerleave',()=>{mx=my=-999});
  new IntersectionObserver(e=>on=e[0].isIntersecting).observe(cv);
  (function frame(t){requestAnimationFrame(frame);if(!on||t-last<16)return;last=t;c.clearRect(0,0,W,H);
    const base=H,time=t/1000;
    for(const m of motes){m.y-=m.v;m.x+=Math.sin(time+m.p)*.4;if(m.y<-5){m.y=H*.85;m.x=Math.random()*W}c.fillStyle='rgba(255,224,140,.55)';c.beginPath();c.arc(m.x,m.y,m.r,0,6.3);c.fill()}
    for(const b of blades){const wind=Math.sin(time*1.4*b.s+b.p+b.x*.01)*14;
      const d=Math.abs(b.x-mx),push=(d<130&&my>base-b.h*3)?(b.x<mx?-1:1)*(130-d)*.45:0;
      const tx=b.x+wind+push,ty=base-b.h;
      c.strokeStyle=`hsl(${105+b.g*25} ${45+b.g*20}% ${22+b.g*22}%)`;c.lineWidth=2.2;c.beginPath();c.moveTo(b.x,base);c.quadraticCurveTo(b.x+(tx-b.x)*.3,base-b.h*.6,tx,ty);c.stroke()}
  })(0)}

/* instant quote calculator */
const qs=$('#q-svc');
if(qs){
  const rng=$('#q-size'),out=$('#q-price'),fq=$('#q-freq');let freq='once';
  qs.innerHTML=Object.entries(RATES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');
  function calc(reset){const r=RATES[qs.value];
    if(reset){rng.min=r.min;rng.max=r.max;rng.step=r.step;rng.value=r.def}
    $('#q-unit').textContent=r.unit;$('#q-val').textContent=(+rng.value).toLocaleString();
    fq.style.display=r.freq?'block':'none';const d=r.freq?FREQ[freq]:0,v=+rng.value;
    const lo=Math.round(v*r.lo*(1-d)),hi=Math.round(v*r.hi*(1-d));
    out.textContent=`$${lo.toLocaleString()} – $${hi.toLocaleString()}`;
    $('#q-go').href=`contact.html?svc=${encodeURIComponent(r.label)}&size=${encodeURIComponent(v+' '+r.unit)}#form`}
  qs.onchange=()=>calc(true);rng.oninput=()=>calc();
  $$('#q-freq button').forEach(b=>b.onclick=()=>{freq=b.dataset.f;$$('#q-freq button').forEach(x=>x.classList.toggle('on',x===b));calc()});
  const pre=document.body.dataset.svc;if(pre&&RATES[pre])qs.value=pre;calc(true)}

/* before / after slider */
$$('.ba').forEach(b=>{const i=$('input',b);i.oninput=()=>b.style.setProperty('--p',i.value+'%')});

/* contact form + prefill from calculator */
const form=$('#form');
if(form){const p=new URLSearchParams(location.search);
  if(p.get('svc')){$('#f-m').value=`I'd like a quote for: ${p.get('svc')} (${p.get('size')}).\n`;[...$('#f-s').options].forEach(o=>{if(p.get('svc').toLowerCase().includes(o.value.split(' ')[0].toLowerCase()))$('#f-s').value=o.value})}
  form.onsubmit=e=>{e.preventDefault();const g=i=>$('#'+i).value;
    location.href=`mailto:${CONTACT.email}?subject=${encodeURIComponent('Quote request: '+g('f-s'))}&body=${encodeURIComponent(`Name: ${g('f-n')}\nPhone: ${g('f-p')}\nCity: ${g('f-c')}\nService: ${g('f-s')}\n\n${g('f-m')}`)}`}}

/* area checker */
$('#area')?.addEventListener('submit',e=>{e.preventDefault();const c=$('#area-c').value;
  location.href=`sms:${CONTACT.phone}?&body=${encodeURIComponent('Hi J&C Dreamscape, do you serve '+c+'?')}`});

/* quote popup: once per visit, after 25s or on exit intent (desktop) */
const md=$('#pop');
if(md&&!sessionStorage.getItem('popSeen')){
  const show=()=>{if(sessionStorage.getItem('popSeen'))return;sessionStorage.setItem('popSeen','1');md.classList.add('open');$('.x',md).focus()};
  setTimeout(show,25000);document.addEventListener('mouseout',e=>{if(e.clientY<=0&&e.relatedTarget===null)show()});
  md.addEventListener('click',e=>{if(e.target===md||e.target.classList.contains('x')||e.target.dataset.close!==undefined)md.classList.remove('open')});
  addEventListener('keydown',e=>{if(e.key==='Escape')md.classList.remove('open')})}
