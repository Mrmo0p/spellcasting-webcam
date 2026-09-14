import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement,isValidElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {TH,translate,savedLocale} from '../lib/i18n.ts';
import {localizeTree} from '../lib/localize-tree.ts';
import {RUNES} from '../lib/game/runes.ts';
import {DRAWING_TIPS} from '../lib/game/practice.ts';
import {recognitionHint,blockedSpellHint} from '../lib/game/coaching.ts';

test('English remains unchanged and only a valid saved Thai preference selects Thai',()=>{
 for(const key of Object.keys(TH))assert.equal(translate(key,'en'),key);
 assert.equal(savedLocale(null),'en');assert.equal(savedLocale('unexpected'),'en');assert.equal(savedLocale('th'),'th');
 assert.equal(translate('constructor','th'),'constructor');assert.equal(translate('SPELLBOUND','th'),'SPELLBOUND');
});
test('Thai covers every rune, practice tip and recognition failure',()=>{
 for(const rune of RUNES){for(const value of [rune.name,rune.shape,rune.effect,DRAWING_TIPS[rune.id]])assert.notEqual(translate(value,'th'),value);}
 for(const reason of ['too-short','too-small','too-long','tracking-lost','interrupted','ambiguous','unknown-shape']){
  const text=recognitionHint(reason);assert.notEqual(translate(text,'th'),text);
 }
});
test('Thai translates dynamic messages while retaining numbers and spell meaning',()=>{
 assert.equal(translate('Fireball detected — the target was Ward.','th'),'ตรวจพบลูกไฟ — รูนเป้าหมายคือเกราะเวท');
 assert.equal(translate('Ember volley hit for 18.','th'),'ห่าลูกไฟสร้างความเสียหาย 18');
 assert.match(translate(blockedSpellHint('ward','cooldown',1250),'th'),/เกราะเวท.*2 วินาที/);
 assert.match(translate('3 of 4 prompted attempts correct (75%).','th'),/3 จาก 4 ครั้ง \(75%\)/);
 assert.equal(translate('  Start tutorial  ','th'),'  เริ่มบทเรียน  ');
 assert.equal(translate('WARD','th'),'เกราะเวท');
});
test('Thai covers the PvP lobby, match state and dynamic player events',()=>{
 for(const text of ['PRIVATE ONLINE DUEL','Create room','Join room','INCOMING SPELL','Request rematch','Camera is off. The duel continues.'])assert.notEqual(translate(text,'th'),text);
 assert.equal(translate('Mali cast fireball.','th'),'Mali ร่ายลูกไฟ');
 assert.equal(translate('12 seconds remaining','th'),'เหลือ 12 วินาที');
 assert.equal(translate('Niran wins.','th'),'Niran ชนะ');
});
test('presentation localization preserves form values, refs and callbacks',()=>{
 const callback=()=>{},ref={current:null};
 const input=createElement('input',{value:'Practice',placeholder:'Test device',onChange:callback,ref});
 const translated=localizeTree(input,'th') as ReturnType<typeof createElement>[];
 assert.ok(isValidElement(translated[0]));
 const props=translated[0].props as Record<string,unknown>;
 assert.equal(props.value,'Practice');assert.equal(props.placeholder,'อุปกรณ์ที่ใช้ทดสอบ');assert.equal(props.onChange,callback);assert.equal(props.ref,ref);
 const button=createElement('button',{'aria-label':'Enable camera'},'Enable camera');
 const html=renderToStaticMarkup(createElement('div',null,localizeTree(button,'th')));
 assert.match(html,/aria-label="เปิดกล้อง"/);assert.match(html,/>เปิดกล้อง<\/button>/);
 assert.equal(localizeTree(button,'en'),button);
});
