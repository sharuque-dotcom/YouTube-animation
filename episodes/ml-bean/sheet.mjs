// Renders the cast design sheet: node episodes/ml-bean/sheet.mjs out.png
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const src = fs.readFileSync(new URL('../../pipeline/bean.js', import.meta.url), 'utf8').replace(/^export /gm, '');
const out = process.argv[2] || 'sheet.png';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2000, height: 1300 } });
await p.setContent(`<canvas id=c width=2000 height=1300></canvas><script>${src}
const c=document.getElementById('c'),x=c.getContext('2d');x.fillStyle='#efc65f';x.fillRect(0,0,2000,1300);
x.font='bold 30px sans-serif';x.textAlign='center';x.fillStyle='#2a1c17';
const row1=[['kannan',{expr:'grin',R:'wave'}],['ammini',{expr:'smug',L:'hip',R:'point'}],['fisher',{expr:'laugh',R:'hold',propR:PROPS.fish}],['chaya',{expr:'shock',R:'hold',propR:PROPS.glass}],['meenu',{expr:'beam',R:'up',propR:PROPS.flag}],['postman',{expr:'nervous',R:'holdUp',propR:PROPS.paper}],['official',{L:'hip'}]];
row1.forEach(([k,o],i)=>{x.save();x.translate(150+i*285,620);drawBean(x,k,o);x.restore();x.fillText(CAST[k].name,150+i*285,670);});
const ex=['neutral','smile','grin','beam','laugh','smug','stern','angry','shock','nervous','sad','think','bored','proud'];
ex.forEach((e,i)=>{x.save();x.translate(75+i*140,1130);x.scale(0.62,0.62);x.translate(0,0);drawBean(x,'kannan',{expr:e});x.restore();x.font='bold 22px sans-serif';x.fillText(e,75+i*140,1170);});
x.font='bold 40px sans-serif';x.fillText('Travancore What-If: cast sheet (bean style)',1000,60);
</script>`);
fs.writeFileSync(out, Buffer.from((await p.evaluate(()=>document.getElementById('c').toDataURL('image/png'))).split(',')[1],'base64'));
await b.close();
