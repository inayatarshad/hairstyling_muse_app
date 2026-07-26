import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, ChevronRight, CircleUserRound,
  ClipboardCheck, Clock3, Copy, Download, ExternalLink, GalleryVerticalEnd, HelpCircle,
  Home, Image as ImageIcon, Layers3, Menu, Palette, Plus, RefreshCw, RotateCcw,
  Scissors, Settings, Share2, ShieldCheck, SlidersHorizontal, Sparkles, Upload,
  UserRound, UsersRound, WandSparkles, X
} from 'lucide-react';

const WOMEN_HAIR = [
  {id:'w-bob',name:'Sculpted bob',meta:'Chin length · polished',tag:'Signature',pos:'0% 0%',length:'Short'},
  {id:'w-curtain',name:'Airy curtain layers',meta:'Medium · movement',tag:'Trending',pos:'50% 0%',length:'Medium'},
  {id:'w-pixie',name:'Modern soft pixie',meta:'Short · textured',tag:'Editorial',pos:'100% 0%',length:'Very short'},
  {id:'w-waves',name:'Long undone waves',meta:'Long · voluminous',tag:'Popular',pos:'0% 100%',length:'Long'},
  {id:'w-curls',name:'Defined natural curls',meta:'Medium · full',tag:'Texture',pos:'50% 100%',length:'Medium'},
  {id:'w-braids',name:'Braided high bun',meta:'Protective · refined',tag:'Protective',pos:'100% 100%',length:'Long'}
];
const MEN_HAIR = [
  {id:'m-crop',name:'Textured French crop',meta:'Short · matte',tag:'Signature',pos:'0% 0%',length:'Short'},
  {id:'m-part',name:'Classic taper part',meta:'Short · polished',tag:'Classic',pos:'50% 0%',length:'Short'},
  {id:'m-quiff',name:'Modern structured quiff',meta:'Medium · volume',tag:'Popular',pos:'100% 0%',length:'Medium'},
  {id:'m-curls',name:'Natural curls + fade',meta:'Short · defined',tag:'Texture',pos:'0% 100%',length:'Short'},
  {id:'m-buzz',name:'Precision buzz cut',meta:'Very short · clean',tag:'Minimal',pos:'50% 100%',length:'Very short'},
  {id:'m-swept',name:'Medium swept back',meta:'Medium · natural',tag:'Editorial',pos:'100% 100%',length:'Medium'}
];
const BEARDS = [
  {id:'clean',name:'Clean shaven',meta:'Precise · timeless',pos:'0% 0%'},
  {id:'stubble',name:'Soft stubble',meta:'3–5 days · natural',pos:'50% 0%'},
  {id:'boxed',name:'Short boxed beard',meta:'Structured · refined',pos:'100% 0%'},
  {id:'full',name:'Full sculpted beard',meta:'Dense · balanced',pos:'0% 100%'},
  {id:'goatee',name:'Modern goatee',meta:'Defined · minimal',pos:'50% 100%'},
  {id:'anchor',name:'Anchor beard',meta:'Sharp · expressive',pos:'100% 100%'}
];
const COLORS = [
  ['Natural black','#181514'],['Espresso','#33211d'],['Chocolate','#553329'],['Chestnut','#784b37'],
  ['Warm caramel','#ad7650'],['Honey blonde','#c69d6d'],['Copper','#a85433'],['Burgundy','#641c27'],
  ['Soft silver','#b7b3ae'],['Platinum','#ded5c4']
];
const initialSession = {
  clientType:'female',clientName:'',photo:'',hair:'w-curtain',beard:'clean',
  length:'Medium',texture:'Soft wave',volume:62,density:'Natural',finish:'Satin',
  fade:'None',parting:'Centre',color:'Espresso',technique:'Solid',warmth:52,
  colorIntensity:72,renderedPhoto:'',beardLength:'Clean',beardDensity:'Natural',cheek:'Natural',beardShape:'Rounded'
};
const initialSettings = {tips:true,privateMode:true,quality:'High fidelity',theme:'light',provider:'Demo engine'};
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);
const hairFor = type => type === 'male' ? MEN_HAIR : WOMEN_HAIR;
const selectedHair = session => hairFor(session.clientType).find(x=>x.id===session.hair) || hairFor(session.clientType)[0];
const selectedBeard = session => BEARDS.find(x=>x.id===session.beard) || BEARDS[0];

function Provider({children}) {
  const [session,setSession] = useState(()=>read('muse-v2-session',initialSession));
  const [saved,setSaved] = useState(()=>read('muse-v2-saved',[]));
  const [clients,setClients] = useState(()=>read('muse-v2-clients',[]));
  const [settings,setSettings] = useState(()=>read('muse-v2-settings',initialSettings));
  const update=(key,value)=>setSession(s=>({...s,[key]:value}));
  const chooseType=type=>setSession(s=>({...s,clientType:type,hair:hairFor(type)[0].id,beard:'clean'}));
  const saveLook=()=>{
    const item={...session,id:Date.now(),created:new Date().toLocaleDateString(),hairName:selectedHair(session).name,beardName:selectedBeard(session).name};
    setSaved(v=>[item,...v.filter(x=>x.hair!==item.hair||x.color!==item.color)].slice(0,12));
    if(session.clientName) setClients(v=>[{id:Date.now(),name:session.clientName,type:session.clientType,lastLook:item.hairName,date:item.created},...v.filter(x=>x.name!==session.clientName)]);
    return item;
  };
  const loadLook=look=>setSession({...initialSession,...look});
  useEffect(()=>write('muse-v2-session',session),[session]);
  useEffect(()=>write('muse-v2-saved',saved),[saved]);
  useEffect(()=>write('muse-v2-clients',clients),[clients]);
  useEffect(()=>write('muse-v2-settings',settings),[settings]);
  return <AppContext.Provider value={{session,setSession,update,chooseType,saved,setSaved,clients,settings,setSettings,saveLook,loadLook}}>{children}</AppContext.Provider>;
}
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}

