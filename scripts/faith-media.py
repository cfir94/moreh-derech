import json, urllib.request, urllib.parse, concurrent.futures, time, io, base64, re, html
from PIL import Image, ImageOps, ImageDraw
UA="MorehDerechEducationalMedia/1.0 (https://github.com/cfir94/moreh-derech)"
def get(url):
 for attempt in range(4):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=60) as r:return json.load(r)
  except Exception:
   if attempt==3:raise
   time.sleep(2+attempt*2)
def api(host,params):return get("https://"+host+"/w/api.php?"+urllib.parse.urlencode(dict(format="json",**params)))
def clean(s):return html.unescape(re.sub("<[^>]+>","",s or "")).strip()
rows=json.load(open("scripts/faith-media.json"))
def work(row):
 ident,article=row
 try:
  if article.startswith("File:"):filename=article[5:]
  else:
   page=next(iter(api("en.wikipedia.org",dict(action="query",titles=article,prop="pageimages",piprop="name",redirects=1))["query"]["pages"].values()))
   filename=page.get("pageimage")
  if not filename:raise Exception("no page image")
  info=next(iter(api("commons.wikimedia.org",dict(action="query",titles="File:"+filename,prop="imageinfo",iiprop="url|extmetadata",iiurlwidth=480))["query"]["pages"].values()))["imageinfo"][0]
  meta=info["extmetadata"];license=clean(meta.get("LicenseShortName",{}).get("value",""))
  if not re.search(r"CC|public domain|PD|Attribution",license,re.I):raise Exception("license "+license)
  with urllib.request.urlopen(urllib.request.Request(info.get("thumburl",info["url"]),headers={"User-Agent":UA}),timeout=90) as r:raw=r.read()
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGBA")
  im.thumbnail((480,640));bg=Image.new("RGBA",im.size,"white");bg.alpha_composite(im);im=bg.convert("RGB")
  out=io.BytesIO();im.save(out,"WEBP",quality=79,method=6)
  data=dict(id=ident,file=filename,sourceUrl=info.get("descriptionurl","https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(filename)),credit=clean(meta.get("Artist",{}).get("value",""))[:700],license=license,licenseUrl=clean(meta.get("LicenseUrl",{}).get("value","")) or "https://commons.wikimedia.org/wiki/Commons:Copyright_tags",description=clean(meta.get("ImageDescription",{}).get("value",""))[:1000],webp=base64.b64encode(out.getvalue()).decode())
  return data
 except Exception as e:return dict(id=ident,error=str(e),article=article)
with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:results=list(pool.map(work,rows))
for x in results:
 if "webp" in x:print("MEDIA_"+x["id"]+"="+x.pop("webp"),flush=True)
print("MEDIA_REPORT="+base64.b64encode(json.dumps(results,ensure_ascii=False).encode()).decode(),flush=True)
