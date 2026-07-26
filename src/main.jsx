import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bookmark, Check, ChevronRight, CircleUserRound, Clock3,
  Download, Droplets, GalleryVerticalEnd, HelpCircle, Home, Image as ImageIcon,
  Layers3, Menu, Palette, Plus, RotateCcw, Scissors, Settings, SlidersHorizontal,
  Sparkles, Upload, UserRound, WandSparkles, X
} from 'lucide-react';
import './styles.css';

const HAIR = [
  { id:'soft-bob', name:'Soft sculpted bob', meta:'Chin length · polished', tag:'Signature', image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85' },
  { id:'curtain', name:'Airy curtain layers', meta:'Medium · natural', tag:'Trending', image:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85' },
  { id:'pixie', name:'Modern soft pixie', meta:'Short · textured', tag:'Editorial', image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85' },
  { id:'waves', name:'Long undone waves', meta:'Long · voluminous', tag:'Popular', image:'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85' },
  { id:'crop', name:'Textured French crop', meta:'Short · matte', tag:'Classic', image:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85' },
  { id:'slick', name:'Sculpted slick back', meta:'Medium · polished', tag:'Runway', image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85' }
];
const BEARDS = [
  {id:'clean', name:'Clean shaven', meta:'Precise · timeless'}, {id:'stubble', name:'Soft stubble', meta:'3–5 days · natural'},
  {id:'boxed', name:'Short boxed', meta:'Structured · refined'}, {id:'full', name:'Full sculpted', meta:'Dense · balanced'},
  {id:'goatee', name:'Modern goatee', meta:'Defined · minimal'}, {id:'anchor', name:'Anchor beard', meta:'Sharp · expressive'}
];
const COLORS = [
  ['Natural black','#181514'], ['Espresso','#33211d'], ['Chocolate','#553329'], ['Chestnut','#784b37'],
  ['Warm caramel','#ad7650'], ['Honey blonde','#c69d6d'], ['Copper','#a85433'], ['Burgundy','#641c27'],
  ['Soft silver','#b7b3ae'], ['Platinum','#ded5c4']
];
const defaultLook = { hair:'soft-bob', beard:'clean', length:'Medium', texture:'Soft wave', volume:62, density:'Natural', finish:'Satin', fade:'None', color:'Espresso', technique:'Solid', warmth:52 };

const AppContext = createContext();
function useApp(){ return useContext(AppContext); }
function Provider({children}){
  const [look,setLook] = useState(()=>JSON.parse(localStorage.getItem('muse-look')||'null')||defaultLook);
  const [photo,setPhoto] = useState(()=>localStorage.getItem('muse-photo')||'');
  const [saved,setSaved] = useState(()=>JSON.parse(localStorage.getItem('muse-saved')||'[]'));
  useEffect(()=>localStorage.setItem('muse-look',JSON.stringify(look)),[look]);
  useEffect(()=>localStorage.setItem('muse-saved',JSON.stringify(saved)),[saved]);
  const update=(key,value)=>setLook(v=>({...v,[key]:value}));
  const save=()=>setSaved(v=>[{...look,id:Date.now(),created:new Date().toLocaleDateString()},...v]);
  return <AppContext.Provider value={{look,setLook,update,photo,setPhoto,saved,setSaved,save}}>{children}</AppContext.Provider>
}

const nav = [
  ['/',Home,'Overview'], ['/studio',WandSparkles,'Studio'], ['/styles/hair',Scissors,'Hair library'],
  ['/styles/beard',UserRound,'Beard library'], ['/color',Palette,'Colour lab'], ['/compare',Layers3,'Compare'],
  ['/saved',Bookmark,'Saved looks']
];
function Shell({children,wide=false}){
  const [mobile,setMobile]=useState(false);
  const {pathname}=useLocation();
  return <div className="shell">
    <aside className={mobile?'sidebar open':'sidebar'}>
      <button className="close-nav" onClick={()=>setMobile(false)}><X size={20}/></button>
      <Link to="/" className="brand" onClick={()=>setMobile(false)}><span className="brand-mark">M</span><span>MUSE<small>VIRTUAL STUDIO</small></span></Link>
      <nav className="nav">
        <p>Workspace</p>
        {nav.map(([to,Icon,label])=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setMobile(false)}><Icon size={18}/>{label}</NavLink>)}
      </nav>
      <div className="side-bottom">
        <NavLink to="/help"><HelpCircle size={18}/> Help centre</NavLink>
        <NavLink to="/settings"><Settings size={18}/> Settings</NavLink>
        <NavLink to="/profile" className="profile-mini"><span>NA</span><div>Nadia A.<small>Personal studio</small></div><ChevronRight size={16}/></NavLink>
      </div>
    </aside>
    {mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}
    <main className={wide?'main wide':'main'}>
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb">Muse <span>/</span> {nav.find(n=>pathname===n[0])?.[2]||'Studio'}</div><div className="top-actions"><span className="status-dot"/> Private session <Link to="/profile" className="avatar">NA</Link></div></header>
      {children}
    </main>
  </div>
}

function Button({children,to,variant='',onClick,disabled=false}){
  const cls='button '+variant;
  return to?<Link className={cls} to={to}>{children}</Link>:<button className={cls} onClick={onClick} disabled={disabled}>{children}</button>
}
function PageHead({eyebrow,title,copy,action}){
 return <div className="page-head"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy&&<p>{copy}</p>}</div>{action}</div>
}
function Portrait({className=''}) {
 const {photo,look}=useApp(); const preset=HAIR.find(x=>x.id===look.hair)||HAIR[0];
 return <div className={'portrait '+className} style={{backgroundImage:`url("${photo||preset.image}")`}}>
   <div className="portrait-shade"/><span className="look-chip"><Sparkles size={13}/>{look.color} · {look.texture}</span>
 </div>
}

function Overview(){
 const {saved}=useApp();
 return <Shell><div className="page">
  <section className="hero">
   <div className="hero-copy"><p className="eyebrow light">Your personal style atelier</p><h1>See yourself,<br/><em>reimagined.</em></h1><p>Explore considered hair, beard, and colour directions—crafted around you, without the commitment.</p><div className="hero-actions"><Button to="/studio">Start a new look <ArrowRight size={17}/></Button><Button to="/styles/hair" variant="ghost-light">Explore styles</Button></div><div className="trust"><span><Check/> Private by design</span><span><Check/> Free preview studio</span></div></div>
   <div className="hero-art"><div className="arch"><Portrait/></div><div className="floating-card"><small>CURATED FOR YOU</small><strong>Soft, dimensional shapes</strong><span>Based on your last session</span></div></div>
  </section>
  <section className="content-section">
   <div className="section-title"><div><p className="eyebrow">Your atelier</p><h2>Continue creating</h2></div><Link to="/saved">View all looks <ArrowRight size={16}/></Link></div>
   <div className="quick-grid">
    <Link to="/studio" className="new-look"><span><Plus/></span><h3>Create a new look</h3><p>Upload a portrait and begin your consultation.</p></Link>
    <Link to="/styles/hair" className="feature-card"><img src={HAIR[1].image}/><div><small>STYLE EDIT</small><h3>Airy layers</h3><p>Explore movement and softness</p></div></Link>
    <Link to="/color" className="feature-card colour-card"><div className="swatch-stack"><i/><i/><i/></div><div><small>COLOUR STORY</small><h3>Warm brunette</h3><p>Find your most flattering tone</p></div></Link>
   </div>
   <div className="stats-row"><div><strong>{saved.length}</strong><span>Saved looks</span></div><div><strong>18</strong><span>Curated styles</span></div><div><strong>10</strong><span>Colour stories</span></div><div><strong>100%</strong><span>Private in-browser</span></div></div>
  </section>
 </div></Shell>
}

function Studio(){
 const {photo,setPhoto,look,save}=useApp(); const input=useRef(); const [generated,setGenerated]=useState(false); const [busy,setBusy]=useState(false);
 const upload=e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{setPhoto(reader.result);try{localStorage.setItem('muse-photo',reader.result)}catch{}};reader.readAsDataURL(f)};
 const generate=()=>{setBusy(true);setGenerated(false);setTimeout(()=>{setBusy(false);setGenerated(true)},1300)};
 return <Shell wide><div className="studio-page">
  <div className="studio-head"><div><p className="eyebrow">Virtual consultation</p><h1>Create your look</h1></div><div><Button variant="soft" onClick={()=>input.current.click()}><Upload size={16}/> Upload portrait</Button><Button onClick={generate} disabled={!photo||busy}><Sparkles size={16}/>{busy?'Crafting preview…':'Preview look'}</Button></div></div>
  <input ref={input} type="file" accept="image/*" hidden onChange={upload}/>
  <div className="studio-grid">
   <section className="preview-panel">
    {!photo?<button className="upload-zone" onClick={()=>input.current.click()}><span><ImageIcon/></span><h2>Begin with a portrait</h2><p>Choose a clear, front-facing photo in natural light.</p><b>Choose photo</b><small>JPG or PNG · stays on this device</small></button>:
    <div className={'canvas '+(busy?'processing':'')}><Portrait/><div className="canvas-toolbar"><button onClick={()=>setPhoto('')}><RotateCcw size={16}/> Replace</button><span>{generated?'Preview composed':'Original portrait'}</span><button><Download size={16}/> Export</button></div>{busy&&<div className="processing-state"><Sparkles/><strong>Composing your look</strong><span>Balancing shape, tone and texture…</span></div>}</div>}
    <div className="privacy-note"><span><Check/></span><div><strong>Your image stays yours</strong><p>This free studio processes selections in your browser. No portrait is uploaded.</p></div></div>
   </section>
   <aside className="controls">
    <div className="control-tabs"><Link to="/styles/hair" className="active">Hair</Link><Link to="/styles/beard">Beard</Link><Link to="/color">Colour</Link></div>
    <SelectedLook/>
    <ControlSelect label="Length" name="length" options={['Very short','Short','Medium','Long','Extra long']}/>
    <ControlSelect label="Texture" name="texture" options={['Straight','Soft wave','Wavy','Curly','Coily']}/>
    <ControlRange label="Volume" name="volume"/>
    <ControlSelect label="Density" name="density" options={['Light','Natural','Full','Thick']}/>
    <ControlSelect label="Finish" name="finish" options={['Matte','Natural','Satin','Glossy','Wet look']}/>
    <div className="control-summary"><small>CURRENT DIRECTION</small><p>{look.length} · {look.texture} · {look.color}</p></div>
    <Button variant="full soft" onClick={save}><Bookmark size={16}/> Save this direction</Button>
   </aside>
  </div>
 </div></Shell>
}
function SelectedLook(){
 const {look}=useApp();const p=HAIR.find(x=>x.id===look.hair)||HAIR[0];
 return <Link to="/styles/hair" className="selected-look"><img src={p.image}/><div><small>SELECTED STYLE</small><strong>{p.name}</strong><span>{p.meta}</span></div><ChevronRight/></Link>
}
function ControlSelect({label,name,options}){const {look,update}=useApp();return <label className="control-row"><span>{label}</span><select value={look[name]} onChange={e=>update(name,e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label>}
function ControlRange({label,name}){const {look,update}=useApp();return <label className="range-row"><span><b>{label}</b><small>{look[name]}%</small></span><input type="range" value={look[name]} onChange={e=>update(name,+e.target.value)}/></label>}

function HairLibrary(){
 const {look,update}=useApp();const navigate=useNavigate();
 return <Shell><div className="page">
  <PageHead eyebrow="The style edit" title="Find your silhouette" copy="Curated shapes, from quiet classics to a bolder new point of view." action={<Button to="/studio">Return to studio <ArrowRight size={16}/></Button>}/>
  <div className="filter-row"><button className="active">All styles</button><button>Short</button><button>Medium</button><button>Long</button><button>Textured</button><button>Protective</button><span/><button><SlidersHorizontal size={15}/> Refine</button></div>
  <div className="style-grid">{HAIR.map(p=><button key={p.id} className={'style-card '+(look.hair===p.id?'selected':'')} onClick={()=>{update('hair',p.id)}}>
   <div className="style-image"><img src={p.image}/><span>{p.tag}</span>{look.hair===p.id&&<i><Check/></i>}</div><div><h3>{p.name}</h3><p>{p.meta}</p></div>
  </button>)}</div>
  <div className="selection-bar"><div><span className="mini-preview" style={{backgroundImage:`url(${(HAIR.find(x=>x.id===look.hair)||HAIR[0]).image})`}}/><p><small>YOUR SELECTION</small><strong>{(HAIR.find(x=>x.id===look.hair)||HAIR[0]).name}</strong></p></div><Button onClick={()=>navigate('/studio')}>Customize in studio <ArrowRight size={16}/></Button></div>
 </div></Shell>
}

function BeardLibrary(){
 const {look,update}=useApp();
 return <Shell><div className="page">
  <PageHead eyebrow="The grooming edit" title="Shape with intention" copy="Considered beard and moustache directions designed to balance your features." action={<Button to="/studio">Try in studio <ArrowRight size={16}/></Button>}/>
  <div className="beard-intro"><div><Scissors/><p><strong>A considered detail</strong><span>Beard previews preserve your selected hair direction and colour relationship.</span></p></div><label>Colour relationship <select><option>Match hair automatically</option><option>Independent colour</option><option>Natural salt & pepper</option></select></label></div>
  <div className="beard-grid">{BEARDS.map((b,i)=><button onClick={()=>update('beard',b.id)} className={look.beard===b.id?'selected':''} key={b.id}><div className="beard-icon"><span className={'beard-shape b'+i}/>{look.beard===b.id&&<i><Check/></i>}</div><h3>{b.name}</h3><p>{b.meta}</p></button>)}</div>
  <section className="groom-controls"><h2>Refine the detail</h2><div><ControlSelect label="Length" name="beardLength" options={['Clean','Shadow','Stubble','Short','Medium','Long']}/><ControlSelect label="Density" name="beardDensity" options={['Sparse','Natural','Dense','Very dense']}/><ControlSelect label="Cheek line" name="cheek" options={['Natural','Low','Medium','High','Sharp']}/><ControlSelect label="Shape" name="beardShape" options={['Rounded','Square','Pointed','Tapered']}/></div></section>
 </div></Shell>
}

function ColorLab(){
 const {look,update}=useApp();
 return <Shell><div className="page color-page">
  <PageHead eyebrow="Colour atelier" title="Discover your tone" copy="Build a nuanced colour story—from quiet depth to luminous dimension." action={<Button to="/studio">Preview colour <Sparkles size={16}/></Button>}/>
  <div className="color-layout">
   <div className="color-portrait"><Portrait/><div><small>YOUR COLOUR DIRECTION</small><h2>{look.color}</h2><p>{look.technique} colour · {look.warmth<45?'Cool':look.warmth>55?'Warm':'Neutral'} undertone</p></div></div>
   <div className="color-controls">
    <section><div className="section-label"><span>01</span><div><h3>Choose your foundation</h3><p>The base tone that anchors your look.</p></div></div><div className="color-swatches">{COLORS.map(([name,color])=><button className={look.color===name?'active':''} onClick={()=>update('color',name)} key={name}><i style={{background:color}}>{look.color===name&&<Check/>}</i><span>{name}</span></button>)}</div></section>
    <section><div className="section-label"><span>02</span><div><h3>Add dimension</h3><p>Choose how colour moves through the hair.</p></div></div><div className="techniques">{['Solid','Highlights','Balayage','Ombré','Root shadow'].map(x=><button className={look.technique===x?'active':''} onClick={()=>update('technique',x)} key={x}><Droplets/><span>{x}</span></button>)}</div></section>
    <section><div className="section-label"><span>03</span><div><h3>Balance the warmth</h3><p>Fine-tune the undertone.</p></div></div><div className="warmth"><span>Cool</span><input type="range" value={look.warmth} onChange={e=>update('warmth',+e.target.value)}/><span>Warm</span></div></section>
   </div>
  </div>
 </div></Shell>
}

function Compare(){
 const {saved}=useApp();const looks=saved.length?saved.slice(0,4):[defaultLook,{...defaultLook,hair:'curtain',color:'Chestnut'},{...defaultLook,hair:'pixie',color:'Burgundy'}];
 return <Shell><div className="page"><PageHead eyebrow="The fitting room" title="Compare your directions" copy="Place your strongest options side by side. The right choice often becomes obvious." action={<Button to="/studio"><Plus size={16}/> New direction</Button>}/>
  <div className="compare-grid">{looks.map((l,i)=>{const p=HAIR.find(x=>x.id===l.hair)||HAIR[0];return <article key={l.id||i}><div style={{backgroundImage:`url(${p.image})`}}><span>LOOK {String(i+1).padStart(2,'0')}</span>{i===0&&<b>FAVOURITE</b>}</div><h3>{p.name}</h3><p>{l.color} · {l.texture}</p><Button to="/studio" variant="soft">Refine look</Button></article>})}<Link to="/studio" className="compare-add"><Plus/><strong>Add another look</strong><span>Up to four directions</span></Link></div>
  <div className="consult-tip"><Sparkles/><div><strong>A stylist’s note</strong><p>Compare silhouette first, then colour. Shape has the greatest effect on how a style balances your features.</p></div></div>
 </div></Shell>
}

function Saved(){
 const {saved,setSaved}=useApp();
 return <Shell><div className="page"><PageHead eyebrow="Your collection" title="Saved looks" copy="A private edit of the directions worth returning to." action={<Button to="/studio"><Plus size={16}/> Create look</Button>}/>
  {!saved.length?<Empty icon={Bookmark} title="Your collection is waiting" copy="Save a direction from the studio and it will appear here." button="Open the studio" to="/studio"/>:
  <div className="saved-grid">{saved.map(l=>{const p=HAIR.find(x=>x.id===l.hair)||HAIR[0];return <article key={l.id}><div style={{backgroundImage:`url(${p.image})`}}><button onClick={()=>setSaved(v=>v.filter(x=>x.id!==l.id))}><X/></button></div><small>{l.created}</small><h3>{p.name}</h3><p>{l.color} · {l.texture} · {l.length}</p><Button to="/studio" variant="soft">Open direction</Button></article>})}</div>}
 </div></Shell>
}
function Empty({icon:Icon,title,copy,button,to}){return <div className="empty"><span><Icon/></span><h2>{title}</h2><p>{copy}</p><Button to={to}>{button} <ArrowRight size={16}/></Button></div>}

function SettingsPage(){
 const [privateMode,setPrivate]=useState(true);const [tips,setTips]=useState(true);
 return <Shell><div className="page narrow"><PageHead eyebrow="Preferences" title="Settings" copy="Shape the studio around the way you like to work."/>
  <div className="settings-card"><h3>Studio experience</h3><Setting title="Private browser processing" copy="Keep portraits and previews on this device." value={privateMode} set={setPrivate}/><Setting title="Stylist guidance" copy="Show considered tips while refining a look." value={tips} set={setTips}/><label className="setting select-setting"><div><strong>Default preview quality</strong><span>Higher quality uses more device resources.</span></div><select><option>Balanced</option><option>High fidelity</option><option>Fast preview</option></select></label></div>
  <div className="settings-card"><h3>Appearance</h3><div className="theme-picks"><button className="active"><i className="light-theme"/><span>Atelier light</span><Check/></button><button><i className="dark-theme"/><span>Editorial dark</span></button></div></div>
 </div></Shell>
}
function Setting({title,copy,value,set}){return <div className="setting"><div><strong>{title}</strong><span>{copy}</span></div><button className={value?'toggle on':'toggle'} onClick={()=>set(!value)}><i/></button></div>}
function Profile(){
 return <Shell><div className="page narrow"><PageHead eyebrow="Personal studio" title="Your profile" copy="Your preferences help keep every consultation coherent."/>
  <div className="profile-card"><div className="profile-avatar">NA</div><div><h2>Nadia A.</h2><p>Personal studio · Joined 2026</p></div><Button variant="soft">Edit profile</Button></div>
  <div className="settings-card"><h3>Style profile</h3><div className="profile-fields"><label>Preferred direction<select><option>Modern & understated</option><option>Classic</option><option>Editorial</option></select></label><label>Hair texture<select><option>Soft wave</option><option>Straight</option><option>Curly</option><option>Coily</option></select></label><label>Consultation goal<select><option>Explore a new cut</option><option>Find a colour</option><option>Grooming refresh</option></select></label></div></div>
 </div></Shell>
}
function Help(){
 return <Shell><div className="page narrow"><PageHead eyebrow="Concierge" title="How can we help?" copy="Simple guidance for a better virtual consultation."/>
  <div className="help-grid">{[['For the best portrait','Face the camera in soft, even light. Keep hair away from the face where possible.'],['About free previews','This version demonstrates the complete styling workflow without sending your photo to a paid AI service.'],['Connecting generation','A production image provider can be connected later through a secure server-side adapter.']].map(([t,c],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{c}</p></article>)}</div>
 </div></Shell>
}

export default function App(){
 return <Provider><Routes>
  <Route path="/" element={<Overview/>}/><Route path="/studio" element={<Studio/>}/><Route path="/styles/hair" element={<HairLibrary/>}/>
  <Route path="/styles/beard" element={<BeardLibrary/>}/><Route path="/color" element={<ColorLab/>}/><Route path="/compare" element={<Compare/>}/>
  <Route path="/saved" element={<Saved/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="/profile" element={<Profile/>}/>
  <Route path="/help" element={<Help/>}/><Route path="*" element={<Shell><Empty icon={Scissors} title="This page slipped out" copy="Let’s return to your atelier." button="Go home" to="/"/></Shell>}/>
 </Routes></Provider>
}