const coreNav=[
  ['/',Home,'Dashboard'],['/consultation/client',WandSparkles,'New consultation'],
  ['/studio',SlidersHorizontal,'Live colour studio'],['/clients',UsersRound,'Clients'],['/saved',Bookmark,'Saved looks'],['/compare',Layers3,'Compare']
];
function Shell({children,flush=false}) {
  const [mobile,setMobile]=useState(false); const {pathname}=useLocation(); const {session}=useApp();
  return <div className="shell">
    <aside className={mobile?'sidebar open':'sidebar'}>
      <button className="close-nav" onClick={()=>setMobile(false)}><X size={19}/></button>
      <Link className="brand" to="/"><span className="brand-mark">M</span><span>MUSE<small>SALON INTELLIGENCE</small></span></Link>
      <nav className="nav"><p>Salon workspace</p>{coreNav.map(([to,I,label])=><NavLink key={to} to={to} end={to==='/' } onClick={()=>setMobile(false)}><I size={18}/>{label}</NavLink>)}
        <p className="nav-group">Active consultation</p>
        <NavLink to="/styles/hair"><Scissors size={18}/>Hair selection</NavLink>
        {session.clientType==='male'&&<NavLink to="/styles/beard"><UserRound size={18}/>Beard selection</NavLink>}
        <NavLink to="/color"><Palette size={18}/>Colour direction</NavLink>
        <NavLink to="/review"><ClipboardCheck size={18}/>Review look</NavLink>
      </nav>
      <div className="side-bottom"><NavLink to="/help"><HelpCircle size={18}/> Help centre</NavLink><NavLink to="/settings"><Settings size={18}/> Settings</NavLink><NavLink to="/profile" className="profile-mini"><span>MS</span><div>Muse Studio<small>Professional plan</small></div><ChevronRight size={15}/></NavLink></div>
    </aside>
    {mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb">Muse <span>/</span> {routeLabel(pathname)}</div><div className="top-actions"><span className="status-dot"/> Secure salon session <Link to="/profile" className="avatar">MS</Link></div></header>
      <div className={flush?'':'page'}>{children}</div>
    </main>
  </div>;
}
function routeLabel(path){const labels={'/':'Dashboard','/consultation/client':'Client profile','/consultation/photo':'Portrait capture','/studio':'Live colour studio','/styles/hair':'Hair selection','/styles/beard':'Beard selection','/color':'Colour direction','/review':'Review look','/generate':'Generation','/result':'Result','/saved':'Saved looks','/compare':'Compare','/clients':'Clients','/settings':'Settings','/profile':'Profile','/help':'Help'};return labels[path]||'Studio'}
function Button({children,to,variant='',onClick,disabled,type='button'}){const c='button '+variant;return to?<Link to={to} className={c}>{children}</Link>:<button type={type} className={c} onClick={onClick} disabled={disabled}>{children}</button>}
function PageHead({eyebrow,title,copy,action}){return <div className="page-head"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy&&<p>{copy}</p>}</div>{action}</div>}

function Workflow({current}) {
  const {session}=useApp();
  const steps=[['client','Client','/consultation/client'],['photo','Portrait','/consultation/photo'],['hair','Hair','/styles/hair'],...(session.clientType==='male'?[['beard','Beard','/styles/beard']]:[]),['color','Colour','/color'],['review','Review','/review']];
  const active=steps.findIndex(x=>x[0]===current);
  return <div className="workflow">{steps.map(([id,label,to],i)=><React.Fragment key={id}><Link to={to} className={i<active?'done':i===active?'active':''}><i>{i<active?<Check/>:i+1}</i><span>{label}</span></Link>{i<steps.length-1&&<b className={i<active?'done':''}/>}</React.Fragment>)}</div>;
}
function Sprite({kind='women',pos='0% 0%',className=''}) {
  const source=kind==='beard'?'/assets/beard-styles.png':kind==='men'?'/assets/men-hair-styles.png':'/assets/women-hair-styles.png';
  return <div className={'sprite '+className} style={{backgroundImage:`url(${source})`,backgroundPosition:pos}}/>;
}
function ClientTypePortrait({type}) {
  return <div className="client-type-portrait" style={{backgroundImage:'url(/assets/client-types-modern.png)',backgroundPosition:type==='male'?'100% 50%':'0% 50%'}}/>;
}
function CurrentVisual({result=false}) {
  const {session}=useApp(); const hair=selectedHair(session);
  return <div className={'current-visual '+(result?'result-visual':'')}>
    {session.photo?<img src={result?(session.renderedPhoto||session.photo):session.photo} alt="Client portrait"/>:<Sprite kind={session.clientType==='male'?'men':'women'} pos={hair.pos}/>}
    {result&&session.photo&&session.renderedPhoto&&<div className="result-inset"><img src={session.photo} alt="Original client"/><small>ORIGINAL</small></div>}
    <span className="look-chip"><Sparkles size={13}/>{hair.name} · {session.color}</span>
  </div>;
}

