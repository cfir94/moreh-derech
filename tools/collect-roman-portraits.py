"""Collect Commons-licensed portrait candidates for human review before publication.

Run in the network-enabled asset workflow. The report retains original descriptions,
licenses and attribution; the resulting branch must be reviewed before merging.
"""
import html
import io
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request
from PIL import Image, ImageOps

TARGETS = {
    'pompey': 'Pompey', 'antony': 'Mark Antony', 'augustus': 'Augustus',
    'varus': 'Publius Quinctilius Varus', 'quirinius': 'Quirinius',
    'tiberius': 'Tiberius', 'pilate': 'Pontius Pilate', 'caligula': 'Caligula',
    'claudius': 'Claudius', 'nero': 'Nero', 'florus': 'Gessius Florus',
    'cestius': 'Gaius Cestius Gallus (governor of Syria)',
    'vespasian': 'Vespasian', 'titus': 'Titus', 'domitian': 'Domitian',
    'nerva': 'Nerva', 'trajan': 'Trajan', 'quietus': 'Lusius Quietus',
    'hadrian': 'Hadrian', 'pius': 'Antoninus Pius', 'marcus': 'Marcus Aurelius',
    'severus': 'Septimius Severus', 'caracalla': 'Caracalla',
    'diocletian': 'Diocletian', 'maxentius': 'Maxentius', 'licinius': 'Licinius',
    'constantine': 'Constantine the Great', 'helena': 'Helena, mother of Constantine I',
    'constantius': 'Constantius II', 'gallus': 'Constantius Gallus',
    'julian': 'Julian (emperor)', 'theodosius1': 'Theodosius I',
    'theodosius2': 'Theodosius II', 'eudocia': 'Aelia Eudocia',
    'justinian': 'Justinian I', 'heraclius': 'Heraclius',
}
USER_AGENT = 'EvenDerechPortraitResearch/1.0 (https://github.com/cfir94/moreh-derech; educational image attribution)'

def request(url, raw=False):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            with urllib.request.urlopen(req, timeout=50) as response:
                data = response.read()
            return data if raw else json.loads(data)
        except Exception:
            if attempt == 3:
                raise
            time.sleep(3 * (attempt + 1))

def api(host, **params):
    return request('https://' + host + '/w/api.php?' + urllib.parse.urlencode({'format': 'json', **params}))

def plain(value):
    return html.unescape(re.sub('<[^>]+>', '', value or '')).strip()

root = Path(__file__).resolve().parents[1]
dest = root / 'public/images/roman-people/portraits'
dest.mkdir(parents=True, exist_ok=True)
report_path = root / 'docs/roman-portrait-candidates.json'
report = json.loads(report_path.read_text(encoding='utf-8')) if report_path.exists() else {}
file_overrides = {'tiberius': 'Head of Tiberius.jpg', 'quietus': 'Lusius Quietus on Column of Trajan.jpg',
                  'cestius': 'Cestius Gallus, RP-P-OB-46.197.jpg'}
credit_overrides = {'claudius': 'Marie-Lan Nguyen (2011); crop: DIREKTOR / Wikimedia Commons',
                    'nero': 'Bibi Saint-Pol / Wikimedia Commons', 'domitian': 'Sailko / Wikimedia Commons',
                    'theodosius2': 'Marie-Lan Nguyen / Wikimedia Commons',
                    'quietus': 'Hans F. Helmolt, The History of the World (1902) / Wikimedia Commons',
                    'cestius': 'Jan Luyken / Rijksmuseum, RP-P-OB-46.197 / Wikimedia Commons'}
