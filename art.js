/* Painted raster parts composed at runtime. No vector character artwork. */
const paintAssets={};const paintFiles=['witch','owl','dragon','scenes','heroes'];let paintReady=false;
Promise.all(paintFiles.map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>{paintAssets[name]=im;resolve()};im.onerror=()=>{console.error('Не удалось загрузить иллюстрацию',name);resolve()};im.src='assets/'+name+'.webp'}))).then(()=>paintReady=true);
function scene(type,live=false,card=false){return `<canvas width="1080" height="645" class="raster-scene ${live?'live':''} ${card?'card-art':''}" data-scene="${type}" aria-hidden="true"></canvas>`}
const cuts={witchBody:['witch',182,15,299,603],witchArm:['witch',719,45,459,547],pot:['witch',37,692,552,516],owlBody:['owl',172,25,299,591],owlLeft:['owl',668,28,535,471],owlRight:['owl',47,656,549,468],owlClock:['owl',814,631,242,609],dragonBody:['dragon',28,127,588,347],dragonHead:['dragon',691,136,502,322],dragonWing:['dragon',26,700,580,475],dragonGuard:['dragon',628,647,617,583]};
function sprite(ctx,name,x,y,w,h,angle=0,px=.5,py=.5,sx=1,sy=1){const [asset,a,b,c,d]=cuts[name];if(!paintAssets[asset])return;ctx.save();ctx.translate(x+w*px,y+h*py);ctx.rotate(angle);ctx.scale(sx,sy);ctx.drawImage(paintAssets[asset],a,b,c,d,-w*px,-h*py,w,h);ctx.restore()}
function backdrop(ctx,index){if(!paintAssets.scenes)return;ctx.drawImage(paintAssets.scenes,(index%2)*768,Math.floor(index/2)*512,768,512,0,0,720,430)}
function mist(ctx,x,y,t,green=false){for(let i=0;i<4;i++){const f=(t/4+i*.25)%1;ctx.save();ctx.globalAlpha=Math.sin(f*Math.PI)*.22;const xx=x+Math.sin(f*5+i)*15,yy=y-f*80;const g=ctx.createRadialGradient(xx,yy,0,xx,yy,12+f*16);g.addColorStop(0,green?'#e7e6ab':'#eee5d0');g.addColorStop(1,'#e7e6ab00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(xx,yy,12+f*16,10+f*11,0,0,Math.PI*2);ctx.fill();ctx.restore()}}
function paintScene(canvas,time){const ctx=canvas.getContext('2d');const type=canvas.dataset.scene,live=canvas.classList.contains('live'),card=canvas.classList.contains('card-art');const t=live?time:0;ctx.setTransform(1.5,0,0,1.5,0,0);ctx.clearRect(0,0,720,430);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
if(card&&paintAssets.heroes){const cut=type.startsWith('owl')?[40,440]:type.startsWith('witch')?[512,420]:[980,556];const w=cut[1]*430/1024;ctx.drawImage(paintAssets.heroes,cut[0],0,cut[1],1024,360-w/2,0,w,430);return;}
if(type==='witchFly'){backdrop(ctx,3);return}
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
