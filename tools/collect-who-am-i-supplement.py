import json, urllib.request, urllib.parse, io, re, html, time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageDraw
ROOT=Path.cwd()
HEADERS={'User-Agent':'EvenDerechLearningGame/1.0 (https://github.com/cfir94/moreh-derech)'}
ITEMS=[{"id":"simon-giora","title":"Simon bar Giora","file":"John Harris Valda - Simon bar Giora in the triumph of Titus being dragged to his death.jpg","caption":"שמעון בר גיורא מובל בתהלוכת הניצחון הרומית — איור של ג׳ון האריס ולדה, 1915; ייצוג אמנותי מאוחר."}]
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
        info=next(iter(api('commons.wikimedia.org',action='query',titles='File:'+file,prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=480)['query']['pages'].values()))['imageinfo'][0]
        meta=info['extmetadata']
        field=lambda name:clean(meta.get(name,{}).get('value',''))
        entry=dict(item,file=file,sourceUrl=info['descriptionurl'],description=field('ImageDescription'),credit=field('Artist'),license=field('LicenseShortName'),licenseUrl=field('LicenseUrl'),creditExtra=field('Credit'))
        if not entry['licenseUrl'] and entry['license']=='Public domain': entry['licenseUrl']='https://creativecommons.org/publicdomain/mark/1.0/'
        if not entry['license'].startswith(('CC BY','CC0','Public domain')): return item['id'],dict(entry,error='License rejected')
        raw=ImageOps.exif_transpose(Image.open(io.BytesIO(get(info.get('thumburl',info['url']),True)))).convert('RGBA')
        im=Image.new('RGB',raw.size,'white')
        im.paste(raw,mask=raw.getchannel('A'))
        im.thumbnail((480,640))
        im.save(dest/(item['id']+'.webp'),'WEBP',quality=78)
        entry.update(width=im.width,height=im.height,localSrc='/moreh-derech/images/who-am-i/'+item['id']+'.webp')
        print(item['id'],file,flush=True)
        return item['id'],entry
    except Exception as e:
        print(item['id'],str(e),flush=True)
        return item['id'],dict(item,error=str(e))
with ThreadPoolExecutor(max_workers=3) as pool: report=dict(pool.map(collect,ITEMS))
import base64
print('MEDIA_REPORT='+base64.b64encode(json.dumps(report,ensure_ascii=False).encode()).decode(),flush=True)
for item in ITEMS:
    path=dest/(item['id']+'.webp')
    if path.exists(): print('MEDIA_'+item['id']+'='+base64.b64encode(path.read_bytes()).decode(),flush=True)
