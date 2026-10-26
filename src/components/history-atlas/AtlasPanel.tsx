"use client";
import Link from "next/link";
import {useEffect,useRef} from "react";
import {isPlaced,type AtlasCollection,type AtlasNode,type AtlasRelationKind} from "@/data/history-atlas";
import {Face,tint} from "./shared";
import s from "./HistoryAtlas.module.css";

type Props={
 collection:AtlasCollection;sources:{id:string;title:string;type:string}[];node:AtlasNode|null;
 previous:AtlasNode|null;next:AtlasNode|null;position:string;
 onOpen:(id:string)=>void;onFocusTime:()=>void;onClose:()=>void;
};

const ORDER:AtlasRelationKind[]=["parent","grandparent","spouse","sibling","succession","patron","parallel","rival","contact"];
const KIND_LABEL:Record<AtlasRelationKind,string>={parent:"משפחה",grandparent:"משפחה",spouse:"משפחה",sibling:"משפחה",succession:"רצף",patron:"חסות",parallel:"לצד",rival:"יריבות",contact:"מגע"};

/** The card beside the tree (a sheet from below on narrow screens). It stays mounted and slides. */
export function AtlasPanel({collection,sources,node,previous,next,position,onOpen,onFocusTime,onClose}:Props){
 const close=useRef<HTMLButtonElement>(null),scroll=useRef<HTMLDivElement>(null),open=Boolean(node);
 useEffect(()=>{if(node){scroll.current?.scrollTo({top:0});close.current?.focus({preventScroll:true});}},[node]);
 const byId=(id:string)=>collection.nodes.find(n=>n.id===id);
 const phase=node?collection.phases.find(p=>p.id===node.phase):undefined;
 const relations=node?collection.relations.filter(r=>r.from===node.id||r.to===node.id).sort((a,b)=>ORDER.indexOf(a.kind)-ORDER.indexOf(b.kind)).map(r=>({label:r.label,kind:r.kind,other:byId(r.from===node.id?r.to:r.from)!})):[];
 const named=new Set(relations.map(r=>r.other.id));
 const related=node?(node.kind==="person"?node.related:collection.nodes.filter(n=>n.kind==="person"&&n.related.includes(node.id)).map(n=>n.id).concat(node.related)).map(byId).filter((n):n is AtlasNode=>Boolean(n)&&!named.has(n!.id)):[];
 const art=node?collection.illustrations[node.id]:undefined;
 return <aside className={s.panel} data-open={open||undefined} data-atlas-detail aria-labelledby="atlas-detail-title" aria-hidden={!open} inert={!open} style={node?tint(node.phase):undefined}>
  <div className={s.panelInner}>{node&&<>
   <header className={s.panelHead}>
    <span>{node.kind==="person"?"דמות":"אירוע"} · {phase?.title}</span>
    <button ref={close} type="button" aria-label="סגירת פריט האטלס" onClick={onClose}>×</button>
   </header>
   <div ref={scroll} className={s.panelBody}>
    {art&&<figure className={s.art}><img src={art.src} alt={art.alt} width={480} height={480}/><figcaption>{art.caption}</figcaption></figure>}{/* eslint-disable-line @next/next/no-img-element */}
    <div className={s.hero}>
     {node.kind==="person"?<Face key={node.id} image={node.image} name={node.title} large/>:!art&&<span className={s.heroMark} aria-hidden/>}
     <div><h2 id="atlas-detail-title">{node.title}</h2><p className={s.heroDate}>{node.date}</p>{node.kind==="person"&&!node.date.startsWith(node.subtitle)&&<p className={s.heroRole}>{node.subtitle}</p>}</div>
    </div>
    <p className={s.lead}>{node.summary}</p>
    {node.mentionOnly&&<p className={s.caution}><b>אזכור בלבד · אינו אירוע מתוארך</b></p>}
    {node.caution&&<p className={s.caution}>{node.caution}</p>}
    <div className={s.panelActions}>
     {isPlaced(node)&&<button type="button" onClick={onFocusTime}>להתמקד בזמן הזה ←</button>}
     <Link href={node.originalHref}>לציר המפורט ←</Link>
    </div>
    {relations.length>0&&<section className={s.links2}><h3>קשרים לדמויות</h3>{relations.map(r=><button key={r.other.id+r.kind} type="button" data-relation={r.kind} style={tint(r.other.phase)} onClick={()=>onOpen(r.other.id)}><Face image={r.other.image} name={r.other.title}/><span><small>{r.label}</small><strong>{r.other.title}</strong></span><b>{KIND_LABEL[r.kind]}</b></button>)}</section>}
    {related.length>0&&<section className={s.links2}><h3>{node.kind==="person"?"אירועים קשורים":"דמויות ואירועים קשורים"}</h3>{related.map(n=><button key={n.id} type="button" style={tint(n.phase)} onClick={()=>onOpen(n.id)}>{n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}<span><small>{n.date}</small><strong>{n.title}</strong></span></button>)}</section>}
    <div className={s.fields}>{node.fields.filter(f=>f.text.trim()).map(f=><section key={f.label} data-exam={f.label==="נקודה למבחן"||undefined}><h3>{f.label}</h3><p>{f.text}</p></section>)}</div>
    {node.image&&<details className={s.source}><summary>על התמונה והזכויות</summary><p>{node.image.caption} {node.image.note}</p><p>{node.image.credit} · <a href={node.image.sourceUrl} target="_blank" rel="noreferrer">מקור התמונה ↗</a> · <a href={node.image.licenseUrl} target="_blank" rel="noreferrer">{node.image.license}</a></p></details>}
    <details className={s.source}><summary>מקור בחומר הנלמד</summary><p>{node.source}</p><ul>{sources.filter(source=>node.source.includes(source.id)).map(source=><li key={source.id}>{source.title} · {source.type}</li>)}</ul><a href={collection.sourceHref} target="_blank" rel="noreferrer">מחברת הקורס ↗</a></details>
   </div>
   {isPlaced(node)&&<footer className={s.tour}>
    <button type="button" disabled={!previous} onClick={()=>previous&&onOpen(previous.id)} aria-label={previous?"הקודם בזמן: "+previous.title:"אין פריט קודם"}><span aria-hidden>→</span><small>{previous?.title??"—"}</small></button>
    <b>{position}</b>
    <button type="button" disabled={!next} onClick={()=>next&&onOpen(next.id)} aria-label={next?"הבא בזמן: "+next.title:"אין פריט הבא"}><small>{next?.title??"—"}</small><span aria-hidden>←</span></button>
   </footer>}
  </>}</div>
 </aside>;
}
