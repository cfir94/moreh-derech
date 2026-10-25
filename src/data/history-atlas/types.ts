export type AtlasImage={localSrc:string;alt:string;caption:string;sourceUrl:string;credit:string;license:string;licenseUrl:string;note?:string};
export type AtlasNode={id:string;kind:"person"|"event";title:string;subtitle:string;date:string;phase:string;from:number;to:number;rank:1|2|3;summary:string;fields:{label:string;text:string}[];source:string;caution?:string;mentionOnly?:boolean;unplaced?:boolean;related:string[];image?:AtlasImage;art?:number;originalHref:string};
export type AtlasPhase={id:string;title:string;from:number;to:number;note:string;context?:boolean;featured?:string[]};
export type AtlasRelation={from:string;to:string;label:string};
export type AtlasCollection={id:string;title:string;subtitle:string;from:number;to:number;contextFrom:number;contextTo:number;phases:AtlasPhase[];nodes:AtlasNode[];relations:AtlasRelation[];sourceHref:string};
export type AtlasWindow={from:number;to:number};
export type AtlasLevel="overview"|"context"|"detail";
