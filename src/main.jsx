import React,{useEffect,useMemo,useRef,useState}from"react";
import{createRoot}from"react-dom/client";
import{Film,FolderOpen,Play,Pause,SkipBack,SkipForward,Scissors,Volume2,Music2,Type,Sparkles,Layers,SlidersHorizontal,Settings,Search,Upload,ChevronDown,Undo2,Redo2,ZoomIn,ZoomOut,Maximize2,MousePointer2,Hand,Trash2,Save,FolderOpen as OpenIcon}from"lucide-react";
import"./styles.css";

const seed=[
{id:1,name:"Intro.mp4",type:"video",start:0,duration:5.2,url:""},
{id:2,name:"Main footage.mp4",type:"video",start:5.2,duration:12.5,url:""},
{id:3,name:"Music.wav",type:"audio",start:0,duration:17.7,url:""}
];
const videoExt=/\.(mp4|mov|mkv|webm)$/i;
const audioExt=/\.(mp3|wav|ogg|m4a)$/i;

function App(){
 const[clips,setClips]=useState(seed),[selected,setSelected]=useState(2),[playing,setPlaying]=useState(false),[tab,setTab]=useState("Media"),[zoom,setZoom]=useState(1),[time,setTime]=useState(8.42);
 const[history,setHistory]=useState([]),[future,setFuture]=useState([]),videoRef=useRef(null),timer=useRef(null);
 const selectedClip=clips.find(c=>c.id===selected);
 const duration=Math.max(17.7,...clips.map(c=>c.start+c.duration),1);

 const push=next=>{setHistory(h=>h.concat([clips]).slice(-40));setFuture([]);setClips(next)};
 const add=async()=>{
   const fs=window.voidEdit?await window.voidEdit.openMedia():[];
   const added=await Promise.all(fs.map(async(f,i)=>new Promise(resolve=>{
     const isAudio=audioExt.test(f), el=document.createElement(isAudio?"audio":"video");
     el.src="voidmedia://"+encodeURIComponent(f.replace(/\\/g,"/"));
     el.onloadedmetadata=()=>resolve({id:Date.now()+i,name:f.split(/[\\/]/).pop(),type:isAudio?"audio":"video",start:0,duration:Number.isFinite(el.duration)?el.duration:6,url:el.src});
     el.onerror=()=>resolve({id:Date.now()+i,name:f.split(/[\\/]/).pop(),type:isAudio?"audio":"video",start:0,duration:6,url:el.src});
   })));
   if(added.length)push(clips.concat(added));
 };
 const undo=()=>{if(!history.length)return;const h=history[history.length-1];setFuture(f=>f.concat([clips]));setHistory(history.slice(0,-1));setClips(h)};
 const redo=()=>{if(!future.length)return;const n=future[future.length-1];setHistory(h=>h.concat([clips]));setFuture(future.slice(0,-1));setClips(n)};
 const remove=()=>{if(selected==null)return;push(clips.filter(c=>c.id!==selected));setSelected(null)};
 const split=()=>{const c=selectedClip;if(!c||time<=c.start+.05||time>=c.start+c.duration-.05)return;const a={...c,duration:time-c.start},b={...c,id:Date.now(),start:time,duration:c.duration-a.duration};push(clips.map(x=>x.id===c.id?a:x).concat(b));setSelected(b.id)};
 const seek=t=>{const n=Math.max(0,Math.min(duration,t));setTime(n);if(videoRef.current)videoRef.current.currentTime=Math.max(0,n-(selectedClip?.start||0))};
 useEffect(()=>{if(!playing){clearInterval(timer.current);return}timer.current=setInterval(()=>setTime(t=>{const n=t+.033;if(n>=duration){setPlaying(false);return 0}return n}),33);return()=>clearInterval(timer.current)},[playing,duration]);
 useEffect(()=>{const key=e=>{if(e.code==="Space"&&!["INPUT","SELECT"].includes(e.target.tagName)){e.preventDefault();setPlaying(p=>!p)}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();undo()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();save()}if(e.key==="Delete")remove()};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)});
 const save=async()=>window.voidEdit?.saveProject({version:1,clips,selected,time});
 const open=async()=>{const p=await window.voidEdit?.openProject();if(p?.clips){push(p.clips);setSelected(p.selected??null);setTime(p.time??0)}};
 const url=selectedClip?.url;
 return <div className="app">
  <header className="top"><div className="brand"><b className="logo">V</b><strong>VoidEdit</strong><small>BETA</small></div><div className="project">My Project <ChevronDown size={14}/></div><div className="actions"><button onClick={undo} disabled={!history.length}><Undo2 size={17}/></button><button onClick={redo} disabled={!future.length}><Redo2 size={17}/></button><button onClick={open}><OpenIcon size={16}/></button><button onClick={save}><Save size={16}/></button><button className="export">Export <ChevronDown size={14}/></button><button><Settings size={17}/></button></div></header>
  <main><aside>{["Media","Audio","Text","Effects","Transitions","Filters"].map((x,i)=>{const I=[FolderOpen,Music2,Type,Sparkles,Layers,SlidersHorizontal][i];return <button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}><I size={19}/><span>{x}</span></button>})}</aside>
   <section className="work">
    <div className="media"><div className="head"><b>{tab}</b><div className="search"><Search size={14}/><input placeholder="Search media"/></div></div>{tab==="Media"?<><div className="grid">{clips.filter(c=>c.type==="video").map(c=><div draggable onDragStart={e=>e.dataTransfer.setData("clip",String(c.id))} className={selected===c.id?"card selected":"card"} onClick={()=>setSelected(c.id)} key={c.id}><div className="thumb">{c.url?<video src={c.url} muted/>:<Film size={24}/>}<em>{c.duration.toFixed(1)}s</em></div><span>{c.name}</span></div>)}</div><button className="import" onClick={add}><Upload size={15}/> Import media</button></>:<div className="empty"><Sparkles size={30}/><b>{tab} tools</b><span>Drag a tool onto a clip to apply it.</span></div>}</div>
    <div className="preview"><div className="head"><span>Preview</span><div><button><Maximize2 size={15}/></button></div></div><div className="canvas">{url&&selectedClip?.type==="video"?<video ref={videoRef} src={url} controls={false} muted={false} onTimeUpdate={e=>setTime((selectedClip.start||0)+e.currentTarget.currentTime)} />:<div><h2>{selectedClip?.name||"VoidEdit"}</h2><p>Import media to start editing</p></div>}</div><div className="transport"><button onClick={()=>seek(0)}><SkipBack size={17}/></button><button className="play" onClick={()=>setPlaying(!playing)}>{playing?<Pause size={18}/>:<Play size={18}/>}</button><button onClick={()=>seek(Math.min(duration,time+5))}><SkipForward size={17}/></button><span>{format(time)} / {format(duration)}</span><div className="vol"><Volume2 size={15}/><i/></div></div></div>
    <div className="inspector"><div className="head"><b>Inspector</b><span>{selectedClip?"Clip":"None"}</span></div>{selectedClip?<div className="props"><label>Position</label><div className="two"><input value="0" readOnly/><input value="0" readOnly/></div><label>Scale <span>100%</span></label><input type="range" defaultValue="100"/><label>Opacity <span>100%</span></label><input type="range" defaultValue="100"/><label>Speed</label><select defaultValue="1"><option>0.5×</option><option>1×</option><option>1.5×</option><option>2×</option></select><button onClick={remove} className="danger"><Trash2 size={14}/> Delete clip</button></div>:<div className="empty"><b>No clip selected</b><span>Select a clip on the timeline.</span></div>}</div>
   </section>
  </main>
  <section className="timeline"><div className="tbar"><div><button className="active"><MousePointer2 size={15}/></button><button><Hand size={15}/></button><button onClick={split}><Scissors size={15}/></button></div><span>{format(time)}</span><div className="zoom"><ZoomOut size={14}/><input type="range" min="1" max="4" step=".1" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><ZoomIn size={14}/></div></div><div className="tracks"><div className="ruler" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();seek((e.clientX-r.left)/36/zoom)}}>{Array.from({length:12},(_,i)=><span key={i}>{String(i*2).padStart(2,"0")}:00</span>)}</div>{["V1","A1"].map((label,idx)=><div className="track" key={label} onDragOver={e=>e.preventDefault()} onDrop={e=>{const id=Number(e.dataTransfer.getData("clip")),r=e.currentTarget.getBoundingClientRect(),t=Math.max(0,(e.clientX-r.left-110)/36/zoom);push(clips.map(c=>c.id===id?{...c,start:t}:c))}}><b className="label">{label}</b>{clips.filter(c=>idx?c.type==="audio":c.type==="video").map(c=><div key={c.id} onClick={()=>setSelected(c.id)} className={selected===c.id?"clip chosen":"clip"} style={{left:(110+c.start*36*zoom)+"px",width:Math.max(40,c.duration*36*zoom)+"px"}}><strong>{c.name}</strong><small>{idx?"Audio":"Video"}</small></div>)}</div>)}<div className="playhead" style={{left:(110+time*36*zoom)+"px"}}/></div></section>
  <footer><span>1080p · 30 FPS</span><span>Auto-save on</span><span>Ready</span></footer>
 </div>
}
function format(n){const s=Math.max(0,n||0),m=Math.floor(s/60),sec=(s%60).toFixed(2).padStart(5,"0");return String(m).padStart(2,"0")+":"+sec}
createRoot(document.getElementById("root")).render(<App/>);
