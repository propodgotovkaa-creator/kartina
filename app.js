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
const $=id=>document.getElementById(id),key='magic-gallery-v2';
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=[],choiceSets={},completed=[],current=0,selected=null,drag=null,view='game',galleryPage=0,hallTransition=false;
function newGame(){
 order=shuffle(rounds.map(r=>r.id));choiceSets={};completed=[];current=0;galleryPage=0;hallTransition=false;
 let positions=[];
 for(const id of order){const actor=rounds.find(r=>r.id===id).actor;const options=shuffle(Object.keys(labels).filter(a=>a!==actor)).slice(0,2);
 const slots=[0,1,2].filter(n=>!(positions.length>=2&&positions.at(-1)===n&&positions.at(-2)===n));const slot=shuffle(slots)[0];options.splice(slot,0,actor);choiceSets[id]=options;positions.push(slot)}
}
function validState(s){return s&&Array.isArray(s.order)&&s.order.length===rounds.length&&new Set(s.order).size===rounds.length&&s.order.every(id=>rounds.some(r=>r.id===id))&&Number.isInteger(s.current)&&s.current>=0&&s.current<rounds.length&&Array.isArray(s.completed)&&new Set(s.completed).size===s.completed.length&&s.completed.every((id,i)=>id===s.order[i])&&s.completed.length>=s.current&&s.completed.length<=s.current+1&&s.order.every(id=>{const c=s.choiceSets?.[id];return Array.isArray(c)&&c.length===3&&new Set(c).size===3&&c.includes(rounds.find(r=>r.id===id).actor)&&c.every(a=>Object.hasOwn(labels,a))})}
newGame();try{const s=JSON.parse(localStorage.getItem(key));if(validState(s)){({order,choiceSets,completed,current}=s)}}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify({order,choiceSets,completed,current}))}catch{}}
const activeRound=()=>rounds.find(r=>r.id===order[current]);
function render(){selected=null;const r=activeRound(),done=completed.includes(r.id);$('sentence').textContent=r.text;$('steps').innerHTML='';$('canvas').innerHTML=done?scene(r.id,true):'<div class="empty-canvas"><span class="empty-symbol" aria-hidden="true">✧</span></div>';$('frame').classList.remove('restored','over');$('frame').setAttribute('aria-label',done?r.text:'Пустая картина. Поместить выбранного героя');$('nextBtn').hidden=!done;$('nextBtn').innerHTML=(current===14?'Галерея':(current+1)%5===0?'Открыть зал':'Далее')+' <span>→</span>';$('choices').innerHTML=choiceSets[r.id].map(id=>`<button class="choice ${done&&id===r.actor?'correct':''}" data-id="${id}" aria-label="${labels[id]}" aria-pressed="false" ${done?'disabled':''}>${scene(id,false,true)}</button>`).join('');$('choices').querySelectorAll('button').forEach(btn=>{btn.addEventListener('pointerdown',e=>startDrag(e,btn));btn.addEventListener('click',()=>{if(!suppressClick)select(btn.dataset.id)})})}
function select(id){selected=id;$('choices').querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.dataset.id===id);b.setAttribute('aria-pressed',String(b.dataset.id===id))});$('frame').focus({preventScroll:true})}
function answer(id){const r=activeRound();if(!id||completed.includes(r.id))return;if(id!==r.actor){const b=$('choices').querySelector(`[data-id="${id}"]`);if(b){b.classList.remove('selected');b.classList.add('returning');b.setAttribute('aria-pressed','false');setTimeout(()=>b.classList.remove('returning'),500)}selected=null;return}completed.push(r.id);save();render();$('frame').classList.add('restored')}
let suppressClick=false;
function startDrag(e,btn){if(e.button!==0||btn.disabled)return;drag={id:btn.dataset.id,x:e.clientX,y:e.clientY,pointer:e.pointerId,moved:false,btn};btn.setPointerCapture(e.pointerId)}
window.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=scene(drag.id,false,true);document.body.append(ghost);drag.ghost=ghost}if(drag.moved){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';const r=$('frame').getBoundingClientRect();$('frame').classList.toggle('over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)}});
function endDrag(e,cancel=false){if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;d.ghost?.remove();$('frame').classList.remove('over');if(d.moved){suppressClick=true;setTimeout(()=>suppressClick=false,50);const r=$('frame').getBoundingClientRect();if(!cancel&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)answer(d.id)}}
window.addEventListener('pointerup',e=>endDrag(e));window.addEventListener('pointercancel',e=>endDrag(e,true));$('frame').addEventListener('click',()=>answer(selected));$('frame').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();answer(selected)}});
$('nextBtn').onclick=()=>{if(!completed.includes(activeRound().id))return;if((current+1)%5===0){hallTransition=current<14;showGallery(Math.floor(current/5))}else{current++;save();render()}};
const hallNames=['Янтарный зал','Лесной зал','Лунный зал'];
function showGallery(page=Math.floor(current/5)){view='gallery';galleryPage=Math.min(page,Math.max(0,Math.ceil(completed.length/5)-1));$('game').hidden=true;$('gallery').hidden=false;$('galleryTitle').textContent=hallNames[galleryPage];const shown=order.slice(galleryPage*5,galleryPage*5+5).filter(id=>completed.includes(id));$('galleryGrid').innerHTML=shown.map(id=>{const r=rounds.find(r=>r.id===id);return `<button class="gallery-card" data-id="${id}" aria-label="Рассмотреть: ${r.text}"><div class="painting-frame">${scene(id,true)}</div><p>${r.text}</p></button>`}).join('');$('galleryGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('detailTitle').textContent=rounds.find(r=>r.id===b.dataset.id).text;$('detailScene').innerHTML=scene(b.dataset.id,true);$('detail').showModal()});$('galleryPrev').hidden=galleryPage===0;$('galleryNext').hidden=(galleryPage+1)*5>=completed.length;$('backBtn').innerHTML=(hallTransition?'В следующий зал':'К картине')+' <span>→</span>';$('galleryBtn').textContent='К заданию'}
function showGame(){view='game';$('game').hidden=false;$('gallery').hidden=true;$('galleryBtn').textContent='Галерея';render()}
$('galleryPrev').onclick=()=>showGallery(galleryPage-1);$('galleryNext').onclick=()=>showGallery(galleryPage+1);
$('galleryBtn').onclick=()=>{hallTransition=false;view==='game'?showGallery():showGame()};$('backBtn').onclick=()=>{if(hallTransition){current++;hallTransition=false;save()}showGame()};$('detail').querySelector('.close').onclick=()=>$('detail').close();$('detail').addEventListener('close',()=>{$('detailScene').innerHTML=''});$('resetBtn').onclick=()=>$('resetDialog').showModal();$('cancelReset').onclick=()=>$('resetDialog').close();$('confirmReset').onclick=()=>{newGame();save();$('resetDialog').close();showGame()};save();render();if(completed.length===15)showGallery(2);
