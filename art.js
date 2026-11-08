/* Painted raster parts composed at runtime. No vector character artwork. */
const paintAssets={};const paintFiles=['witch','owl','dragon','scenes','heroes','new-heroes','props','places','actions','extra','puppets'];let paintReady=false;
Promise.all(paintFiles.map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>{paintAssets[name]=im;resolve()};im.onerror=()=>{console.error('Не удалось загрузить иллюстрацию',name);resolve()};im.src='assets/'+name+'.webp'}))).then(()=>paintReady=true);
function scene(type,live=false,card=false){return `<canvas width="${card?300:1080}" height="${card?430:645}" class="raster-scene ${live?'live':''} ${card?'card-art':''}" data-scene="${type}" aria-hidden="true"></canvas>`}
const cuts={witchBody:['witch',182,15,299,603],witchArm:['witch',719,45,459,547],pot:['witch',37,692,552,516],owlBody:['owl',172,25,299,591],owlLeft:['owl',668,28,535,471],owlRight:['owl',47,656,549,468],owlClock:['owl',814,631,242,609],dragonBody:['dragon',28,127,588,347],dragonHead:['dragon',691,136,502,322],dragonWing:['dragon',26,700,580,475],dragonGuard:['dragon',628,647,617,583]};
function sprite(ctx,name,x,y,w,h,angle=0,px=.5,py=.5,sx=1,sy=1){const [asset,a,b,c,d]=cuts[name];if(!paintAssets[asset])return;ctx.save();ctx.translate(x+w*px,y+h*py);ctx.rotate(angle);ctx.scale(sx,sy);ctx.drawImage(paintAssets[asset],a,b,c,d,-w*px,-h*py,w,h);ctx.restore()}
function backdrop(ctx,index){if(!paintAssets.scenes)return;ctx.drawImage(paintAssets.scenes,(index%2)*768,Math.floor(index/2)*512,768,512,0,0,720,430)}
function mist(ctx,x,y,t,green=false){for(let i=0;i<4;i++){const f=(t/4+i*.25)%1;ctx.save();ctx.globalAlpha=Math.sin(f*Math.PI)*.22;const xx=x+Math.sin(f*5+i)*15,yy=y-f*80;const g=ctx.createRadialGradient(xx,yy,0,xx,yy,12+f*16);g.addColorStop(0,green?'#e7e6ab':'#eee5d0');g.addColorStop(1,'#e7e6ab00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(xx,yy,12+f*16,10+f*11,0,0,Math.PI*2);ctx.fill();ctx.restore()}}
function paintScene(canvas,time){const ctx=canvas.getContext('2d');const type=canvas.dataset.scene,live=canvas.classList.contains('live'),card=canvas.classList.contains('card-art');const t=live?time:0;ctx.setTransform(1.5,0,0,1.5,0,0);ctx.clearRect(0,0,720,430);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
if(card){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,300,430);drawIdle(ctx,type,150,410,380,280);return;}
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
let lastPaint=0;function tick(now){if(paintReady&&now-lastPaint>30){lastPaint=now;document.querySelectorAll('canvas[data-scene]').forEach(c=>{if(c.offsetWidth&&c.getBoundingClientRect().bottom>0&&c.getBoundingClientRect().top<innerHeight){if(c.classList.contains('live')||!c.dataset.painted){paintScene(c,now/1000);c.dataset.painted='yes'}}})}requestAnimationFrame(tick)}requestAnimationFrame(tick);

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
 if(type==='catMouse'){
  place(ctx,0);const phase=t%5/5,x=live?-170+phase*1040:220;const leap=live?Math.max(0,Math.sin(phase*Math.PI*4))*65:0;
  sprite(ctx,'mouse',x+230,335-Math.abs(Math.sin(t*11))*5,73,60);
  sprite(ctx,'playCat',x,210-leap,235,162,live?-Math.sin(phase*Math.PI*4)*.08:0);
  sprite(ctx,'catPaw',x+168,320-leap,58,58,live?Math.sin(t*5)*.5:0,.3,.1);return true;
 }
 if(type==='catYarn'){
  place(ctx,0);const roll=live?(1-Math.cos(t*2))*50:0;const paw=live?Math.sin(t*2)*.35:0;
  sprite(ctx,'playCat',145,160,305,210);sprite(ctx,'catPaw',360,295,78,78,paw,.2,.1);
  ctx.strokeStyle='#ce7055';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(425,385);ctx.bezierCurveTo(460,390,450+roll,370,482+roll,373);ctx.stroke();
  sprite(ctx,'yarn',445+roll,305,95,81,roll/48);return true;
 }
 if(type==='catHat'){
  place(ctx,0);const rise=live?(1-Math.cos(t*1.25))*32:50;
  sprite(ctx,'hat',230,225,250,180);
  ctx.save();ctx.beginPath();ctx.rect(200,40,330,211);ctx.clip();sprite(ctx,'catBust',277,143-rise,163,195);ctx.restore();
  // Foreground wall of the hat hides the body inside; paws remain at its rim.
  ctx.save();ctx.beginPath();ctx.rect(220,257,280,155);ctx.clip();sprite(ctx,'hat',230,225,250,180);ctx.restore();return true;
 }
 if(type==='dwarfTreasure'){
  place(ctx,1);sprite(ctx,'dwarfPuppet',210,85,212,300,0,.5,.5,-1,1);const open=live?(1-Math.cos(t*Math.PI/3))/2:1;
  const im=paintAssets.props;
  // Lid remains hinged to the chest; its projected height changes as it opens.
  ctx.drawImage(im,445,185,370,195,420,293,215,113);
  if(open>.02)ctx.drawImage(im,445,5,370,180,420,293-100*open,215,100*open);
  ctx.save();ctx.globalAlpha=1-open;sprite(ctx,'lid',420,268,215,80);ctx.restore();
  sprite(ctx,'treasureArm',337,188,115,64,-open*.2,.15,.3);
  if(open>.25)sparkle(ctx,525,291,t,12);return true;
 }
 if(type==='dwarfBag'){
  place(ctx,1);const x=live?245+Math.sin(t*.8)*140:245;const step=live?Math.sin(t*7):0;
  // Separate boot regions pivot as the body and shoulder sack move along the path.
  ctx.save();ctx.beginPath();ctx.rect(0,0,720,316);ctx.clip();sprite(ctx,'walkingDwarf',x,84-Math.abs(step)*5,246,268);ctx.restore();
  const im=paintAssets.actions;ctx.save();ctx.translate(x+62,310);ctx.rotate(step*.2);ctx.drawImage(im,622,390,130,108,-30,-10,73,60);ctx.restore();
  ctx.save();ctx.translate(x+165,310);ctx.rotate(-step*.2);ctx.drawImage(im,782,382,165,111,-30,-10,92,62);ctx.restore();return true;
 }
 if(type==='knightSword'){
  place(ctx,2);sprite(ctx,'knightPuppet',245,42,217,350,0,.5,.5,-1,1);
  sprite(ctx,'knightArm',317,69,185,194,live?wave*.22:0,.18,.56);return true;
 }
 if(type==='wizardWand'){
  place(ctx,3);sprite(ctx,'wizardPuppet',250,57,221,345,0,.5,.5,-1,1);const a=live?wave*.24:0;
  sprite(ctx,'wizardArm',357,106,188,184,a,.13,.5);
  ctx.save();ctx.translate(381.44,198);ctx.rotate(a);if(live)sparkle(ctx,142,-75,t,14);ctx.restore();return true;
 }
 if(type==='ghostHall'){
  place(ctx,3);const x=355+Math.sin(t*.85)*155,y=215+Math.sin(t*1.7)*30;
  ctx.save();ctx.globalAlpha=.9;sprite(ctx,'ghost',x-112,y-110,225,217,Math.sin(t)*.06);ctx.restore();return true;
 }
 if(type==='witchFly'){
  place(ctx,1);ctx.save();ctx.fillStyle='#102f4b55';ctx.fillRect(0,0,720,430);const x=200+Math.sin(t*.9)*105,y=48+Math.sin(t*1.8)*18;
  // Cape strips flutter around their attachment, while the rider and broom travel together.
  const im=paintAssets.actions;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*1.8)*.025);for(let i=0;i<8;i++){const sy=155+i*28;ctx.drawImage(im,10,sy,200,28,Math.sin(t*4+i*.5)*5,(sy-20)*.64,128,18)}ctx.beginPath();ctx.rect(127,0,200,320);ctx.clip();sprite(ctx,'flyingWitch',0,0,310,310);ctx.restore();
  // The broom's trailing brush is a separate painted element.
  ctx.drawImage(im,15,340,230,117,x,y+205,147,75);ctx.restore();return true;
 }
 if(type==='knightHorse'){
  place(ctx,2);const x=live?215+Math.sin(t*.7)*90:215,y=live?35-hop*8:35;
  const a=live?Math.sin(t*7)*.5:0;
  sprite(ctx,'horseBack',x+81,y+244,83,143,a,.3,.1);sprite(ctx,'horseFront',x+235,y+242,75,112,-a,.3,.1);
  sprite(ctx,'horseBack',x+60,y+245,83,143,-a,.3,.1);sprite(ctx,'horseFront',x+218,y+242,75,112,a,.3,.1);
  sprite(ctx,'horseRider',x,y,335,325);return true;
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
