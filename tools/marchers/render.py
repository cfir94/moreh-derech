import json,sys
WASH={"orange":"#b5651d","stone":"#9a8a6a","sand":"#c9a46a","sand2":"#d8c08a","red":"#b5382a","blue":"#2a5a8c","white":"#f3ecd8","green":"#4f7a2e","skin":"#c98b5a"}
def svg(fig,frame,h=520,dark=False):
    D=json.load(open(fig+'.json'))
    ink='#2c2014' if not dark else '#f5e8c9'
    out=[f'<svg viewBox="0 0 120 180" height="{h}" style="color:{ink}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">']
    out.append('<g stroke="none" fill-opacity="0.45">'+''.join(f'<path d="{w["d"]}" fill="{WASH[w["c"]]}"/>' for w in D["wash"]+D.get("wash"+frame.upper(),[]))+'</g>')
    out.append('<g filter="url(#ink)">')
    for L in (D["ink"],D[frame]):
        for p in L:
            out.append(f'<path d="{p["d"]}" stroke-width="{p["w"]}"'+(' fill="currentColor"' if p.get("fill") else '')+'/>')
    out.append('</g></svg>')
    return ''.join(out)
figs=sys.argv[1:]
html='<html><body style="margin:0;background:#ead8a8;display:flex;gap:10px;padding:10px;flex-wrap:wrap"><svg width="0" height="0" style="position:absolute"><filter id="ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="0.5" xChannelSelector="R" yChannelSelector="G"/></filter></svg>'
for fg in figs:
    html+=svg(fg,'a')+svg(fg,'b')+f'<div style="background:#382c1e;padding:6px">{svg(fg,"a",260,True)}</div>'+f'<div style="padding:6px">{svg(fg,"a",130)}</div>'
html+='</body></html>'
open('view.html','w').write(html)
