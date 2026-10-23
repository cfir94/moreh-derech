import { mkdir, writeFile, readFile } from 'node:fs/promises';
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

const report=JSON.parse(await readFile('portrait-research/sources.json','utf8'));
const files={tiberius:'Head of Tiberius.jpg',quietus:'Lusius Quietus on Column of Trajan.jpg',theodosius1:'Gold Solidus of Theodosius I, 379-383.jpg'};
for(const [id,file] of Object.entries(files)){
 const q=await api('https://commons.wikimedia.org',{titles:'File:'+file,prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'500'});
 const image=q.pages[0].imageinfo[0],m=image.extmetadata;
 const row={id,file,title:people.find(x=>x[0]===id)[1],sourceUrl:image.descriptionurl,url:image.url,thumbnail:image.thumburl,width:image.width,height:image.height,description:plain(m.ImageDescription?.value),artist:plain(m.Artist?.value),credit:plain(m.Credit?.value),license:plain(m.LicenseShortName?.value),licenseUrl:m.LicenseUrl?.value??''};
 if(!/^(CC0|CC BY|Public domain|PD)/i.test(row.license))throw Error('Unapproved license '+row.license);
 if(id==='quietus')row.artist='The History of the World (1902); Hans F. Helmolt, editor; digitized by Internet Archive / University of California Libraries';
 let bytes;try{bytes=await get(image.thumburl??image.url);}catch{bytes=await get(image.url);}
 const output=await sharp(bytes).rotate().resize({width:480,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
 row.path=`public/images/roman-people/portraits/${id}.webp`;await writeFile(row.path,output);row.bytes=output.length;row.status='downloaded';
 report.splice(report.findIndex(x=>x.id===id),1,row);console.log(id,file,output.length);
}
const id='varus',url='https://www.livius.org/site/assets/files/10032/coin_varus_rgzm.jpg';
const bytes=await get(url),output=await sharp(bytes).rotate().resize({width:480,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
const row={id,title:'Publius Quinctilius Varus',file:'coin_varus_rgzm.jpg',sourceUrl:'https://www.livius.org/pictures/a/roman-portraits/varus/',url,description:'Coin of Varus, 8/7 BCE. Mainz, Römisch-Germanisches Zentralmuseum.',artist:'Jona Lendering / Livius.org',credit:'Jona Lendering / Livius.org',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',path:`public/images/roman-people/portraits/${id}.webp`,bytes:output.length,status:'downloaded'};
await writeFile(row.path,output);report.splice(report.findIndex(x=>x.id===id),1,row);console.log(id,output.length);
await writeFile('portrait-research/sources.json',JSON.stringify(report,null,2)+'\n');
console.log('Downloaded',report.filter(x=>x.status==='downloaded').length);