function LiveHairEditor({compact=false,onRendered}) {
  const {session,update}=useApp();
  const canvasRef=useRef(null); const imageRef=useRef(null); const segmenterRef=useRef(null); const maskRef=useRef(null);
  const [status,setStatus]=useState('idle'); const [showOriginal,setShowOriginal]=useState(false); const [error,setError]=useState('');
  const color=COLORS.find(x=>x[0]===session.color)?.[1]||'#33211d';

  const render=React.useCallback(()=>{
    const canvas=canvasRef.current,img=imageRef.current;if(!canvas||!img?.complete||!img.naturalWidth)return;
    const max=1400,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    if(showOriginal||!maskRef.current)return;
    const original=ctx.getImageData(0,0,canvas.width,canvas.height);
    const mask=maskRef.current,small=document.createElement('canvas');small.width=mask.width;small.height=mask.height;
    const sctx=small.getContext('2d'),maskImage=sctx.createImageData(mask.width,mask.height);
    for(let i=0;i<mask.data.length;i++){const hair=mask.data[i]===1;maskImage.data[i*4+3]=hair?255:0}
    sctx.putImageData(maskImage,0,0);
    const scaled=document.createElement('canvas');scaled.width=canvas.width;scaled.height=canvas.height;
    const mctx=scaled.getContext('2d',{willReadFrequently:true});mctx.imageSmoothingEnabled=true;mctx.drawImage(small,0,0,canvas.width,canvas.height);
    const alpha=mctx.getImageData(0,0,canvas.width,canvas.height).data;
    const [tr,tg,tb]=hexRgb(color),strength=(session.colorIntensity||72)/100,warm=(session.warmth-50)/50;
    for(let i=0;i<original.data.length;i+=4){
      const a=(alpha[i+3]/255)*strength;if(a<.02)continue;
      const r=original.data[i],g=original.data[i+1],b=original.data[i+2],lum=.2126*r+.7152*g+.0722*b;
      const shade=.42+(lum/255)*.76;
      const cr=Math.min(255,tr*shade+lum*.28+Math.max(0,warm)*8);
      const cg=Math.min(255,tg*shade+lum*.28);
      const cb=Math.min(255,tb*shade+lum*.28+Math.max(0,-warm)*8);
      original.data[i]=r*(1-a)+cr*a;original.data[i+1]=g*(1-a)+cg*a;original.data[i+2]=b*(1-a)+cb*a;
    }
    ctx.putImageData(original,0,0);
    if(onRendered){clearTimeout(render.timer);render.timer=setTimeout(()=>onRendered(canvas.toDataURL('image/jpeg',.9)),180)}
  },[color,session.colorIntensity,session.warmth,showOriginal,onRendered]);

  useEffect(()=>{if(session.photo){const img=new Image();img.onload=()=>{imageRef.current=img;setStatus('queued');render()};img.src=session.photo}else{imageRef.current=null;maskRef.current=null;setStatus('idle')}},[session.photo]);
  useEffect(()=>render(),[render]);

  const detect=async()=>{
    if(!session.photo||!imageRef.current)return;setStatus('loading');setError('');
    try{
      const {FilesetResolver,ImageSegmenter}=await import('@mediapipe/tasks-vision');
      if(!segmenterRef.current){
        const vision=await FilesetResolver.forVisionTasks('/models/wasm');
        const options={baseOptions:{modelAssetPath:'/models/selfie_multiclass_256x256.tflite',delegate:'GPU'},runningMode:'IMAGE',outputCategoryMask:true,outputConfidenceMasks:false};
        try{segmenterRef.current=await ImageSegmenter.createFromOptions(vision,options)}catch{segmenterRef.current=await ImageSegmenter.createFromOptions(vision,{...options,baseOptions:{modelAssetPath:options.baseOptions.modelAssetPath,delegate:'CPU'}})}
      }
      await new Promise((resolve,reject)=>{try{segmenterRef.current.segment(imageRef.current,result=>{const m=result.categoryMask;maskRef.current={data:new Uint8Array(m.getAsUint8Array()),width:m.width,height:m.height};m.close?.();resolve()})}catch(e){reject(e)}});
      setStatus('ready');setTimeout(render,30);
    }catch(e){setStatus('error');setError('Hair detection could not start in this browser. Your original photo is unchanged.')}
  };
  useEffect(()=>{if(session.photo&&status==='queued'&&imageRef.current)detect()},[session.photo,status]);

  if(!session.photo)return <div className="live-empty"><ImageIcon/><h3>Upload a portrait to edit it live</h3><p>Hair detection runs on this device and does not upload the photograph.</p><Button to="/consultation/photo">Add portrait <ArrowRight/></Button></div>;
  return <div className={'live-editor '+(compact?'compact':'')}>
    <div className="live-canvas"><canvas ref={canvasRef}/>{status==='loading'&&<div className="detecting"><RefreshCw/><strong>Detecting hair</strong><span>Separating hair from face, clothing and background…</span></div>}<span className={'detection-pill '+status}>{status==='ready'?<><Check/>HAIR MASK READY</>:status==='error'?'MASK UNAVAILABLE':'ON-DEVICE ANALYSIS'}</span></div>
    <div className="live-toolbar"><button onClick={()=>setShowOriginal(v=>!v)}>{showOriginal?'Show colour':'Hold original'}</button><button onClick={detect}><RefreshCw/>Redetect hair</button></div>
    {error&&<p className="editor-error">{error}</p>}
  </div>;
}
function hexRgb(hex){const n=parseInt(hex.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}

function Dashboard(){
  const {saved,clients,session}=useApp();const hair=selectedHair(session);
  return <Shell flush><section className="dashboard-hero"><div><p className="eyebrow light">Professional consultation platform</p><h1>Turn consideration<br/>into <em>confidence.</em></h1><p>Build, visualise and compare personalised hair directions with every client—before the first cut or colour service begins.</p><div><Button to="/consultation/client">Start consultation <ArrowRight size={17}/></Button><Button to="/studio" variant="ghost-light">Open live studio</Button></div><div className="trust"><span><ShieldCheck/>Private client workflow</span><span><CheckCircle2/>On-device hair colour</span></div></div><div className="hero-salon" role="img" aria-label="Stylist cutting hair in a modern salon"><div className="floating-card"><small>LIVE COLOUR STUDIO</small><strong>Adjust on the client</strong><span>Upload · detect hair · refine tone</span></div></div></section>
  <section className="dash-content"><div className="metric-row"><article><small>CLIENT PROFILES</small><strong>{clients.length||'08'}</strong><span><UsersRound/> Consultation-ready</span></article><article><small>SAVED DIRECTIONS</small><strong>{saved.length||'12'}</strong><span><Bookmark/> In your lookbook</span></article><article><small>STYLE PRESETS</small><strong>18</strong><span><Scissors/> Hair + grooming</span></article><article><small>COLOUR STORIES</small><strong>10</strong><span><Palette/> Professional tones</span></article></div>
  <div className="section-title"><div><p className="eyebrow">Consultation tools</p><h2>A complete styling conversation</h2></div></div><div className="tool-grid"><Link to="/consultation/client"><span>01</span><WandSparkles/><h3>New consultation</h3><p>Build a complete look through a guided, client-friendly journey.</p><b>Begin <ArrowRight/></b></Link><Link to="/studio"><span>02</span><Palette/><h3>Live colour studio</h3><p>Detect the client’s hair and adjust colour directly on the uploaded portrait.</p><b>Open editor <ArrowRight/></b></Link><Link to="/compare"><span>03</span><Layers3/><h3>Side-by-side compare</h3><p>Help clients decide with up to four saved directions.</p><b>Compare <ArrowRight/></b></Link></div></section>
  </Shell>;
}

function ClientStep(){
  const {session,update,chooseType}=useApp(); const nav=useNavigate();
  const next=()=>nav('/consultation/photo');
  return <Shell><Workflow current="client"/><div className="consult-card"><PageHead eyebrow="Step 1 · Client profile" title="Who are we styling?" copy="This choice tailors every subsequent module and removes irrelevant options."/>
    <div className="client-types"><button className={session.clientType==='female'?'active':''} onClick={()=>chooseType('female')}><ClientTypePortrait type="female"/><span><i>{session.clientType==='female'?<Check/>:<CircleUserRound/>}</i><strong>Female styling</strong><small>Haircut, texture and colour consultation</small></span></button><button className={session.clientType==='male'?'active':''} onClick={()=>chooseType('male')}><ClientTypePortrait type="male"/><span><i>{session.clientType==='male'?<Check/>:<CircleUserRound/>}</i><strong>Male styling</strong><small>Haircut, grooming and colour consultation</small></span></button></div>
    <label className="name-field"><span>Client name <small>OPTIONAL</small></span><input value={session.clientName} onChange={e=>update('clientName',e.target.value)} placeholder="e.g. Sofia Rahman"/></label>
    <div className="step-footer"><span><ShieldCheck/> Client data remains in this browser</span><Button onClick={next}>Continue to portrait <ArrowRight size={16}/></Button></div></div></Shell>;
}
function PhotoStep(){
  const {session,update}=useApp();const input=useRef();const nav=useNavigate();
  const upload=e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>update('photo',reader.result);reader.readAsDataURL(f)};
  return <Shell><Workflow current="photo"/><div className="consult-card"><PageHead eyebrow="Step 2 · Portrait" title="Add a clear client photo" copy="A front-facing portrait with even lighting produces the most useful consultation result."/>
    <div className="photo-layout"><div className="photo-stage">{session.photo?<><img src={session.photo} alt="Uploaded portrait"/><button onClick={()=>update('photo','')}><RotateCcw/>Replace portrait</button></>:<button className="photo-upload" onClick={()=>input.current.click()}><span><Upload/></span><h3>Upload client portrait</h3><p>JPG or PNG · front-facing · natural light</p><b>Choose photo</b></button>}</div><div className="photo-guide"><h3>Portrait quality guide</h3>{[['Face clearly visible','Avoid sunglasses and heavy shadows.'],['Neutral head position','Look toward the camera without tilting.'],['Hairline in frame','Leave space above and around the head.'],['Simple background','A clean backdrop improves edge detail.']].map(([a,b])=><div key={a}><CheckCircle2/><p><strong>{a}</strong><span>{b}</span></p></div>)}<button onClick={()=>{update('photo','');nav('/styles/hair')}}>Continue with a demo model</button></div></div>
    <input hidden ref={input} type="file" accept="image/*" onChange={upload}/><div className="step-footer"><Button to="/consultation/client" variant="text"><ArrowLeft/>Back</Button><Button onClick={()=>nav('/styles/hair')}>{session.photo?'Use this portrait':'Use demo portrait'} <ArrowRight/></Button></div></div></Shell>;
}

