import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const people = [
  ['pompey','Pompey'],['antony','Mark Antony'],['augustus','Augustus'],
  ['varus','Publius Quinctilius Varus'],['quirinius','Quirinius'],['tiberius','Tiberius'],
  ['pilate','Pontius Pilate'],['caligula','Caligula'],['claudius','Claudius'],['nero','Nero'],
  ['florus','Gessius Florus'],['cestius','Gaius Cestius Gallus (governor of Syria)'],
  ['vespasian','Vespasian'],['titus','Titus'],['domitian','Domitian'],['nerva','Nerva'],
  ['trajan','Trajan'],['quietus','Lusius Quietus'],['hadrian','Hadrian'],['pius','Antoninus Pius'],
  ['marcus','Marcus Aurelius'],['severus','Septimius Severus'],['caracalla','Caracalla'],
  ['diocletian','Diocletian'],['maxentius','Maxentius'],['licinius','Licinius'],
  ['constantine','Constantine the Great'],['helena','Helena, mother of Constantine I'],
  ['constantius','Constantius II'],['gallus','Constantius Gallus'],['julian','Julian (emperor)'],
  ['theodosius1','Theodosius I'],['theodosius2','Theodosius II'],['eudocia','Aelia Eudocia'],
  ['justinian','Justinian I'],['heraclius','Heraclius'],
];
const overrides = {
  augustus:'Augustus Prima Porta Louvre Ma1247.jpg',
  hadrian:'Bust Hadrian Musei Capitolini MC817.jpg',
  constantine:'Head Constantine Musei Capitolini MC1072 (cropped).jpg',
  justinian:'Mosaic of Justinianus I (cropped).jpg',
  cestius:'Cestius Gallus, RP-P-OB-46.197.jpg',
};
const userAgent='EvenDerechPortraitImport/1.0 (https://github.com/cfir94/moreh-derech; educational image attribution)';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url,json=false){
  let last;
  for(let attempt=0;attempt<3;attempt++)try{
    const res=await fetch(url,{headers:{'User-Agent':userAgent,Accept:json?'application/json':'image/*'},signal:AbortSignal.timeout(20000)});
    if(!res.ok)throw new Error(`HTTP ${res.status}: ${url}`);
    return json?await res.json():Buffer.from(await res.arrayBuffer());
  }catch(e){last=e;await delay(1500*(attempt+1));}
  throw last;
}
async function api(host,args){
  const url=new URL('/w/api.php',host);url.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',...args});
  const result=await get(url,true);if(result.error)throw new Error(JSON.stringify(result.error));return result.query;
}
function plain(value=''){return value.replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([a-f0-9]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
await mkdir('portrait-research',{recursive:true});
await mkdir('public/images/roman-people/portraits',{recursive:true});
const pages=await api('https://en.wikipedia.org',{titles:people.map(x=>x[1]).join('|'),redirects:'1',prop:'pageimages',piprop:'name',pilicense:'free'});
const pageMap=Object.fromEntries(pages.pages.map(p=>[p.title,p]));
const redirects=Object.fromEntries((pages.redirects??[]).map(x=>[x.from,x.to]));
const selection=people.map(([id,title])=>({id,title,resolvedTitle:redirects[title]??title,file:overrides[id]??pageMap[redirects[title]??title]?.pageimage}));
const titles=[...new Set(selection.filter(x=>x.file).map(x=>'File:'+x.file))];
const info=await api('https://commons.wikimedia.org',{titles:titles.join('|'),prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'500'});
const infoMap=Object.fromEntries(info.pages.map(x=>[x.title.replace(/^File:/,'').replaceAll('_',' '),x]));
const report=[];
for(const item of selection){
  const page=item.file?infoMap[item.file.replaceAll('_',' ')]:null;
  const image=page?.imageinfo?.[0];
  if(!image){report.push({...item,status:'missing'});console.log(item.id,'missing');continue;}
  const m=image.extmetadata??{};
  const row={...item,sourceUrl:image.descriptionurl,url:image.url,thumbnail:image.thumburl,width:image.width,height:image.height,
    description:plain(m.ImageDescription?.value),artist:plain(m.Artist?.value),credit:plain(m.Credit?.value),
    license:plain(m.LicenseShortName?.value),licenseUrl:m.LicenseUrl?.value??'',usageTerms:plain(m.UsageTerms?.value)};
  if(!/^(CC0|CC BY|Public domain|PD|GFDL)/i.test(row.license)||/\bNC\b|\bND\b/.test(row.license)){
    report.push({...row,status:'review-license'});console.log(item.id,'review-license',row.license);continue;
  }
  try{
    let bytes;try{bytes=await get(image.thumburl??image.url);}catch{bytes=await get(image.url);}
    const output=await sharp(bytes).rotate().resize({width:480,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
    const path=`public/images/roman-people/portraits/${item.id}.webp`;await writeFile(path,output);
    report.push({...row,status:'downloaded',path,bytes:output.length});console.log(item.id,'downloaded',output.length,item.file);
  }catch(e){report.push({...row,status:'download-error',error:String(e)});console.log(item.id,'download-error',String(e));}
  await delay(500);
}
await writeFile('portrait-research/sources.json',JSON.stringify(report,null,2)+'\n');
console.log('Collected',report.filter(x=>x.status==='downloaded').length,'of',people.length);
