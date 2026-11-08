/* Painted raster parts composed at runtime. No vector character artwork. */
const paintAssets={};const paintFiles=['witch','owl','dragon','scenes','heroes','new-heroes','props','places','actions','extra','puppets','animation/horse','animation/walk','animation/flight','animation/sword','animation/chest','animation/hat','animation/yarn','animation/chase'];let paintReady=false;
Promise.all(paintFiles.map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>{paintAssets[name]=im;resolve()};im.onerror=()=>{console.error('Не удалось загрузить иллюстрацию',name);resolve()};im.src='assets/'+name+'.webp'}))).then(()=>paintReady=true);
function scene(type,live=false,card=false){return `<canvas width="${card?300:1080}" height="${card?430:645}" class="raster-scene ${live?'live':''} ${card?'card-art':''}" data-scene="${type}" aria-hidden="true"></canvas>`}
const cuts={witchBody:['witch',182,15,299,603],witchArm:['witch',719,45,459,547],pot:['witch',37,692,552,516],owlBody:['owl',172,25,299,591],owlLeft:['owl',668,28,535,471],owlRight:['owl',47,656,549,468],owlClock:['owl',814,631,242,609],dragonBody:['dragon',28,127,588,347],dragonHead:['dragon',691,136,502,322],dragonWing:['dragon',26,700,580,475],dragonGuard:['dragon',628,647,617,583]};
function sprite(ctx,name,x,y,w,h,angle=0,px=.5,py=.5,sx=1,sy=1){const [asset,a,b,c,d]=cuts[name];if(!paintAssets[asset])return;ctx.save();ctx.translate(x+w*px,y+h*py);ctx.rotate(angle);ctx.scale(sx,sy);ctx.drawImage(paintAssets[asset],a,b,c,d,-w*px,-h*py,w,h);ctx.restore()}
function backdrop(ctx,index){if(!paintAssets.scenes)return;ctx.drawImage(paintAssets.scenes,(index%2)*768,Math.floor(index/2)*512,768,512,0,0,720,430)}
function mist(ctx,x,y,t,green=false){for(let i=0;i<4;i++){const f=(t/4+i*.25)%1;ctx.save();ctx.globalAlpha=Math.sin(f*Math.PI)*.22;const xx=x+Math.sin(f*5+i)*15,yy=y-f*80;const g=ctx.createRadialGradient(xx,yy,0,xx,yy,12+f*16);g.addColorStop(0,green?'#e7e6ab':'#eee5d0');g.addColorStop(1,'#e7e6ab00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(xx,yy,12+f*16,10+f*11,0,0,Math.PI*2);ctx.fill();ctx.restore()}}
function paintScene(canvas,time){const ctx=canvas.getContext('2d');const type=canvas.dataset.scene,live=canvas.classList.contains('live'),card=canvas.classList.contains('card-art');const t=live?time:0;ctx.setTransform(1.5,0,0,1.5,0,0);ctx.clearRect(0,0,720,430);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
if(card){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,300,430);drawIdle(ctx,type,150,410,380,280);return;}
if(paintFlipbook(ctx,type,t))return;
if(paintNewScene(ctx,type,t,live))return;
if(!card)backdrop(ctx,type.startsWith('witch')||type==='owlClock'?0:type==='dragonSleep'||type==='dragonGuard'?2:1);
if(type==='witchBrew'){
 ctx.save();if(card){ctx.translate(-100,0);ctx.scale(1.12,1)}
 sprite(ctx,'witchBody',451,27,178,359);
 const phase=Math.sin(t*Math.PI/1.9);sprite(ctx,'pot',313,257,197,170);
 // Keep the spoon tip submerged: shoulder anchored, spoon crosses the potion surface.
 ctx.save();ctx.translate(410,278);ctx.scale(1,.21);ctx.rotate(t*.7);
 for(let i=0;i<3;i++){ctx.strokeStyle=['#e9d883','#b5c86b','#f1e3a6'][i];ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,26+i*12,26+i*12,0,t*.5+i,t*.5+i+4.3);ctx.stroke()}ctx.restore();
 sprite(ctx,'witchArm',391,144,187,148,live?phase*.035:0,.91,.09,1,1);
 // The painted front rim occludes the submerged spoon bowl.
 ctx.save();ctx.beginPath();ctx.rect(310,285,205,145);ctx.clip();sprite(ctx,'pot',313,257,197,170);ctx.restore();
 if(live){for(let i=0;i<5;i++){const f=(t/2.5+i*.2)%1;ctx.globalAlpha=Math.sin(f*Math.PI)*.8;ctx.fillStyle=i%2?'#d8da8e':'#f3de9d';ctx.beginPath();ctx.arc(354+i*26+Math.sin(f*5)*4,279-f*55,3+f*4,0,7);ctx.fill()}ctx.globalAlpha=1;mist(ctx,388,269,t,true)}ctx.restore();
}else if(type==='owlLetter'){
 ctx.save();ctx.translate(0,live?Math.sin(t*1.45)*9:0);const flap=live?Math.sin(t*Math.PI*1.6):-.3;
 sprite(ctx,'owlLeft',139,86,190,167,flap*.35,.94,.54,1,1);
 sprite(ctx,'owlRight',391,86,190,162,-flap*.35,.06,.54,1,1);
 sprite(ctx,'owlBody',291,75,138,273);ctx.restore();
}else if(type==='owlClock'){sprite(ctx,'owlClock',280,38,145,365)}
else if(type==='dragonSleep'){
 ctx.save();if(card){ctx.translate(-25,-5);ctx.scale(1.08,1.08)}
 const breath=live?Math.sin(t*Math.PI/2.4):0;
 sprite(ctx,'dragonBody',272,191,333,197,0,.5,.95,1+breath*.008,1+breath*.04);
 sprite(ctx,'dragonWing',342,178,174,143,-.4+(live?breath*.018:0),.2,.8);
 sprite(ctx,'dragonHead',128,230,247,158);
 if(live)mist(ctx,145,323,t,false);ctx.restore();
}else if(type==='dragonGuard'){sprite(ctx,'dragonGuard',161,28,397,375)}
}
let lastPaint=0;function tick(now){if(paintReady&&now-lastPaint>30){lastPaint=now;document.querySelectorAll('canvas[data-scene]').forEach(c=>{if(c.offsetWidth&&c.getBoundingClientRect().bottom>0&&c.getBoundingClientRect().top<innerHeight){if(c.classList.contains('live')||!c.dataset.painted){if(!c.dataset.started)c.dataset.started=String(now);paintScene(c,(now-Number(c.dataset.started))/1000);c.dataset.painted='yes'}}})}requestAnimationFrame(tick)}requestAnimationFrame(tick);

// Each cut uses painted artwork. Runtime transforms animate separate puppet parts.
Object.assign(cuts,{
 knightPuppet:['puppets',100,5,310,500],wizardPuppet:['puppets',590,5,320,500],dwarfPuppet:['puppets',1100,20,340,480],knightArm:['puppets',35,530,410,430],wizardArm:['puppets',540,550,470,460],treasureArm:['puppets',1050,705,460,255],
 cat:['new-heroes',40,80,445,390],dwarf:['new-heroes',605,20,340,485],knight:['new-heroes',1160,0,250,505],ghost:['new-heroes',60,560,410,395],wizard:['new-heroes',595,515,330,505],
 owl:['heroes',40,220,405,710],witch:['heroes',512,25,420,945],dragon:['heroes',980,155,550,790],
 mouse:['props',30,65,350,290],chest:['props',445,5,370,375],lid:['props',855,105,380,225],yarn:['props',465,445,340,290],sword:['props',35,755,285,450],wand:['props',415,800,390,415],clock:['props',910,755,265,480],
 flyingWitch:['actions',10,20,485,485],walkingDwarf:['actions',540,15,440,480],horseRider:['actions',1030,15,500,485],horseFront:['actions',165,570,230,345],horseBack:['actions',625,560,235,405],playCat:['actions',1045,525,450,310],catPaw:['actions',1210,840,135,135],
 guardBody:['extra',90,5,385,500],guardLeft:['extra',505,95,485,330],guardRight:['extra',1020,95,485,330],hat:['extra',25,555,465,440],catBust:['extra',565,515,400,480],dwarfArm:['extra',1025,605,490,295]
});
function drawIdle(ctx,actor,cx,bottom,maxHeight,maxWidth){const cut=cuts[actor];if(!cut)return;const ratio=Math.min(maxHeight/cut[4],maxWidth/cut[3]);const w=cut[3]*ratio,h=cut[4]*ratio;sprite(ctx,actor,cx-w/2,bottom-h,w,h)}
function place(ctx,n){const im=paintAssets.places;if(im)ctx.drawImage(im,(n%2)*768,Math.floor(n/2)*512,768,512,0,0,720,430)}
function sparkle(ctx,x,y,t,count=8){ctx.save();for(let i=0;i<count;i++){const p=(t*.4+i/count)%1;ctx.globalAlpha=Math.sin(p*Math.PI);ctx.fillStyle='#fff2ad';const xx=x+Math.sin(i*7.1)*p*70,yy=y-p*85;ctx.beginPath();ctx.ellipse(xx,yy,2+Math.sin(p*Math.PI)*2,2+Math.sin(p*Math.PI)*2,0,0,7);ctx.fill()}ctx.restore()}
function paintNewScene(ctx,type,t,live){
 const wave=Math.sin(t*2*Math.PI/4),hop=Math.abs(Math.sin(t*5));






 if(type==='wizardWand'){
  place(ctx,3);sprite(ctx,'wizardPuppet',250,57,221,345,0,.5,.5,-1,1);const a=live?wave*.24:0;
  sprite(ctx,'wizardArm',357,106,188,184,a,.13,.5);
  ctx.save();ctx.translate(381.44,198);ctx.rotate(a);if(live)sparkle(ctx,142,-75,t,14);ctx.restore();return true;
 }
 if(type==='ghostHall'){
  place(ctx,3);const x=355+Math.sin(t*.85)*155,y=215+Math.sin(t*1.7)*30;
  ctx.save();ctx.globalAlpha=.9;sprite(ctx,'ghost',x-112,y-110,225,217,Math.sin(t)*.06);ctx.restore();return true;
 }


 if(type==='dragonGuard'){
  place(ctx,2);const spread=live?.72+.28*Math.sin(t*1.3):.8;
  sprite(ctx,'guardLeft',126,117,220,150,live?wave*.12:0,.95,.9,spread,1);
  sprite(ctx,'guardRight',366,117,220,150,live?-wave*.12:0,.05,.9,spread,1);
  sprite(ctx,'guardBody',243,35,254,330,live?Math.sin(t*.9)*.022:0,.5,.98);return true;
 }
 if(type==='owlClock'){
  place(ctx,0);sprite(ctx,'clock',285,181,150,242);
  // A real swinging pendulum is masked within the clock's wooden case.
  ctx.save();ctx.beginPath();ctx.rect(337,315,46,68);ctx.clip();ctx.fillStyle='#51351e';ctx.fillRect(337,315,46,68);ctx.translate(360,316);ctx.rotate(live?Math.sin(t*3)*.28:0);ctx.strokeStyle='#d4a34d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,45);ctx.stroke();ctx.fillStyle='#e8b956';ctx.beginPath();ctx.arc(0,46,10,0,7);ctx.fill();ctx.restore();
  // Keep feet on the clock and turn only the owl's head.
  const im=paintAssets.heroes;ctx.drawImage(im,60,500,370,430,310,112,100,116);
  ctx.save();ctx.translate(360,122);ctx.rotate(live?wave*.08:0);ctx.drawImage(im,45,225,400,355,-56,-83,112,99);ctx.restore();return true;
 }
 return false;
}

// Whole painted poses keep limbs, fabric, hands and interacting objects connected.
// Deliberately no independently rotated legs, cropped cape strips or floating props.
const flipbooks={
 knightHorse:{asset:'horse',columns:4,frames:8,place:2,x:150,y:10,size:410,timing:[[0,.12],[1,.12],[2,.12],[3,.12],[4,.12],[5,.12],[6,.12],[7,.12]]},
 dwarfBag:{asset:'walk',columns:4,frames:8,place:1,x:175,y:30,size:365,timing:[[0,.15],[1,.15],[2,.15],[3,.15],[4,.15],[5,.15],[6,.15],[7,.15]]},
 witchFly:{asset:'flight',columns:3,frames:6,place:1,x:180,y:20,size:340,timing:[[0,.18],[1,.18],[2,.18],[1,.18],[0,.18],[4,.18],[5,.18],[4,.18]]},
 knightSword:{asset:'sword',columns:3,frames:6,place:2,x:170,y:12,size:405,timing:[[0,.7],[1,.16],[2,.16],[3,.16],[4,.16],[5,1.2],[4,.16],[3,.16],[2,.16],[1,.16]]},
 dwarfTreasure:{asset:'chest',columns:3,frames:6,place:1,x:130,y:-5,size:440,timing:[[0,.7],[1,.18],[2,.18],[3,.18],[4,.18],[5,2.2],[4,.18],[3,.18],[2,.18],[1,.18]]},
 catHat:{asset:'hat',columns:3,frames:6,place:0,x:175,y:20,size:390,timing:[[0,.6],[1,.18],[2,.18],[3,.9],[4,.12],[5,1.2],[3,.4],[2,.18],[1,.18]]},
 catYarn:{asset:'yarn',columns:3,frames:6,place:0,x:140,y:-5,size:440,timing:[[0,.4],[1,.2],[2,.2],[3,.35],[4,.2],[5,.4]]},
 catMouse:{asset:'chase',columns:3,frames:6,place:0,x:90,y:-20,size:510,timing:[[0,.28],[1,.14],[2,.16],[3,.14],[4,.14],[5,.28]]}
};
function flipbookFrame(book,t){const duration=book.timing.reduce((sum,entry)=>sum+entry[1],0);let cursor=((t%duration)+duration)%duration;for(const [frame,hold] of book.timing){if(cursor<hold)return frame;cursor-=hold}return book.timing[0][0]}
function paintFlipbook(ctx,type,t,frameOverride){const b=flipbooks[type];if(!b)return false;place(ctx,b.place);const im=paintAssets['animation/'+b.asset];if(!im)return true;const frame=frameOverride??flipbookFrame(b,t);const cw=im.width/b.columns,ch=im.height/2;
 let x=b.x,y=b.y;if(type==='witchFly'){x+=Math.sin(t*.85)*35;y+=Math.sin(t*1.7)*9}
 ctx.drawImage(im,(frame%b.columns)*cw,Math.floor(frame/b.columns)*ch,cw,ch,x,y,b.size,b.size);
 if(type==='dwarfTreasure'&&frame===5)sparkle(ctx,458,288,t,8);
 return true;
}
