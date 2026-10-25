"use client";
import {useState,type CSSProperties} from "react";
import {estimate,type AtlasImage,type Measure} from "@/data/history-atlas";
import s from "./HistoryAtlas.module.css";

/** One hue per phase; the same hue tints the band, the bars, the cards and the minimap. */
const PHASE_COLORS:Record<string,string>={background:"#8e98a8",persian:"#4f83ff",hellenistic:"#1fb5a3",hasmonean:"#d6a21e",roman:"#e5534b",herod:"#f08a32",successors:"#9c6cff",revolt:"#ff4f7b",aftermath:"#8e98a8"};
const SPARE=["#4f83ff","#1fb5a3","#d6a21e","#e5534b","#f08a32","#9c6cff","#ff4f7b"];
export const phaseColor=(id:string,index=0)=>PHASE_COLORS[id]??SPARE[index%SPARE.length];
export const tint=(id:string,index=0)=>({"--pc":phaseColor(id,index)}) as CSSProperties;

export function Face({image,name,large=false}:{image?:AtlasImage;name:string;large?:boolean}){
 const [failed,setFailed]=useState(false);
 return <span className={large?s.faceLarge:s.face} aria-hidden={large?undefined:true}>
  {image&&!failed?<img src={image.localSrc} alt={large?image.alt:""} width={large?240:72} height={large?280:72} loading="lazy" draggable={false} onError={()=>setFailed(true)}/>:<span>{name.replace(/[^א-תA-Za-z]/g,"").slice(0,2)}</span>}{/* eslint-disable-line @next/next/no-img-element */}
 </span>;
}

/** Sizes must match the CSS of `.label strong`, `.label small` and `.cardTitle`. */
const FONTS={name:"700 13.5px",role:"500 11.5px",title:"650 13px"};
export function textMeasure():Measure{
 if(typeof document==="undefined")return estimate;
 const context=document.createElement("canvas").getContext("2d");
 if(!context)return estimate;
 const family=getComputedStyle(document.body).fontFamily||"sans-serif",cache=new Map<string,number>();
 return (text,font)=>{
  const key=font+"|"+text;let width=cache.get(key);
  if(width===undefined){context.font=FONTS[font]+" "+family;width=Math.ceil(context.measureText(text).width*1.04)+2;cache.set(key,width);}
  return width;
 };
}
