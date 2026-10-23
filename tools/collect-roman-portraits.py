import json, urllib.request, urllib.parse, io, re, html, time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageDraw
ROOT=Path.cwd()
HEADERS={'User-Agent':'EvenDerechLearningGame/1.0 (https://github.com/cfir94/moreh-derech)'}
ITEMS=[{"id":"gedaliah","title":"Gedaliah","file":"Godolia door Ismaël vermoord, RP-P-1896-A-19368-2278.jpg","caption":"רצח גדליהו בידי ישמעאל — תחריט של יאן לאוקן, 1704; המחשה מאוחרת לסיפור המקראי."},{"id":"shebna","title":"Royal Steward inscription","file":"Silwan-inscr.jpg","caption":"כתובת אשר על הבית מסילואן במוזיאון הבריטי; זיהוי בעל הקבר עם שבנא הוא השערה."},{"id":"judah-baba","title":"Judah ben Baba","file":"Shfaram-Tomb-of-Rabbi-Judah-ben-Bava-K-783.jpg","caption":"האתר המזוהה במסורת עם קבר רבי יהודה בן בבא — תמונת הקשר, לא דיוקן או הוכחת זיהוי."},{"id":"egeria","title":"Egeria (pilgrim)","file":"Codex Aretinus 405 containing the only surviving copy of Egeria’s Travels (Itinerarium Eteriae).jpg","caption":"כתב יד של מסע אגריה — העתק מימי הביניים, לא כתב ידה ולא דיוקן."}]
def get(url,raw=False):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=45) as r: data=r.read()
            return data if raw else json.loads(data)
        except Exception:
            if attempt==3: raise
            time.sleep(2+attempt*3)
def api(host,**args):
    return get('https://'+host+'/w/api.php?'+urllib.parse.urlencode({'format':'json',**args}))
def clean(s): return html.unescape(re.sub('<[^>]+>','',s or '')).strip()
dest=ROOT/'public/images/who-am-i'
dest.mkdir(parents=True,exist_ok=True)
def collect(item):
    try:
        if item.get('file'):
            file=item['file']
            page={}
        else:
            pages=api(item.get('host','en.wikipedia.org'),action='query',titles=item['title'],redirects=1,prop='pageimages',piprop='name')['query']['pages']
            page=next(iter(pages.values()))
            file=page.get('pageimage')
        if not file: return item['id'],dict(item,error='No page image',page=page)
        info=next(iter(api('commons.wikimedia.org',action='query',titles='File:'+file,prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=640)['query']['pages'].values()))['imageinfo'][0]
        meta=info['extmetadata']
        field=lambda name:clean(meta.get(name,{}).get('value',''))
        entry=dict(item,file=file,sourceUrl=info['descriptionurl'],description=field('ImageDescription'),credit=field('Artist'),license=field('LicenseShortName'),licenseUrl=field('LicenseUrl'),creditExtra=field('Credit'))
        if not entry['licenseUrl'] and entry['license']=='Public domain': entry['licenseUrl']='https://creativecommons.org/publicdomain/mark/1.0/'
        if not entry['license'].startswith(('CC BY','CC0','Public domain')): return item['id'],dict(entry,error='License rejected')
        raw=ImageOps.exif_transpose(Image.open(io.BytesIO(get(info.get('thumburl',info['url']),True)))).convert('RGBA')
        im=Image.new('RGB',raw.size,'white')
        im.paste(raw,mask=raw.getchannel('A'))
        im.thumbnail((640,800))
        im.save(dest/(item['id']+'.webp'),'WEBP',quality=84)
        entry.update(width=im.width,height=im.height,localSrc='/moreh-derech/images/who-am-i/'+item['id']+'.webp')
        print(item['id'],file,flush=True)
        return item['id'],entry
    except Exception as e:
        print(item['id'],str(e),flush=True)
        return item['id'],dict(item,error=str(e))
report=json.loads((ROOT/'docs/who-am-i-image-candidates.json').read_text(encoding='utf-8'))
with ThreadPoolExecutor(max_workers=3) as pool: report.update(dict(pool.map(collect,ITEMS)))
(ROOT/'docs/who-am-i-image-candidates.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ALL_ITEMS=list(report.values())
for offset in range(0,len(ALL_ITEMS),24):
    batch=ALL_ITEMS[offset:offset+24]
    sheet=Image.new('RGB',(960,260*((len(batch)+5)//6)), '#e7e1d8')
    draw=ImageDraw.Draw(sheet)
    for j,item in enumerate(batch):
        path=dest/(item['id']+'.webp')
        x=(j%6)*160;y=(j//6)*260
        if path.exists():
            im=Image.open(path);im.thumbnail((150,225));sheet.paste(im,(x+(160-im.width)//2,y))
        draw.text((x+4,y+230),item['id'],fill='black')
    sheet.save(ROOT/('docs/who-am-i-contact-'+str(offset//24)+'.jpg'),quality=85)

searches={}
for q in ['incategory:Gedaliah','Egeria pilgrim manuscript','Philip tetrarch coin','יהודה בן בבא']:
    try: searches[q]=api('commons.wikimedia.org',action='query',list='search',srnamespace=6,srsearch=q,srlimit=12)['query']['search']
    except Exception as e: searches[q]=str(e)
(ROOT/'docs/who-am-i-image-search.json').write_text(json.dumps(searches,ensure_ascii=False,indent=2),encoding='utf-8')
