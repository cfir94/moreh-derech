import json, urllib.request, urllib.parse, io, re, html, time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageDraw
ROOT=Path.cwd()
HEADERS={'User-Agent':'EvenDerechLearningGame/1.0 (https://github.com/cfir94/moreh-derech)'}
ITEMS=[{"id":"gedaliah","title":"Tell en-Nasbeh","caption":"תל א־נצבה, המזוהה עם מצפה — תמונת הקשר למרכז שלטונו של גדליהו; לא דיוקן."},{"id":"hazael","title":"Tel Dan stele","caption":"כתובת תל דן המיוחסת במחקר לחזאל — ממצא הקשר, לא דיוקן; שם המחבר אינו נשמר בחלק שנמצא."},{"id":"shebna","title":"Tomb of the Royal Steward","caption":"קבר אשר על הבית בסילואן — ייחוסו לשבנא מוצע במחקר ואינו ודאי; אין זה דיוקן."},{"id":"mattathias","title":"Mattathias","caption":"ייצוג של מתתיהו החשמונאי באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Mattathias_medal.svg"},{"id":"jonathan-hasm","title":"Jonathan Apphus","caption":"ייצוג של יונתן החשמונאי באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Jonathan_Apphus_medal.svg"},{"id":"simon-hasm","title":"Simon Thassi","caption":"ייצוג של שמעון החשמונאי באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Simon_Thassi_medal.svg"},{"id":"hyrcanus1","title":"John Hyrcanus","caption":"ייצוג של יוחנן הורקנוס הראשון באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"John_Hyrcanus_medal.svg"},{"id":"aristobulus1","title":"Aristobulus I","caption":"ייצוג של אריסטובולוס הראשון באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Aristobulus_I_medal.svg"},{"id":"jannaeus","title":"Alexander Jannaeus","caption":"ייצוג של אלכסנדר ינאי באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Alexander_Jannaeus_medal.svg"},{"id":"salome","title":"Salome Alexandra","caption":"ייצוג של שלומציון המלכה באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Salome_Alexandra_medal.svg"},{"id":"hyrcanus2","title":"Hyrcanus II","caption":"ייצוג של הורקנוס השני באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Hyrcanus_II_medal.svg"},{"id":"aristobulus2","title":"Aristobulus II","caption":"ייצוג של אריסטובולוס השני באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Aristobulus_II_medal.svg"},{"id":"antigonus","title":"Antigonus II Mattathias","caption":"ייצוג של מתתיהו אנטיגונוס באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Antigonus_II_Mattathias_medal.svg"},{"id":"archelaus","title":"Herod Archelaus","caption":"ייצוג של הורדוס ארכלאוס באמנות או בממצא; אין לראות בו בהכרח דיוקן שנעשה בחיי הדמות.","file":"Archelaus_medal.svg"},{"id":"philip","title":"Philip the Tetrarch","caption":"מפת הטטררכיה של פיליפוס — תמונת הקשר לתחום שלטונו, לא דיוקן.","file":"Philip_Tetrarchy.svg"},{"id":"yochanan","title":"Yohanan ben Zakkai","caption":"רבן יוחנן בן זכאי בתבליט מנורת הכנסת של בנו אלקן — יצירה מן המאה ה־20, לא דיוקן בן הזמן.","file":"Knesset Menorah Jochanan ben Sakkai.jpg"},{"id":"judah-baba","title":"יהודה בן בבא","caption":"האתר המזוהה במסורת עם קבר רבי יהודה בן בבא — אתר הנצחה, לא דיוקן או הוכחת זיהוי.","host":"he.wikipedia.org"},{"id":"egeria","title":"Church of the Holy Sepulchre","caption":"כנסיית הקבר בירושלים — אתר הקשור לתיאורי הצליינות של אגריה; תמונת הקשר ולא דיוקן."}]
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
for offset in range(0,len(ITEMS),24):
    batch=ITEMS[offset:offset+24]
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