for person, title in TARGETS.items():
    if report.get(person, {}).get('status') == 'downloaded-for-review':
        continue
    entry = {'article': title, 'articleUrl': 'https://en.wikipedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'))}
    try:
        pages = api('en.wikipedia.org', action='query', titles=title, redirects=1, prop='pageimages', piprop='name')['query']['pages']
        page = next(iter(pages.values()))
        file = file_overrides.get(person) or page.get('pageimage')
        if not file:
            entry['status'] = 'no-portrait-candidate'
            report[person] = entry
            print(person, 'NO IMAGE', flush=True)
            continue
        entry['file'] = file
        data = api('commons.wikimedia.org', action='query', titles='File:' + file, prop='imageinfo', iiprop='url|extmetadata', iiurlwidth=640)
        info = next(iter(data['query']['pages'].values()))['imageinfo'][0]
        meta = info['extmetadata']
        field = lambda name: plain(meta.get(name, {}).get('value', ''))
        entry.update({'sourceUrl': info['descriptionurl'], 'originalUrl': info['url'],
                      'description': field('ImageDescription'), 'credit': credit_overrides.get(person) or field('Artist'),
                      'license': field('LicenseShortName'), 'licenseUrl': field('LicenseUrl'),
                      'restrictions': field('Restrictions'), 'date': field('DateTimeOriginal')})
        if not entry['licenseUrl'] and entry['license'] in ['Public domain', 'PD']:
            entry['licenseUrl'] = 'https://creativecommons.org/publicdomain/mark/1.0/'
        if not entry['credit'] or not entry['licenseUrl'] or not (entry['license'].startswith(('CC BY', 'CC0')) or entry['license'] in ['Public domain', 'PD']):
            entry['status'] = 'needs-license-review'
        else:
            # Use Commons' canonical thumbnail rather than hotlinking in the app.
            data = request(info.get('thumburl', info['url']), raw=True)
            image = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
            image.thumbnail((640, 800))
            image.save(dest / (person + '.webp'), 'WEBP', quality=84)
            entry.update({'status': 'downloaded-for-review', 'width': image.width, 'height': image.height,
                          'localSrc': '/moreh-derech/images/roman-people/portraits/' + person + '.webp'})
        print(person, entry['status'], file, flush=True)
    except Exception as error:
        entry.update({'status': 'error', 'error': str(error)})
        print(person, 'ERROR', str(error), flush=True)
    report[person] = entry
    time.sleep(1)
research = {}
for title in ['Gaius Cestius Gallus', 'Gaius Cestius Gallus (governor of Syria)']:
    research[title] = api('commons.wikimedia.org', action='query', list='categorymembers', cmtitle='Category:' + title, cmlimit=50)
for query in ['"Cestius Gallus"', '"Gessius Florus"']:
    research[query] = api('commons.wikimedia.org', action='query', list='search', srsearch=query, srnamespace=6, srlimit=20)
try:
    req = urllib.request.Request('https://www.rijksmuseum.nl/en/collection/object/Cestius-Gallus--28e362cd70d96d999d98e50c47642d48', headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=40) as response:
        markup = response.read().decode()
    research['rijks_image_urls'] = list(dict.fromkeys(re.findall(r'https[^\s"<>\\]+(?:jpg|jpeg|webp|png)[^\s"<>\\]*', markup)))[:80]
    research['rijks_iiif_urls'] = list(dict.fromkeys(re.findall(r'https[^\s"<>\\]*(?:iiif|micr\.io)[^\s"<>\\]*', markup)))[:40]
except Exception as error:
    research['rijks_error'] = str(error)
(root / 'docs/roman-portrait-research.json').write_text(json.dumps(research, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
from PIL import ImageDraw
sheet = Image.new('RGB', (800, 180 * 9), '#eeeeee')
draw = ImageDraw.Draw(sheet)
for index, (person, entry) in enumerate(report.items()):
    x, y = (index % 4) * 200, (index // 4) * 180
    path = dest / (person + '.webp')
    if path.exists():
        image = Image.open(path)
        image.thumbnail((185, 150))
        sheet.paste(image, (x + (200-image.width)//2, y))
    draw.text((x+8, y+154), person, fill='#111111')
sheet.save(root / 'docs/roman-portrait-contact-sheet.jpg', quality=85)
print('Collected', sum(p['status'] == 'downloaded-for-review' for p in report.values()), 'of', len(TARGETS), flush=True)