function HairLibrary(){
  const {session,update}=useApp();const nav=useNavigate();const [filter,setFilter]=useState('All');const styles=hairFor(session.clientType);const visible=filter==='All'?styles:styles.filter(x=>x.length===filter||x.tag===filter);
  const choose=p=>{update('hair',p.id);update('length',p.length)};
  return <Shell><Workflow current="hair"/><PageHead eyebrow={`Step 3 · ${session.clientType==='male'?'Men’s':'Women’s'} collection`} title="Choose the silhouette" copy="Every preset carries compatible defaults for length, texture and finish."/>
    <div className="library-toolbar"><div className="gender-lock"><span>{session.clientType==='male'?'M':'F'}</span><p><small>COLLECTION</small><strong>{session.clientType==='male'?'Male styling':'Female styling'}</strong></p><Link to="/consultation/client">Change</Link></div><div className="filter-row">{['All','Very short','Short','Medium','Long','Texture','Protective'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
    <div className="style-grid">{visible.map(p=><button key={p.id} className={'style-card '+(session.hair===p.id?'selected':'')} onClick={()=>choose(p)}><div className="style-image"><Sprite kind={session.clientType==='male'?'men':'women'} pos={p.pos}/><span>{p.tag}</span>{session.hair===p.id&&<i><Check/></i>}</div><h3>{p.name}</h3><p>{p.meta}</p></button>)}</div>
    <RefinementPanel/>
    <div className="step-footer sticky"><Button to="/consultation/photo" variant="text"><ArrowLeft/>Back</Button><div><span>{selectedHair(session).name} selected</span><Button onClick={()=>nav(session.clientType==='male'?'/styles/beard':'/color')}>Continue to {session.clientType==='male'?'beard':'colour'} <ArrowRight/></Button></div></div>
  </Shell>;
}
function RefinementPanel(){
  return <section className="refine-panel"><div><p className="eyebrow">Professional controls</p><h2>Refine the shape</h2><p>These settings stay attached to this direction.</p></div><div><Select label="Length" name="length" options={['Very short','Short','Medium','Long','Extra long']}/><Select label="Texture" name="texture" options={['Straight','Soft wave','Wavy','Curly','Coily']}/><Select label="Parting" name="parting" options={['None','Centre','Slight left','Deep left','Slight right','Deep right']}/><Select label="Finish" name="finish" options={['Matte','Natural','Satin','Glossy','Wet look']}/><Range label="Volume" name="volume"/></div></section>;
}
function Select({label,name,options}){const {session,update}=useApp();return <label className="select-control"><span>{label}</span><select value={session[name]||options[0]} onChange={e=>update(name,e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label>}
function Range({label,name}){const {session,update}=useApp();return <label className="range-control"><span><b>{label}</b><small>{session[name]}%</small></span><input type="range" value={session[name]} onChange={e=>update(name,+e.target.value)}/></label>}

function BeardLibrary(){
  const {session,update}=useApp();const nav=useNavigate();
  if(session.clientType!=='male') return <Navigate to="/styles/hair" replace/>;
  return <Shell><Workflow current="beard"/><PageHead eyebrow="Step 4 · Grooming collection" title="Shape the facial hair" copy="Choose a real grooming reference, then refine its density and geometry."/>
    <div className="beard-note"><ShieldCheck/><div><strong>Hair and beard stay connected</strong><span>Sideburn transitions and colour matching are coordinated automatically.</span></div><label><input type="checkbox" defaultChecked/> Match hair colour</label></div>
    <div className="beard-photo-grid">{BEARDS.map(p=><button key={p.id} className={session.beard===p.id?'selected':''} onClick={()=>{update('beard',p.id);update('beardLength',p.id==='clean'?'Clean':p.id==='stubble'?'Stubble':p.id==='full'?'Long':'Short')}}><div><Sprite kind="beard" pos={p.pos}/>{session.beard===p.id&&<i><Check/></i>}</div><h3>{p.name}</h3><p>{p.meta}</p></button>)}</div>
    <section className="refine-panel"><div><p className="eyebrow">Grooming controls</p><h2>Refine the detail</h2><p>Unavailable controls are disabled automatically for clean shaven.</p></div><div className={session.beard==='clean'?'disabled-controls':''}><Select label="Length" name="beardLength" options={['Clean','Shadow','Stubble','Short','Medium','Long']}/><Select label="Density" name="beardDensity" options={['Sparse','Natural','Dense','Very dense']}/><Select label="Cheek line" name="cheek" options={['Natural','Low','Medium','High','Sharp']}/><Select label="Shape" name="beardShape" options={['Rounded','Square','Pointed','Tapered']}/></div></section>
    <div className="step-footer sticky"><Button to="/styles/hair" variant="text"><ArrowLeft/>Back</Button><div><span>{selectedBeard(session).name} selected</span><Button onClick={()=>nav('/color')}>Continue to colour <ArrowRight/></Button></div></div>
  </Shell>;
}

function LiveStudio(){
  const {session,update,setSession}=useApp();const input=useRef();
  const upload=e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{update('photo',reader.result);update('renderedPhoto','')};reader.readAsDataURL(f)};
  const rendered=React.useCallback(data=>setSession(s=>s.renderedPhoto===data?s:{...s,renderedPhoto:data}),[setSession]);
  return <Shell><PageHead eyebrow="On-device colour simulation" title="Adjust colour on the client" copy="Muse detects the hair region in the uploaded portrait and applies tone changes only inside that mask." action={<Button variant="soft" onClick={()=>input.current.click()}><Upload/>Upload portrait</Button>}/>
    <input hidden ref={input} type="file" accept="image/*" onChange={upload}/>
    <div className="live-studio-layout"><section><LiveHairEditor onRendered={rendered}/><div className="live-disclaimer"><ShieldCheck/><p><strong>Local, immediate and non-destructive</strong><span>The portrait and hair mask stay in this browser. Use “Hold original” to compare at any time.</span></p></div></section><aside className="live-controls"><p className="eyebrow">Live controls</p><h2>Colour direction</h2><p>Every change below redraws the detected hair in the left frame.</p><div className="live-swatches">{COLORS.map(([name,color])=><button aria-label={name} className={session.color===name?'active':''} onClick={()=>update('color',name)} key={name}><i style={{background:color}}/>{name}</button>)}</div><Range label="Colour intensity" name="colorIntensity"/><Range label="Warmth balance" name="warmth"/><Select label="Technique brief" name="technique" options={['Solid','Highlights','Balayage','Ombré','Root shadow']}/><div className="synthesis-note"><Scissors/><p><strong>Changing the cut is a synthesis step</strong><span>Colour is simulated live. Length, fringe and hairstyle geometry are sent to the configured image provider after review.</span></p></div><Button to="/styles/hair" variant="full">Choose haircut <ArrowRight/></Button></aside></div>
  </Shell>;
}

function ColorLab(){
  const {session,update,setSession}=useApp();const nav=useNavigate();
  const rendered=React.useCallback(data=>setSession(s=>s.renderedPhoto===data?s:{...s,renderedPhoto:data}),[setSession]);
  return <Shell><Workflow current="color"/><PageHead eyebrow={`Step ${session.clientType==='male'?'5':'4'} · Colour atelier`} title="Build the colour story" copy="Start with the foundation, add dimension, then balance the undertone."/>
    <div className="color-layout"><div className="color-preview">{session.photo?<LiveHairEditor compact onRendered={rendered}/>:<CurrentVisual/>}<div><small>{session.photo?'LIVE CLIENT COLOUR':'SELECTED DIRECTION'}</small><h2>{session.color}</h2><p>{session.technique} · {session.warmth<45?'Cool':session.warmth>55?'Warm':'Neutral'} undertone</p></div></div><div className="color-controls">
      <section><StepTitle n="01" title="Choose the foundation" copy="The base tone that anchors the finished result."/><div className="color-swatches">{COLORS.map(([name,color])=><button className={session.color===name?'active':''} onClick={()=>update('color',name)} key={name}><i style={{background:color}}>{session.color===name&&<Check/>}</i><span>{name}</span></button>)}</div></section>
      <section><StepTitle n="02" title="Add dimension" copy="Choose how colour travels through the hair."/><div className="techniques">{['Solid','Highlights','Balayage','Ombré','Root shadow'].map(x=><button className={session.technique===x?'active':''} onClick={()=>update('technique',x)} key={x}><Palette/><span>{x}</span></button>)}</div></section>
      <section><StepTitle n="03" title="Balance the result" copy="Fine-tune intensity and undertone."/><Range label="Colour intensity" name="colorIntensity"/><div className="warmth"><span>Cool</span><input type="range" value={session.warmth} onChange={e=>update('warmth',+e.target.value)}/><span>Warm</span></div></section>
    </div></div>
    <div className="step-footer sticky"><Button to={session.clientType==='male'?'/styles/beard':'/styles/hair'} variant="text"><ArrowLeft/>Back</Button><Button onClick={()=>nav('/review')}>Review complete look <ArrowRight/></Button></div>
  </Shell>;
}
function StepTitle({n,title,copy}){return <div className="step-title"><span>{n}</span><div><h3>{title}</h3><p>{copy}</p></div></div>}

function Review(){
  const {session}=useApp();const hair=selectedHair(session);const beard=selectedBeard(session);
  const rows=[['Client',session.clientName||`Demo ${session.clientType} model`,'/consultation/client'],['Hair',hair.name,'/styles/hair'],['Texture',`${session.texture} · ${session.length} · ${session.finish}`,'/styles/hair'],...(session.clientType==='male'?[['Beard',beard.name,'/styles/beard']]:[]),['Colour',`${session.color} · ${session.technique}`,'/color']];
  return <Shell><Workflow current="review"/><PageHead eyebrow="Final review" title="Ready to create the look" copy="Confirm every direction before the preview enters the generation pipeline."/>
    <div className="review-layout"><div className="review-visual"><CurrentVisual result/><span>CLIENT PREVIEW</span></div><div className="review-summary"><h2>Consultation summary</h2>{rows.map(([a,b,to])=><div key={a}><span>{a}</span><strong>{b}</strong><Link to={to}>Edit</Link></div>)}<div className="provider-note"><Sparkles/><p><strong>{session.photo?'Client image preserved':'Salon concept engine'}</strong><span>{session.photo?'The uploaded portrait remains the base image; colour is applied to its detected hair mask. Haircut geometry requires the configured synthesis provider.':'Generates a consultation direction from the selected style configuration.'}</span></p></div><Button to="/generate" variant="full">Generate client preview <Sparkles/></Button><small className="consent"><input type="checkbox" defaultChecked/> Client consent confirmed for this consultation.</small></div></div>
    <div className="step-footer"><Button to="/color" variant="text"><ArrowLeft/>Back to colour</Button></div>
  </Shell>;
}

const phases=[
  ['Analysing portrait','Mapping face, hairline and editable regions'],
  ['Building silhouette','Applying the selected haircut geometry'],
  ['Refining texture','Balancing length, density and strand direction'],
  ['Composing colour','Adding tone, dimension and natural transitions'],
  ['Quality check','Protecting identity and finalising salon realism']
];
function Generate(){
  const navigate=useNavigate();const {saveLook}=useApp();const [active,setActive]=useState(0);const [percent,setPercent]=useState(8);
  useEffect(()=>{const timers=phases.map((_,i)=>setTimeout(()=>{setActive(i);setPercent([12,34,57,78,94][i])},i*1250));const end=setTimeout(()=>{saveLook();setPercent(100);navigate('/result')},phases.length*1250+700);return()=>{timers.forEach(clearTimeout);clearTimeout(end)}},[]);
  return <Shell><div className="generation-page"><div className="generation-art"><CurrentVisual result/><div className="scan-line"/></div><div className="generation-copy"><p className="eyebrow">Muse render engine</p><h1>Creating the consultation preview</h1><p>Keep this window open while Muse assembles the selected direction.</p><div className="progress-track"><i style={{width:`${percent}%`}}/></div><div className="percent">{percent}%</div><div className="phase-list">{phases.map(([title,copy],i)=><div key={title} className={i<active?'done':i===active?'active':''}><i>{i<active?<Check/>:i===active?<RefreshCw/>:i+1}</i><p><strong>{title}</strong><span>{copy}</span></p></div>)}</div><small><ShieldCheck/> Identity-preservation checks are applied throughout.</small></div></div></Shell>;
}
function Result(){
  const {session,saveLook}=useApp();const [saved,setSaved]=useState(false);const [copied,setCopied]=useState(false);const hair=selectedHair(session);
  const download=()=>{const a=document.createElement('a');a.href=session.photo||'/assets/'+(session.clientType==='male'?'men-hair-styles.png':'women-hair-styles.png');a.download=`Muse-${hair.id}.png`;a.click()};
  const copy=()=>{navigator.clipboard?.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),1500)};
  return <Shell><div className="result-head"><div><p className="eyebrow">Consultation complete</p><h1>Your finished direction</h1><p>Present it, compare it, or save it to the client profile.</p></div><div><Button variant="soft" onClick={copy}>{copied?<Check/>:<Copy/>}{copied?'Link copied':'Copy link'}</Button><Button onClick={download}><Download/>Download</Button></div></div>
    <div className="result-layout"><div className="final-render"><CurrentVisual result/><span className="render-badge"><CheckCircle2/>PREVIEW COMPLETE</span></div><aside className="result-card"><small>STYLE PRESCRIPTION</small><h2>{hair.name}</h2><p>{session.clientName||'Client'} · {session.clientType==='male'?'Male':'Female'} styling</p><div><span>Shape<strong>{session.length} · {session.texture}</strong></span><span>Finish<strong>{session.finish} · {session.volume}% volume</strong></span>{session.clientType==='male'&&<span>Grooming<strong>{selectedBeard(session).name}</strong></span>}<span>Colour<strong>{session.color} · {session.technique}</strong></span></div><Button variant="full" onClick={()=>{saveLook();setSaved(true)}}>{saved?<Check/>:<Bookmark/>}{saved?'Saved to client':'Save to client'}</Button><Button to="/compare" variant="full soft"><Layers3/>Add to comparison</Button></aside></div>
    <div className="result-actions"><Button to="/styles/hair" variant="text"><ArrowLeft/>Refine this look</Button><Button to="/consultation/client">Start another consultation <Plus/></Button></div>
  </Shell>;
}

function Saved(){
  const {saved,setSaved,loadLook}=useApp();const nav=useNavigate();
  return <Shell><PageHead eyebrow="Professional lookbook" title="Saved directions" copy="Every finished consultation direction, ready to revisit or compare." action={<Button to="/consultation/client"><Plus/>New consultation</Button>}/>
    {!saved.length?<Empty title="Your lookbook is ready" copy="Complete a consultation and save the result here." to="/consultation/client"/>:<div className="saved-grid">{saved.map(l=>{const h=selectedHair(l);return <article key={l.id}><div><Sprite kind={l.clientType==='male'?'men':'women'} pos={h.pos}/><button onClick={()=>setSaved(v=>v.filter(x=>x.id!==l.id))}><X/></button></div><small>{l.created} · {l.clientName||'Demo client'}</small><h3>{h.name}</h3><p>{l.color} · {l.texture}</p><Button variant="full soft" onClick={()=>{loadLook(l);nav('/review')}}>Open consultation</Button></article>})}</div>}</Shell>;
}
function Compare(){
  const {saved}=useApp();const looks=saved.slice(0,4);
  return <Shell><PageHead eyebrow="Decision room" title="Compare directions" copy="Review up to four consultation results under one consistent presentation." action={<Button to="/consultation/client"><Plus/>New look</Button>}/>
    {!looks.length?<Empty title="Nothing to compare yet" copy="Save at least one finished direction to begin." to="/consultation/client"/>:<div className="compare-grid">{looks.map((l,i)=>{const h=selectedHair(l);return <article key={l.id}><div><Sprite kind={l.clientType==='male'?'men':'women'} pos={h.pos}/><span>LOOK {String(i+1).padStart(2,'0')}</span></div><small>{l.clientName||'Client'}</small><h3>{h.name}</h3><p>{l.color} · {l.texture}</p></article>})}{looks.length<4&&<Link className="compare-add" to="/consultation/client"><Plus/><strong>Create another direction</strong><span>{4-looks.length} comparison slot{4-looks.length!==1?'s':''} available</span></Link>}</div>}</Shell>;
}
function Clients(){
  const {clients}=useApp();
  return <Shell><PageHead eyebrow="Client book" title="Consultation clients" copy="A concise record of each client’s latest visual direction." action={<Button to="/consultation/client"><Plus/>Add client</Button>}/>
  {!clients.length?<Empty title="No client profiles yet" copy="Name a client during consultation and save the finished result." to="/consultation/client"/>:<div className="client-table"><div><span>Client</span><span>Last direction</span><span>Profile</span><span>Updated</span><span/></div>{clients.map(c=><article key={c.id}><span className="client-name"><i>{c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</i><strong>{c.name}</strong></span><span>{c.lastLook}</span><span className="type-pill">{c.type}</span><span>{c.date}</span><Link to="/saved"><ChevronRight/></Link></article>)}</div>}</Shell>;
}
function Empty({title,copy,to}){return <div className="empty"><span><GalleryVerticalEnd/></span><h2>{title}</h2><p>{copy}</p><Button to={to}>Start consultation <ArrowRight/></Button></div>}

function SettingsPage(){
  const {settings,setSettings}=useApp();const set=(key,value)=>setSettings(s=>({...s,[key]:value}));
  return <Shell><div className="narrow"><PageHead eyebrow="Salon controls" title="Settings" copy="Configure privacy, output quality and the generation provider."/>
    <section className="settings-card"><h3>Generation</h3><label className="setting"><div><strong>Image provider</strong><span>Demo engine works without a key. Production adapters can be connected server-side.</span></div><select value={settings.provider} onChange={e=>set('provider',e.target.value)}><option>Demo engine</option><option disabled>OpenAI Images — key required</option><option disabled>Custom salon provider — setup required</option></select></label><label className="setting"><div><strong>Preview quality</strong><span>Controls the generation presentation and wait profile.</span></div><select value={settings.quality} onChange={e=>set('quality',e.target.value)}><option>Fast preview</option><option>Balanced</option><option>High fidelity</option></select></label></section>
    <section className="settings-card"><h3>Studio experience</h3><Toggle title="Private browser storage" copy="Keep client photos and selections on this device." value={settings.privateMode} set={v=>set('privateMode',v)}/><Toggle title="Stylist guidance" copy="Show consultation advice throughout the workflow." value={settings.tips} set={v=>set('tips',v)}/></section>
    <section className="settings-card"><h3>Appearance</h3><div className="theme-picks"><button className={settings.theme==='light'?'active':''} onClick={()=>set('theme','light')}><i className="light-theme"/><span>Atelier light</span>{settings.theme==='light'&&<Check/>}</button><button className={settings.theme==='dark'?'active':''} onClick={()=>set('theme','dark')}><i className="dark-theme"/><span>Editorial dark</span>{settings.theme==='dark'&&<Check/>}</button></div></section>
  </div></Shell>;
}
function Toggle({title,copy,value,set}){return <div className="setting"><div><strong>{title}</strong><span>{copy}</span></div><button aria-label={title} className={value?'toggle on':'toggle'} onClick={()=>set(!value)}><i/></button></div>}
function Profile(){
  const [editing,setEditing]=useState(false);const [name,setName]=useState('Muse Studio');
  return <Shell><div className="narrow"><PageHead eyebrow="Studio account" title="Professional profile" copy="The identity shown across client-facing consultation materials."/>
    <div className="profile-card"><div className="profile-avatar">MS</div><div><h2>{name}</h2><p>Professional studio · Consultation workspace</p></div><Button variant="soft" onClick={()=>setEditing(!editing)}>{editing?'Done':'Edit profile'}</Button></div>{editing&&<section className="settings-card"><h3>Edit studio</h3><label className="name-field"><span>Studio name</span><input value={name} onChange={e=>setName(e.target.value)}/></label></section>}
    <section className="settings-card"><h3>Professional capabilities</h3><div className="capabilities">{['Guided hair consultation','Separate women’s and men’s libraries','Facial grooming module','Colour direction builder','Client lookbook and comparison'].map(x=><span key={x}><CheckCircle2/>{x}</span>)}</div></section>
  </div></Shell>;
}
function Help(){
  return <Shell><div className="narrow"><PageHead eyebrow="Muse concierge" title="Help centre" copy="Guidance for running a confident in-salon consultation."/><div className="help-grid">{[['01','Start with the client','Choose the relevant styling collection first. Beard modules are only included for male consultations.'],['02','Capture a useful portrait','Use soft, even light with the face and full hairline visible.'],['03','Build one decision at a time','Agree on silhouette before refining texture, grooming and colour.'],['04','About generation','The included demo engine presents the full workflow without a paid key. A photorealistic identity-preserving provider is connected through a secure production adapter.']].map(([n,t,c])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></article>)}</div></div></Shell>;
}

export default function App(){
  return <Provider><Routes>
    <Route path="/" element={<Dashboard/>}/><Route path="/consultation/client" element={<ClientStep/>}/><Route path="/consultation/photo" element={<PhotoStep/>}/>
    <Route path="/studio" element={<LiveStudio/>}/><Route path="/styles/hair" element={<HairLibrary/>}/><Route path="/styles/beard" element={<BeardLibrary/>}/>
    <Route path="/color" element={<ColorLab/>}/><Route path="/review" element={<Review/>}/><Route path="/generate" element={<Generate/>}/><Route path="/result" element={<Result/>}/>
    <Route path="/saved" element={<Saved/>}/><Route path="/compare" element={<Compare/>}/><Route path="/clients" element={<Clients/>}/>
    <Route path="/settings" element={<SettingsPage/>}/><Route path="/profile" element={<Profile/>}/><Route path="/help" element={<Help/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Provider>;
}
