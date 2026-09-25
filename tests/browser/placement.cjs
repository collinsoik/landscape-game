const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const origin=process.env.CHECK_ORIGIN || 'http://localhost:3101';
 const base=origin+'/games/landscape-game';
 const errors=[];
 async function game(landscapeId,round=1,touch=false){
  const context=await browser.newContext({viewport:{width:1366,height:900},hasTouch:touch});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({landscapeId,round})=>{
   sessionStorage.setItem('landscape-game',JSON.stringify({version:0,state:{playerName:'Test Gardener',landscapeId,phase:'playing',currentRound:round,roundResults:[],placements:[],submittedRoomCode:null}}));
  },{landscapeId,round});
  await page.goto(base+'/game');
  await page.locator('[data-landscape-canvas] canvas').first().waitFor();
  await page.waitForFunction(()=>{
   const c=document.querySelector('canvas');return c && c.getContext('2d').getImageData(10,10,1,1).data[3]===255;
  });
  const box=await page.locator('[data-landscape-canvas]').boundingBox();
  const point=(x,y)=>({x:box.x+x/1200*box.width,y:box.y+y/800*box.height});
  const click=async(x,y)=>{const p=point(x,y);await page.mouse.click(p.x,p.y);};
  const count=()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('landscape-game')).state.placements.length);
  const placements=()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('landscape-game')).state.placements);
  return {page,context,box,point,click,count,placements};
 }
 const c=await game('coastal');
 await c.page.getByAltText('Oak Tree',{exact:true}).click();
 await c.click(600,360);assert.equal(await c.count(),0);assert.match(await c.page.getByRole('status').innerText(),/Plants need grass/);
 await c.click(800,650);assert.equal(await c.count(),0);assert.match(await c.page.getByRole('status').innerText(),/water and rocks/);
 await c.page.screenshot({path:'/tmp/landscape-blocked.png'});
 await c.click(200,130);assert.equal(await c.count(),1);
 const before=await c.placements();const from=c.point(200,130),to=c.point(800,650);
 await c.page.mouse.move(from.x,from.y);await c.page.mouse.down();await c.page.mouse.move(to.x,to.y,{steps:12});
 assert.match(await c.page.getByRole('status').innerText(),/water and rocks/);
 await c.page.screenshot({path:'/tmp/landscape-drag-blocked.png'});
 await c.page.mouse.up();assert.deepEqual(await c.placements(),before);
 console.log('PASS coastal plants blocked on sand/water; invalid move visibly warns and snaps back.');
 const d=await game('coastal',3);
 await d.page.getByAltText('Park Bench',{exact:true}).click();await d.click(600,370);assert.equal(await d.count(),1);
 await d.click(800,650);assert.equal(await d.count(),1);
 console.log('PASS bench allowed on sand, blocked on water.');
 for (const landscapeId of ['riverside','lakeside','rocky-hills']){
  const g=await game(landscapeId);await g.page.getByAltText('Oak Tree',{exact:true}).click();
  let center={x:600,y:440};
  if(landscapeId==='rocky-hills'){
   center=await g.page.locator('canvas').first().evaluate(c=>{
    const {data,width,height}=c.getContext('2d').getImageData(0,0,c.width,c.height);
    for(let y=Math.ceil(height*.2);y<height*.8;y++)for(let x=Math.ceil(width*.2);x<width*.8;x++){
     const i=(y*width+x)*4;const [r,g,b]=data.slice(i,i+3);
     if(r>70 && Math.abs(r-g)<10 && g-b<40 && b>50)return {x:x/width*1200,y:y/height*800};
    }
    throw new Error('No boulder pixel found');
   });
  }
  await g.click(center.x,center.y);assert.equal(await g.count(),0,landscapeId);assert.match(await g.page.getByRole('status').innerText(),/water and rocks/);
  console.log('PASS '+landscapeId+' terrain blocks placement.');
 }
 const t=await game('coastal',1,true);
 await t.page.getByAltText('Oak Tree',{exact:true}).tap();
 const spot=t.point(200,130);await t.page.touchscreen.tap(spot.x,spot.y);
 assert.equal(await t.count(),1,'one touchscreen tap should place exactly one tree');
 await t.page.touchscreen.tap(spot.x,spot.y);await t.page.touchscreen.tap(spot.x,spot.y);
 assert.equal(await t.count(),1,'rapid repeated touchscreen taps must not consume extra slots');
 await t.page.getByAltText('Oak Tree',{exact:true}).tap();const water=t.point(800,650);await t.page.touchscreen.tap(water.x,water.y);
 assert.equal(await t.count(),1);assert.match(await t.page.getByRole('status').innerText(),/water and rocks/);
 console.log('PASS touch taps: one tree per tap, no duplicate slots, blocked terrain feedback.');
 const drag=await game('meadow');
 await drag.page.evaluate(()=>{
  const original=DataTransfer.prototype.setDragImage;
  DataTransfer.prototype.setDragImage=function(image,x,y){window.dragImageCheck={width:image.width,height:image.height,x,y,data:image.toDataURL()};return original.call(this,image,x,y)};
 });
 const card=drag.page.getByAltText('Oak Tree',{exact:true}).locator('..').locator('..');
 await card.dragTo(drag.page.locator('[data-landscape-canvas]'),{targetPosition:{x:drag.box.width*.3,y:drag.box.height*.3}});
 assert.equal(await drag.count(),1,'sidebar drag places one tree');
 const check=await drag.page.evaluate(()=>window.dragImageCheck);
 assert.equal(check.width,Math.round(192*drag.box.width/1200));assert.equal(check.x,check.width/2);
 const matches=await drag.page.getByAltText('Oak Tree',{exact:true}).evaluate((img,check)=>{
  const c=document.createElement('canvas');c.width=check.width;c.height=check.height;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,c.width,c.height);return c.toDataURL()===check.data;
 },check);
 assert.equal(matches,true,'drag image exactly matches the scaled plant sprite');
 console.log('PASS native drag uses identical plant pixels at placement size.');
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
