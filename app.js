const rounds=[
{id:'catMouse',actor:'cat',text:'Кот ловит мышь.'},
{id:'dwarfTreasure',actor:'dwarf',text:'Гном нашёл клад.'},
{id:'owlLetter',actor:'owl',text:'Сова несёт письмо.'},
{id:'dragonSleep',actor:'dragon',text:'Дракон спит на горе.'},
{id:'witchBrew',actor:'witch',text:'Ведьма варит зелье.'},
{id:'knightSword',actor:'knight',text:'Рыцарь держит меч.'},
{id:'ghostHall',actor:'ghost',text:'Призрак летает по залу.'},
{id:'catHat',actor:'cat',text:'Кот сидит в шляпе.'},
{id:'dwarfBag',actor:'dwarf',text:'Гном несёт мешок.'},
{id:'dragonGuard',actor:'dragon',text:'Дракон охраняет замок.'},
{id:'owlClock',actor:'owl',text:'Сова сидит на часах.'},
{id:'witchFly',actor:'witch',text:'Ведьма летит на метле.'},
{id:'wizardWand',actor:'wizard',text:'Волшебник машет палочкой.'},
{id:'knightHorse',actor:'knight',text:'Рыцарь скачет на коне.'},
{id:'catYarn',actor:'cat',text:'Кот играет с клубком.'}
];
const labels={cat:'Кот',dwarf:'Гном',owl:'Сова',dragon:'Дракон',witch:'Ведьма',knight:'Рыцарь',ghost:'Призрак',wizard:'Волшебник'};
const $=id=>document.getElementById(id);
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=[],choiceSets={},completed=[],current=0,selected=null,drag=null,finishTimer=null;
function newGame(){
 clearTimeout(finishTimer);finishTimer=null;order=shuffle(rounds.map(r=>r.id));choiceSets={};completed=[];current=0;
 let positions=[];
 for(const id of order){const actor=rounds.find(r=>r.id===id).actor;const options=shuffle(Object.keys(labels).filter(a=>a!==actor)).slice(0,2);
 const slots=[0,1,2].filter(n=>!(positions.length>=2&&positions.at(-1)===n&&positions.at(-2)===n));const slot=shuffle(slots)[0];options.splice(slot,0,actor);choiceSets[id]=options;positions.push(slot)}
}
const activeRound=()=>rounds.find(r=>r.id===order[current]);
function render(){selected=null;const r=activeRound(),done=completed.includes(r.id);$('sentence').textContent=r.text;$('reading').hidden=done;$('resetBtn').hidden=done&&current===rounds.length-1;$('canvas').innerHTML=done?scene(r.id,true):'<div class="empty-canvas"><span class="empty-symbol" aria-hidden="true">✧</span></div>';$('frame').classList.remove('restored','over');$('frame').setAttribute('aria-label',done?r.text:'Пустая картина. Поместить выбранного героя');$('nextBtn').hidden=!done||current===rounds.length-1;$('choices').innerHTML=choiceSets[r.id].map(id=>`<button class="choice ${done&&id===r.actor?'correct':''}" data-id="${id}" aria-label="${labels[id]}" aria-pressed="false" ${done?'disabled':''}>${scene(id,false,true)}</button>`).join('');$('choices').querySelectorAll('button').forEach(btn=>{btn.addEventListener('pointerdown',e=>startDrag(e,btn));btn.addEventListener('click',()=>{if(!suppressClick)select(btn.dataset.id)})})}
function select(id){selected=id;$('choices').querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.dataset.id===id);b.setAttribute('aria-pressed',String(b.dataset.id===id))});$('frame').focus({preventScroll:true})}
function answer(id){const r=activeRound();if(!id||completed.includes(r.id))return;if(id!==r.actor){const b=$('choices').querySelector(`[data-id="${id}"]`);if(b){b.classList.remove('selected');b.classList.add('returning');b.setAttribute('aria-pressed','false');setTimeout(()=>b.classList.remove('returning'),500)}selected=null;return}completed.push(r.id);render();$('frame').classList.add('restored');if(completed.length===rounds.length){finishTimer=setTimeout(()=>{$('finishDialog').showModal();finishTimer=null},4000)}}
let suppressClick=false;
function startDrag(e,btn){if(e.button!==0||btn.disabled)return;drag={id:btn.dataset.id,x:e.clientX,y:e.clientY,pointer:e.pointerId,moved:false,btn};btn.setPointerCapture(e.pointerId)}
window.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=scene(drag.id,false,true);document.body.append(ghost);drag.ghost=ghost}if(drag.moved){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';const r=$('frame').getBoundingClientRect();$('frame').classList.toggle('over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)}});
function endDrag(e,cancel=false){if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;d.ghost?.remove();$('frame').classList.remove('over');if(d.moved){suppressClick=true;setTimeout(()=>suppressClick=false,50);const r=$('frame').getBoundingClientRect();if(!cancel&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)answer(d.id)}}
window.addEventListener('pointerup',e=>endDrag(e));window.addEventListener('pointercancel',e=>endDrag(e,true));$('frame').addEventListener('click',()=>answer(selected));$('frame').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();answer(selected)}});
$('nextBtn').onclick=()=>{if(!completed.includes(activeRound().id)||current>=rounds.length-1)return;current++;render()};
function beginGame(){newGame();$('intro').hidden=true;$('game').hidden=false;$('resetBtn').hidden=false;render()}
function showIntro(){clearTimeout(finishTimer);finishTimer=null;$('game').hidden=true;$('intro').hidden=false;$('resetBtn').hidden=true}
$('startBtn').onclick=beginGame;
$('againBtn').onclick=()=>{$('finishDialog').close();beginGame()};
$('finishNoBtn').onclick=()=>{$('finishDialog').close();showIntro()};
$('finishDialog').addEventListener('cancel',e=>{e.preventDefault();$('finishDialog').close();showIntro()});
$('resetBtn').onclick=()=>$('resetDialog').showModal();
$('cancelReset').onclick=()=>$('resetDialog').close();
$('confirmReset').onclick=()=>{$('resetDialog').close();showIntro()};
showIntro();
