"use client";
import {useState,type CSSProperties} from "react";
import type {AtlasImage} from "@/data/history-atlas";
import s from "./HistoryAtlas.module.css";

/** One hue per phase; the same hue tints the band, the life lines, the cards and the minimap. */
const PHASE_COLORS:Record<string,string>={"early-bronze":"#a07850","intermediate-bronze":"#8c7b6b","middle-bronze":"#b9894a","late-bronze":"#c46a3c",iron1:"#7a8f4a",united:"#c8a03a",divided:"#5f7fb3",background:"#8e98a8",persian:"#4f83ff",hellenistic:"#1fb5a3",hasmonean:"#d6a21e",roman:"#e5534b",herod:"#f08a32",successors:"#9c6cff",revolt:"#ff4f7b",aftermath:"#c06c84",hadrian:"#b8562e",mishnah:"#3f9d6b",crisis:"#8a6fb0",constantine:"#c9a227",holyland:"#2f8fbf",contest:"#5c7cfa",churches:"#24a889",justinian:"#d9a21b",end:"#d9534f"};
const SPARE=["#4f83ff","#1fb5a3","#d6a21e","#e5534b","#f08a32","#9c6cff","#ff4f7b"];
export const phaseColor=(id:string,index=0)=>PHASE_COLORS[id]??SPARE[index%SPARE.length];
export const tint=(id:string,index=0)=>({"--pc":phaseColor(id,index)}) as CSSProperties;

export function Face({image,name,large=false}:{image?:AtlasImage;name:string;large?:boolean}){
 const [failed,setFailed]=useState(false);
 return <span className={large?s.faceLarge:s.face} aria-hidden={large?undefined:true}>
  {image&&!failed?<img src={image.localSrc} alt={large?image.alt:""} width={large?240:72} height={large?280:72} loading="lazy" draggable={false} onError={()=>setFailed(true)}/>:<span>{name.replace(/[^א-תA-Za-z]/g,"").slice(0,2)}</span>}{/* eslint-disable-line @next/next/no-img-element */}
 </span>;
}
