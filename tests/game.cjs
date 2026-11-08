const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),code=fs.readFileSync(path.join(root,'app.js'),'utf8');
function boot(storage={}){const nodes={};class Element{constructor(){this.hidden=false;this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.children=[]}set innerHTML(v){this.html=v;this.children=[...v.matchAll(/data-id="([^"]+)"/g)].map(m=>{const e=new Element;e.dataset.id=m[1];return e})}get innerHTML(){return this.html}setAttribute(){}addEventListener(){}querySelectorAll(){return this.children}querySelector(q){return q==='.close'?new Element:this.children.find(e=>q.includes(e.dataset.id))}focus(){}showModal(){}close(){}}
for(const m of html.matchAll(/id="([^"]+)"/g))nodes[m[1]]=new Element;
const context={document:{getElementById:id=>{assert(nodes[id],id);return nodes[id]}},window:{addEventListener(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},scene:id=>`scene:${id}`,setTimeout:fn=>fn()};vm.createContext(context);const run=s=>vm.runInContext(s,context);run(code);return {nodes,run,storage}}
let game=boot();let seen=new Set();
for(let i=0;i<15;i++){
 const {nodes,run}=game;assert(!nodes.game.hidden);assert(nodes.nextBtn.hidden);const id=run('activeRound().id');assert(!seen.has(id));seen.add(id);
 run('answer(choiceSets[activeRound().id].find(x=>x!==activeRound().actor))');assert(nodes.nextBtn.hidden,'wrong hero must not unlock next');
 run('answer(activeRound().actor)');assert(!nodes.nextBtn.hidden);run('answer(activeRound().actor)');assert.equal(run('completed.length'),i+1,'duplicate drops ignored');
 if(i===6){const before=JSON.stringify(game.storage);game=boot(game.storage);assert.equal(JSON.stringify(game.storage),before,'reload preserves deck choices and progress')}
 game.nodes.nextBtn.onclick();if((i+1)%5===0){assert(game.nodes.game.hidden);assert.equal(game.nodes.galleryGrid.children.length,5);if(i<14)game.nodes.backBtn.onclick()}
}
assert.equal(seen.size,15);game.nodes.galleryPrev.onclick();assert.equal(game.nodes.galleryGrid.children.length,5);game.nodes.galleryNext.onclick();
const decks=new Set(),positions=new Set(),actors=new Set();
for(let n=0;n<100;n++){game.nodes.confirmReset.onclick();const s=JSON.parse(game.storage['magic-gallery-v2']);assert.equal(s.completed.length,0);assert.equal(new Set(s.order).size,15);decks.add(s.order.join(','));let last=[];for(const id of s.order){const options=s.choiceSets[id],actor=game.run(`rounds.find(r=>r.id===${JSON.stringify(id)}).actor`);assert.equal(new Set(options).size,3);const p=options.indexOf(actor);positions.add(p);options.forEach(a=>actors.add(a));assert(!(last.at(-1)===p&&last.at(-2)===p),'no three identical correct positions');last.push(p)}}
assert(decks.size>95);assert.equal(positions.size,3);assert.equal(actors.size,8);
const damaged=boot({'magic-gallery-v2':JSON.stringify({order:['bad'],current:99})});assert.equal(damaged.run('order.length'),15);assert(damaged.nodes.nextBtn.hidden);
console.log('PASS: all 15 rounds, wrong/repeated answers, three halls, gallery navigation, reload, reset, 100 shuffled decks, all 8 heroes, corrupt save recovery.');
