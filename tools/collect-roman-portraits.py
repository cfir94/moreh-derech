import json, urllib.request, urllib.parse, io, re, html
from pathlib import Path
from PIL import Image, ImageOps
ROOT=Path.cwd()
HEADERS={'User-Agent':'EvenDerechPortraits/1.0 (https://github.com/cfir94/moreh-derech)'}
def get(url,raw=False):
    with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=50) as r: data=r.read()
    return data if raw else json.loads(data)
def api(host,**args):
    return get('https://'+host+'/w/api.php?'+urllib.parse.urlencode({'format':'json',**args}))
def clean(s): return html.unescape(re.sub('<[^>]+>','',s or '')).strip()
items={'herod-great':None,'antipas':'Herod tissot.jpg','agrippa1':'Agrippa I face.jpg'}
report={}
dest=ROOT/'public/images/roman-people/companions'
dest.mkdir(parents=True,exist_ok=True)
for id,file in items.items():
    if file is None:
        pages=api('en.wikipedia.org',action='query',titles='Herod the Great',redirects=1,prop='pageimages',piprop='name')['query']['pages']
        file=next(iter(pages.values()))['pageimage']
    page=api('commons.wikimedia.org',action='query',titles='File:'+file,prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=640)
    info=next(iter(page['query']['pages'].values()))['imageinfo'][0]
    meta=info['extmetadata']
    field=lambda name:clean(meta.get(name,{}).get('value',''))
    entry={'file':file,'sourceUrl':info['descriptionurl'],'originalUrl':info['url'],'description':field('ImageDescription'),'credit':field('Artist'),'license':field('LicenseShortName'),'licenseUrl':field('LicenseUrl')}
    if not entry['licenseUrl'] and entry['license']=='Public domain': entry['licenseUrl']='https://creativecommons.org/publicdomain/mark/1.0/'
    assert entry['license'].startswith(('CC BY','CC0','Public domain')),entry
    image=ImageOps.exif_transpose(Image.open(io.BytesIO(get(info.get('thumburl',info['url']),raw=True)))).convert('RGB')
    image.thumbnail((640,800))
    image.save(dest/(id+'.webp'),'WEBP',quality=84)
    entry.update(width=image.width,height=image.height,localSrc='/moreh-derech/images/roman-people/companions/'+id+'.webp')
    report[id]=entry
    print(id,entry,flush=True)
(ROOT/'docs/herodian-image-sources.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
