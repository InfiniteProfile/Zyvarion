'use strict';
const $=s=>document.querySelector(s),app=$('#app');
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const x in a){if(x==='text')e.textContent=a[x];else e.setAttribute(x,a[x])}e.append(...k.flat().filter(v=>v!=null&&v!==false));return e};
const logo=s=>{const e=h('span');e.innerHTML=`<svg viewBox="0 0 32 32" width="${s}" height="${s}" aria-hidden="true"><circle cx="12" cy="16" r="7" fill="none" stroke="#8b5cf6" stroke-width="2.5"/><circle cx="20" cy="16" r="7" fill="none" stroke="#22d3ee" stroke-width="2.5"/><path d="M11 12h10l-10 8h10" fill="none" stroke="#e9e9f1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;return e};
$('#logo').replaceWith(logo(32));
const btn=(t,f)=>{const b=h('button',{type:'button',class:'btn',text:t});b.onclick=f;return b};

/* ---- identifiers: canonical decimal strings, BigInt only for arithmetic ---- */
const canon=s=>{s=String(s).trim();if(!/^\d{1,1000}$/.test(s))return null;s=s.replace(/^0+(?=\d)/,'');return s==='0'?null:s};
const b36=n=>BigInt(n).toString(36);
const fromB36=s=>{let n=0n;for(const c of s)n=n*36n+BigInt(parseInt(c,36));return n};

/* ---- deterministic generation: string hash -> mulberry32 ---- */
function rng(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
 h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);let a=(h^h>>>16)>>>0;
 return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const ON=['k','v','z','th','l','r','s','n','x','m','d','ry','q','sh','el','al','or','cy','h','j'],
VO=['a','e','i','o','u','ae','ia','y','ei','au','ou'],CO=['','','n','r','s','th','x','l','m','k'];
const word=(r,n)=>{let s='';for(let i=0;i<n;i++)s+=pick(r,ON)+pick(r,VO)+(i===n-1?pick(r,CO):'');return s[0].toUpperCase()+s.slice(1)};
const CATS=['Archivist','Cartographer','Signalwright','Lumen Weaver','Driftwalker','Echo Keeper','Quantum Gardener','Loopsmith','Stormreader','Glyph Cantor'],
SA=['Nyx','Aur','Vel','Cael','Orr','Ith','Zeph','Kor'],SB=['Spire','Reach','Lattice','Verge','Basin','Concourse','Helix','Terrace'],
V=['Keeps','Maps','Listens to','Collects','Repairs','Translates','Tends','Charts'],
T=['forgotten signals','looping memories','quiet constellations','unfinished doors','borrowed light','slow rivers of data'],
E=['between the outer rings.','for anyone passing through.','one cycle at a time.','beneath the violet horizon.','since before the first loop.'],
INT=['cartography','resonance','glasswork','night markets','ciphers','tidal clocks','mirror gardens','archives','harmonics','lanterns'];
function gen(id){const r=rng('zyv1:'+id);
 const name=word(r,2+(r()<.4))+' '+word(r,2+(r()<.3));
 const interests=[];while(interests.length<3){const i=pick(r,INT);if(!interests.includes(i))interests.push(i)}
 return{id,name,handle:'@'+b36(id),cat:pick(r,CATS),loc:`${pick(r,SA)} ${pick(r,SB)}, Ring ${1+Math.floor(r()*99)}`,
 bio:`${pick(r,V)} ${pick(r,T)} ${pick(r,E)}`,interests,cycle:2100+Math.floor(r()*900),links:Math.floor(r()*9000),echoes:Math.floor(r()*500)}}
function avatar(id,sz){const r=rng(id+':a');const hue=r()<.5?262+Math.floor(r()*24):184+Math.floor(r()*14);
 const c1=`hsl(${hue} 75% 62%)`,c2=`hsl(${(hue+150)%360} 60% 55%)`,ring=20+Math.floor(r()*8),hd=9+Math.floor(r()*4),sh=15+Math.floor(r()*8),rot=Math.floor(r()*360),n=2+Math.floor(r()*4);let d='';
 for(let i=0;i<n;i++){const a=(rot+i*360/n)*Math.PI/180;d+=`<circle cx="${(32+ring*Math.cos(a)).toFixed(1)}" cy="${(32+ring*Math.sin(a)).toFixed(1)}" r="2" fill="${c2}"/>`}
 return `<svg viewBox="0 0 64 64" width="${sz}" height="${sz}" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#13131b"/><circle cx="32" cy="32" r="${ring}" fill="none" stroke="${c1}" stroke-opacity=".35"/>${d}<circle cx="32" cy="27" r="${hd}" fill="${c1}"/><path d="M${32-sh} 52q${sh} -${sh+2} ${2*sh} 0z" fill="${c2}"/></svg>`}

/* ---- text-file content: blocks separated by a standalone line of 3+ hyphens ---- */
const KEYS=new Set(['id','profile','title','content','media','name','bio','date']);
function parse(t){const out=[];let b=null,k=null;
 const flush=()=>{if(b){for(const x in b)if(typeof b[x]==='string')b[x]=b[x].trim();out.push(b)}b=null;k=null};
 for(const line of t.replace(/^\uFEFF/,'').split(/\r\n|\r|\n/)){
  if(/^\s*-{3,}\s*$/.test(line)){flush();continue}
  if(/^\s*#/.test(line)&&k!=='content')continue;
  const m=line.match(/^([a-z]+):\s?(.*)$/i);
  if(m&&KEYS.has(m[1].toLowerCase())){b=b||{};k=m[1].toLowerCase();if(k==='media')(b.media=b.media||[]).push(m[2].trim());else b[k]=m[2]}
  else if(b&&k&&k!=='media')b[k]+='\n'+line}
 flush();return out}
const cache=new Map();
const load=u=>{if(!cache.has(u))cache.set(u,fetch(u).then(r=>{if(!r.ok)throw new Error(r.status===404?'File not found: '+u:'HTTP '+r.status+' for '+u);return r.text()}).then(parse).catch(e=>{cache.delete(u);throw e}));return cache.get(u)};
const posts=()=>load('data/posts.txt').then(a=>{const s=new Set();return a.filter(p=>p.id&&!s.has(p.id)&&s.add(p.id))});
let ovMap=new Map();
const ready=load('data/profiles.txt').then(a=>{for(const p of a){const i=canon(p.profile||'');if(i&&!ovMap.has(i))ovMap.set(i,p)}}).catch(()=>{});
const P=id=>{const p=gen(id),o=ovMap.get(id);if(o){if(o.name)p.name=o.name;if(o.bio)p.bio=o.bio}return p};

/* ---- safe media ---- */
const IMG=/\.(jpe?g|png|gif|webp|avif|svg)$/i,VID=/\.(mp4|webm|ogv|mov)$/i,AUD=/\.(mp3|ogg|oga|wav|m4a|aac|flac)$/i;
function safeUrl(u){try{const x=new URL(u,location.href);if(!/^https?:$/.test(x.protocol))return null;
 if(x.hostname==='github.com'){const m=x.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);if(m)return`https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}`}return x.href}catch{return null}}
function ytId(x){const hn=x.hostname.replace(/^www\.|^m\./,'');let id=null;
 if(hn==='youtu.be')id=x.pathname.slice(1);else if(hn==='youtube.com'){const m=x.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);id=m?m[1]:x.searchParams.get('v')}
 return /^[\w-]{11}$/.test(id||'')?id:null}
