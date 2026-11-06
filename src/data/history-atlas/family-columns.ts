import type {AtlasNode,AtlasRelation,AtlasSlot} from "./types";

/**
 * A child stands in or beside its parent's column — Samuel straight under Hannah, not across the tree from her —
 * or, when that column is taken in the child's years or already holds a brother or sister, in the free column
 * nearest to it. Figures are taken in the
 * order they come in, so a parent is settled before its children. A figure only moves into a column that is free
 * in all its years (one may begin the year another ends, never the year it begins), so no two figures of one
 * column overlap. Columns stay within their group.
 */
export function familyColumns(nodes:AtlasNode[],relations:AtlasRelation[],slots:Record<string,AtlasSlot>,width:(group:string)=>number):Record<string,AtlasSlot>{
 const out={...slots};
 const parentsOf=(id:string)=>relations.filter(r=>r.kind==="parent"&&r.to===id).map(r=>r.from).filter(p=>out[p]);
 const free=(n:AtlasNode,group:string,slot:number)=>nodes.every(o=>o.id===n.id||!out[o.id]||out[o.id].group!==group||out[o.id].slot!==slot||(n.from!==o.from&&(n.from>=o.to||o.from>=n.to)));
 for(const child of [...nodes].filter(n=>n.kind==="person"&&out[n.id]).sort((a,b)=>a.from-b.from)){
  const own=out[child.id],parents=parentsOf(child.id).map(p=>out[p]).filter(p=>p.group===own.group);
  if(!parents.length)continue;
  const distance=(slot:number)=>Math.min(...parents.map(p=>Math.abs(p.slot-slot)));
  // Right beside the parent is close enough: in a dense age (the Hasmoneans, a generation every few years) one
  // column cannot hold a whole line, so only a child standing two columns away or more is moved.
  if(distance(own.slot)<=1)continue;
  // One child takes the parent's own column — the one already there, or the first to come; a brother or sister
  // stands beside it (Mattathias's sons side by side, not stacked in one column).
  const siblings=new Set(relations.filter(r=>r.kind==="parent"&&parents.length&&parentsOf(child.id).includes(r.from)&&r.to!==child.id).map(r=>r.to));
  const taken=(slot:number)=>[...siblings].some(id=>out[id]?.group===own.group&&out[id]?.slot===slot);
  // A move must not pull a figure away from the brother or wife it is drawn beside (Phasael beside Herod).
  const partners=relations.filter(r=>(r.kind==="sibling"||r.kind==="spouse")&&(r.from===child.id||r.to===child.id)).map(r=>out[r.from===child.id?r.to:r.from]).filter(p=>p&&p.group===own.group);
  const cost=(slot:number)=>distance(slot)+(partners.length?Math.min(...partners.map(p=>Math.abs(p.slot-slot))):0);
  const best=Array.from({length:width(own.group)},(_,slot)=>slot).filter(slot=>free(child,own.group,slot)&&!taken(slot)).sort((a,b)=>cost(a)-cost(b)||distance(a)-distance(b)||a-b)[0];
  if(best!==undefined&&cost(best)<cost(own.slot))out[child.id]={group:own.group,slot:best};
 }
 return out;
}
