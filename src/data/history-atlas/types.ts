export type AtlasImage={localSrc:string;alt:string;caption:string;sourceUrl:string;credit:string;license:string;licenseUrl:string;note?:string};
export type AtlasNode={id:string;kind:"person"|"event";title:string;subtitle:string;date:string;phase:string;from:number;to:number;rank:1|2|3;summary:string;fields:{label:string;text:string}[];source:string;caution?:string;mentionOnly?:boolean;unplaced?:boolean;related:string[];image?:AtlasImage;originalHref:string;
 /** A figure's years and end, shown at the top of its card (lives.ts). */
 life?:{lived:string;active:string;death:string}};
/** `pace` (default 1) scales the years a phase takes on the axis; long, thinly told ages use less. */
export type AtlasPhase={id:string;title:string;from:number;to:number;note:string;context?:boolean;featured?:string[];pace?:number};
/** Family, spouse, sibling and succession draw the tree; the rest appear when a figure is chosen. */
export type AtlasRelationKind="parent"|"grandparent"|"spouse"|"sibling"|"succession"|"rival"|"patron"|"parallel"|"contact";
export type AtlasRelation={from:string;to:string;label:string;kind:AtlasRelationKind};
/** A column group on the tree, such as the leadership in Judea or the foreign powers. */
export type AtlasGroup={id:string;title:string;note:string;slots:number};
export type AtlasSlot={group:string;slot:number};
/** A drawing for an event. `at` is the year the picture is placed on (historical, negative = BCE); left out, the middle of the event. */
export type AtlasIllustration={src:string;alt:string;caption:string;at?:number};
export type AtlasCollection={id:string;title:string;subtitle:string;from:number;to:number;contextFrom:number;contextTo:number;phases:AtlasPhase[];nodes:AtlasNode[];relations:AtlasRelation[];groups:AtlasGroup[];slots:Record<string,AtlasSlot>;illustrations:Record<string,AtlasIllustration>;sourceHref:string};
export type AtlasWindow={from:number;to:number};
export type AtlasLevel="overview"|"context"|"detail";
