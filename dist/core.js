export const accepted = s => s==='translated'||s==='outdated';
export const entryKey = (version,lang,id) => `${version}|${lang}|${id}`;
export const sourceFor = (row,version) => version==='17.0'?(row.previousSource||row.source):row.source;
export function placeholders(text) {
  return (String(text).replace(/%%/g,'').match(/%(?:\d+\$)?[-+#0 ]*(?:\d+|\*)?(?:\.(?:\d+|\*))?[sdifuxXoegc]|\{\{[^{}]+\}\}|\{[A-Za-z_0-9][A-Za-z_0-9.]*\}/g)||[]).sort();
}
export function validate(source,text,dealers=[]) {
  const checks=[];
  const p=placeholders(source), q=placeholders(text);
  checks.push({id:'empty',ok:!!text.trim(),label:text.trim()?'Перевод заполнен':'Добавьте перевод'});
  checks.push({id:'placeholders',ok:JSON.stringify(p)===JSON.stringify(q),label:JSON.stringify(p)===JSON.stringify(q)?`Параметры сохранены${p.length?' · '+p.join(', '):''}`:`Сохраните параметры: ${p.join(', ')||'в исходной строке их нет'}`});
  const sn=(source.match(/\n/g)||[]).length, tn=(text.match(/\n/g)||[]).length;
  checks.push({id:'newlines',ok:sn===tn,label:sn===tn?`Переносы строк совпадают${sn?' · '+sn:''}`:`Переносы строк: ожидается ${sn}, сейчас ${tn}`});
  const hasContact=/(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b[\w-]+\.(?:ru|com|net|org|io|de|cn|fr|es|co|рф)\b)/iu.test(text)||/(?:\+?\d[\d ()-]{6,}\d)/.test(text)||dealers.some(x=>x.name && text.toLowerCase().includes(x.name.toLowerCase()));
  checks.push({id:'contacts',ok:!hasContact,label:hasContact?'Удалите контакты, сайт или название дилера':'Нет контактов и названий дилеров'});
  return checks;
}
export function stats(rows,getTranslation,isIgnored=()=>false) {
  const out={total:0,translated:0,outdated:0,untranslated:0,auto:0,ignored:0};
  for(const row of rows) { if(isIgnored(row)){out.ignored++;continue;} out.total++; const s=getTranslation(row).status;out[s]=(out[s]||0)+1; }
  out.percent=out.total?Math.round(out.translated/out.total*100):0;
  out.exportable=out.translated+out.outdated;
  return out;
}
export function exportLng(rows,getTranslation,isIgnored,version,lang) {
  const groups=new Map();let count=0;
  for(const row of rows) {
    const t=getTranslation(row);if(isIgnored(row)||!accepted(t.status)||!t.text.trim())continue;
    if(!groups.has(row.app))groups.set(row.app,[]);
    const escape=s=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n');
    groups.get(row.app).push(`${row.code}=${escape(t.text)}`);count++;
  }
  return {count,content:`; ENCY Software / Спрут Технологии\n; Demo LNG format · ${version} · ${lang}\n; Translated + Outdated only\n\n`+[...groups].map(([app,lines])=>`[${app}]\n${lines.join('\n')}`).join('\n\n')+'\n'};
}
export function migratedTranslation(row,fromVersion,toVersion,old) {
  if(!accepted(old.status))return null;
  return {...old,status:sourceFor(row,fromVersion)===sourceFor(row,toVersion)?old.status:'outdated',history:[...(old.history||[]),{text:old.text,status:sourceFor(row,fromVersion)===sourceFor(row,toVersion)?old.status:'outdated',author:`Перенос из ${fromVersion}`,date:new Date().toISOString()}]};
}