function media(raw){const note=t=>h('p',{class:'note',text:t}),u=safeUrl(raw);if(!u)return note('Unsupported or invalid media link.');
 const x=new URL(u),id=ytId(x);
 if(id){const sh=/\/shorts\//.test(x.pathname),c='yt'+(sh?' short':'');
  const b=h('button',{type:'button',class:c,text:'Play YouTube '+(sh?'Short':'video'),'aria-label':'Play YouTube video'});
  b.onclick=()=>b.replaceWith(h('iframe',{class:c,src:`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,title:'YouTube video',allow:'autoplay; encrypted-media; picture-in-picture',allowfullscreen:'',referrerpolicy:'strict-origin-when-cross-origin'}));return b}
 if(IMG.test(x.pathname)){const i=h('img',{src:u,alt:'Post image',loading:'lazy',decoding:'async'});i.onerror=()=>i.replaceWith(note('Image unavailable: '+u));return h('figure',{},i)}
 if(VID.test(x.pathname)||AUD.test(x.pathname)){const v=h(VID.test(x.pathname)?'video':'audio',{src:u,controls:'',preload:'none',playsinline:''});v.onerror=()=>v.replaceWith(note('Media unavailable: '+u));return v}
 return h('a',{class:'btn',href:u,download:'',rel:'noopener noreferrer',target:'_blank',text:'Download file'})}

/* ---- routing ---- */
let cleanup=()=>{},rt=0;
const loading=()=>h('div',{class:'load',role:'status'},logo(28),'Loading…');
function run(box,fn){const t=rt;box.replaceChildren(loading());
 fn().then(n=>{if(t===rt)box.replaceChildren(n)},e=>{if(t===rt)box.replaceChildren(h('div',{class:'err',role:'alert'},h('p',{text:'Could not load content. '+e.message}),btn('Retry',()=>run(box,fn))))})}
const back=()=>h('a',{class:'back',href:'./','data-n':'',text:'← Directory'});
const bad=(t,m)=>{document.title=t+' · Zyvarion';app.replaceChildren(back(),h('div',{class:'err',role:'alert'},h('b',{text:t}),h('p',{text:m})))};
function nav(u){history.pushState(null,'',u);route()}
document.addEventListener('click',e=>{const a=e.target.closest('a[data-n]');if(a&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){e.preventDefault();nav(a.getAttribute('href'))}});
addEventListener('popstate',route);
$('#sf').onsubmit=e=>{e.preventDefault();const v=$('#q').value.trim();if(!v)return;const d=canon(v);if(d)return nav('?profile='+d);
 const m=v.match(/^@([0-9a-z]+)$/i);if(m){const n=fromB36(m[1].toLowerCase());if(n>0n)return nav('?profile='+n)}nav('?q='+encodeURIComponent(v))};
function route(){cleanup();cleanup=()=>{};const t=++rt;scrollTo(0,0);app.replaceChildren(loading());
 ready.then(()=>{if(t!==rt)return;const p=new URLSearchParams(location.search);$('#q').value=p.get('q')||'';
  if(p.has('post'))viewPost(p.get('post'));else if(p.has('profile'))viewProfile(p.get('profile'));else if(p.has('q'))viewSearch(p.get('q'));else viewDir()})}

/* ---- directory: virtualized window of rows, extended/recycled via IntersectionObserver ---- */
const ROWH=128,GAP=12,MINW=250,MAXR=36,STEP=4;
function card(id){const p=P(id),a=h('a',{class:'card',href:'?profile='+id,'data-n':'',role:'listitem'}),av=h('span',{class:'av'});av.innerHTML=avatar(id,56);
 a.append(av,h('span',{class:'tx'},h('b',{text:p.name}),h('i',{text:'Profile '+id}),h('span',{text:p.bio}),h('em',{text:p.cat+' · '+p.loc.split(',')[0]})));return a}
function viewDir(){document.title='Zyvarion — One Universe. Infinite Identities.';
 const pt=h('div'),s1=h('div',{class:'sen'}),g=h('div',{class:'grid',role:'list','aria-label':'Profiles'}),s2=h('div',{class:'sen'}),dir=h('div',{id:'dir'},pt,s1,g,s2);
 app.replaceChildren(dir);const unit=ROWH+GAP,colsFor=()=>Math.max(1,Math.floor((dir.clientWidth+GAP)/(MINW+GAP))),rows=()=>Math.ceil(innerHeight/unit)+3;
 let cols=colsFor(),start=0,end=rows();
 const io=new IntersectionObserver(es=>{for(const e of es){if(!e.isIntersecting)continue;
  if(e.target===s2){end+=STEP;if(end-start>MAXR)start=end-MAXR}else if(start>0){start=Math.max(0,start-STEP);if(end-start>MAXR)end=start+MAXR}else continue;
  render();return}},{rootMargin:'900px 0px'});
 function render(){pt.style.height=start*unit+'px';g.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;const f=document.createDocumentFragment();
  for(let r=start;r<end;r++)for(let c=0;c<cols;c++)f.append(card((BigInt(r)*BigInt(cols)+BigInt(c+1)).toString()));
  g.replaceChildren(f);io.unobserve(s1);io.unobserve(s2);io.observe(s1);io.observe(s2)}
 let tm;const onR=()=>{clearTimeout(tm);tm=setTimeout(()=>{const nc=colsFor();if(nc!==cols){start=Math.floor(start*cols/nc);cols=nc;end=start+rows();render()}},150)};
 addEventListener('resize',onR);cleanup=()=>{io.disconnect();removeEventListener('resize',onR);clearTimeout(tm)};render()}

/* ---- profile ---- */
function postItem(p){return h('a',{class:'post',href:'?post='+encodeURIComponent(p.id),'data-n':''},h('b',{text:p.title||p.id}),h('span',{text:(p.content||'').slice(0,140)}))}
function viewProfile(raw){const id=canon(raw);if(!id)return bad('Invalid profile identifier','Profile numbers are positive whole numbers made of digits only.');
 const p=P(id);document.title=`${p.name} · Profile ${id} · Zyvarion`;const av=h('span',{class:'av'});av.innerHTML=avatar(id,96);
 const pbox=h('div'),n=BigInt(id);
 app.replaceChildren(back(),h('article',{class:'prof'},
  h('div',{class:'ph'},av,h('div',{},h('h1',{text:p.name}),h('p',{class:'code',text:'Profile '+id}),h('p',{class:'code',text:p.handle}))),
  h('div',{class:'chips'},h('span',{text:p.cat}),...p.interests.map(i=>h('span',{text:i}))),
  h('p',{text:p.bio}),
  h('dl',{},h('dt',{text:'Location'}),h('dd',{text:p.loc}),h('dt',{text:'Discovered'}),h('dd',{text:'Cycle '+p.cycle}),h('dt',{text:'Links'}),h('dd',{text:String(p.links)}),h('dt',{text:'Echoes'}),h('dd',{text:String(p.echoes)})),
  h('div',{},...(n>1n?[h('a',{class:'btn',href:'?profile='+(n-1n),'data-n':'',text:'← Previous'})]:[]),' ',h('a',{class:'btn',href:'?profile='+(n+1n),'data-n':'',text:'Next →'})),
  h('h2',{text:'Posts'}),pbox));
 run(pbox,()=>posts().then(a=>{const m=a.filter(x=>canon(x.profile||'')===id);return m.length?h('div',{},...m.map(postItem)):h('p',{class:'note',text:'No posts for this identity yet. Add some in data/posts.txt.'})}))}
function viewPost(id){const box=h('section',{class:'prof'});app.replaceChildren(back(),box);document.title='Post · Zyvarion';
 run(box,async()=>{const p=(await posts()).find(x=>x.id===id);if(!p){document.title='Post not found · Zyvarion';return h('p',{text:'No post with the identifier "'+id+'" exists in data/posts.txt.'})}
  document.title=(p.title||p.id)+' · Zyvarion';const pid=canon(p.profile||'');
  return h('article',{},h('h1',{text:p.title||p.id}),pid?h('p',{},'By ',h('a',{href:'?profile='+pid,'data-n':'',text:P(pid).name+' (Profile '+pid+')'})):null,
   h('p',{class:'body',text:p.content||''}),...(p.media||[]).map(media))})}

/* ---- search (names: bounded scan, stated honestly) ---- */
function viewSearch(q){document.title='Search · Zyvarion';const LIM=20000,CH=1500,MAXRES=40,nd=q.toLowerCase(),list=h('ul',{class:'res'}),st=h('p',{class:'note',role:'status'});
 let i=1,found=0,stop=false;cleanup=()=>{stop=true};
 const add=p=>{found++;list.append(h('li',{},h('a',{class:'post',href:'?profile='+p.id,'data-n':''},h('b',{text:p.name}),h('span',{text:'Profile '+p.id}))))};
 for(const[id,o]of ovMap)if(BigInt(id)>BigInt(LIM)&&(o.name||'').toLowerCase().includes(nd))add(P(id));
 app.replaceChildren(back(),h('h1',{text:'Search: '+q}),st,list,h('p',{class:'note',text:'Names are not globally indexed. Name search covers profiles 1–'+LIM.toLocaleString('en-US')+' and custom names in data/profiles.txt. To reach any other identity, search its exact profile number or @handle.'}));
 (function step(){if(stop)return;const to=Math.min(i+CH,LIM+1);for(;i<to&&found<MAXRES;i++){const p=P(String(i));if(p.name.toLowerCase().includes(nd))add(p)}
  if(i>LIM||found>=MAXRES){st.textContent=found?`${found} match${found>1?'es':''}${found>=MAXRES?' (showing first '+MAXRES+')':''}.`:'No names matched in the searched range.';return}
  st.textContent='Scanning profile '+i+'…';setTimeout(step,0)})()}
route();
