import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChevronDown, Grid3X3, Minus, Redo2, Ruler, Settings, Trash2, Undo2, X, ZoomIn, ZoomOut} from 'lucide-react';
import './styles.css';
import {formatLength, GRID_SIZE, lineLength, snap, UNIT_OPTIONS} from './drawing';

function App(){
  const [lines,setLines]=useState([]), [redo,setRedo]=useState([]);
  const [draft,setDraft]=useState(null), [grid,setGrid]=useState(true), [settings,setSettings]=useState(false);
  const [unit,setUnit]=useState(UNIT_OPTIONS[0]), [zoom,setZoom]=useState(1), [cursor,setCursor]=useState({x:0,y:0});
  const board=useRef(null);
  const touches=useRef(new Map()), pinch=useRef(null);
  const allLines=useMemo(()=>draft?[...lines,draft]:lines,[lines,draft]);
  const point=e=>{const r=board.current.getBoundingClientRect(); return {x:snap((e.clientX-r.left)/zoom),y:snap((e.clientY-r.top)/zoom)}};
  const down=e=>{ if(e.button!==0)return; e.currentTarget.setPointerCapture(e.pointerId); if(e.pointerType==='touch'){touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.current.size===2){const [a,b]=[...touches.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};setDraft(null);return}} const p=point(e); setDraft({...p,x1:p.x,y1:p.y,x2:p.x,y2:p.y}); };
  const move=e=>{if(e.pointerType==='touch'&&touches.current.has(e.pointerId)){touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.current.size===2&&pinch.current){const [a,b]=[...touches.current.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y);setZoom(Math.max(.6,Math.min(1.6,pinch.current.zoom*distance/pinch.current.distance)));return}}const p=point(e);setCursor(p); if(draft)setDraft(d=>({...d,x2:p.x,y2:p.y}));};
  const up=e=>{if(e?.pointerType==='touch'){touches.current.delete(e.pointerId);if(pinch.current){if(!touches.current.size)pinch.current=null;setDraft(null);return}}if(draft){if(draft.x1!==draft.x2||draft.y1!==draft.y2){setLines(v=>[...v,draft]);setRedo([])}setDraft(null)}};
  const undo=()=>setLines(v=>{if(!v.length)return v; setRedo(r=>[...r,v.at(-1)]);return v.slice(0,-1)});
  const redoLine=()=>setRedo(v=>{if(!v.length)return v;setLines(l=>[...l,v.at(-1)]);return v.slice(0,-1)});
  useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redoLine():undo()}if(e.key==='Escape')setDraft(null)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[lines,redo,draft]);
  return <main className="app">
    <header className="topbar">
      <div className="brand"><div className="logo"><Ruler size={19}/></div><div><strong>Project Blue</strong><span>Plan freely</span></div></div>
      <div className="project"><span>Untitled drawing</span><ChevronDown size={15}/></div>
      <div className="actions">
        <button className="iconBtn" onClick={undo} disabled={!lines.length} title="Undo"><Undo2/></button>
        <button className="iconBtn" onClick={redoLine} disabled={!redo.length} title="Redo"><Redo2/></button>
        <div className="divider"/>
        <button className={`settingsBtn ${settings?'active':''}`} onClick={()=>setSettings(v=>!v)}><Settings size={17}/> Settings</button>
        <button className="share">Share</button>
      </div>
    </header>
    <section className="workspace">
      <div className="toolbox">
        <div className="tool active"><Minus size={20}/><span>Line</span><kbd>L</kbd></div>
        <div className="tool tablet-tip"><span>Draw with finger or pencil</span></div>
      </div>
      <div className="canvas-wrap" ref={board} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <svg className="canvas" style={{width:`${100/zoom}%`,height:`${100/zoom}%`,transform:`scale(${zoom})`}}>
          <defs><pattern id="dots" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#9aa7b4"/></pattern></defs>
          {grid&&<rect width="100%" height="100%" fill="url(#dots)"/>}
          {allLines.map((l,i)=>{const midX=(l.x1+l.x2)/2,midY=(l.y1+l.y2)/2;return <g key={i} className={i===allLines.length-1&&draft?'draft':''}>
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}/><circle cx={l.x1} cy={l.y1} r="4"/><circle cx={l.x2} cy={l.y2} r="4"/>
            <g transform={`translate(${midX} ${midY})`}><rect x="-28" y="-12" width="56" height="24" rx="6"/><text y="4">{formatLength(lineLength(l,unit.feet))}</text></g>
          </g>})}
        </svg>
        {!lines.length&&!draft&&<div className="hint"><div className="hintIcon"><Minus/></div><strong>Click and drag to draw a line</strong><span>Lines snap to the nearest grid point</span></div>}
        <div className="coords">X {Math.round(cursor.x/GRID_SIZE)} &nbsp; Y {Math.round(cursor.y/GRID_SIZE)}</div>
      </div>
      {settings&&<aside className="panel">
        <div className="panelHead"><div><span>DRAWING</span><h2>Settings</h2></div><button className="close" onClick={()=>setSettings(false)}><X/></button></div>
        <div className="setting"><div><Grid3X3/><div><b>Dotted grid</b><small>Show snap points on canvas</small></div></div><button className={`switch ${grid?'on':''}`} onClick={()=>setGrid(v=>!v)}><i/></button></div>
        <div className="settingBlock"><label>Scale per square</label><p>Measurements update automatically.</p><div className="choices">{UNIT_OPTIONS.map(o=><button key={o.label} onClick={()=>setUnit(o)} className={unit.label===o.label?'selected':''}><span>{o.short}</span><small>{o.label}</small></button>)}</div></div>
        <div className="snapInfo"><div className="snapDot"/><div><b>Snap to grid is on</b><small>Line endpoints attach to grid points</small></div></div>
        <button className="clear" disabled={!lines.length} onClick={()=>{setLines([]);setRedo([])}}><Trash2 size={16}/> Clear drawing</button>
      </aside>}
      <div className="zoom"><button onClick={()=>setZoom(z=>Math.max(.6,z-.1))}><ZoomOut/></button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(1.6,z+.1))}><ZoomIn/></button></div>
      <div className="scale"><span>{unit.short} / square</span><div/></div>
      <nav className="tabletDock" aria-label="Tablet drawing controls">
        <button className="primary" aria-label="Line tool"><Minus/><span>Line</span></button>
        <button onClick={undo} disabled={!lines.length} aria-label="Undo"><Undo2/><span>Undo</span></button>
        <button onClick={redoLine} disabled={!redo.length} aria-label="Redo"><Redo2/><span>Redo</span></button>
        <button onClick={()=>setGrid(v=>!v)} className={grid?'selected':''} aria-label="Toggle grid"><Grid3X3/><span>Grid</span></button>
        <button onClick={()=>setSettings(true)} aria-label="Open settings"><Settings/><span>Settings</span></button>
      </nav>
    </section>
  </main>
}
createRoot(document.getElementById('root')).render(<App/>);
