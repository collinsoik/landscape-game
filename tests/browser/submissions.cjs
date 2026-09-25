const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
(async () => {
 const origin = process.env.CHECK_ORIGIN || 'http://localhost:3101';
 const base = origin + '/games/landscape-game';
 const browser = await chromium.launch({headless:true});
 const context = await browser.newContext({viewport:{width:1366,height:900}});
 const external=[]; const errors=[];
 await context.route('**/*', route => {
   const url=new URL(route.request().url());
   if (url.protocol.startsWith('http') && url.origin!==origin) { external.push(url.href); return route.abort(); }
   return route.continue();
 });
 context.on('page', page=>page.on('pageerror', e=>errors.push(e.message)));
 const page=await context.newPage();
 await page.goto(base+'/admin');
 await page.getByPlaceholder('e.g. Biology 101').fill('Automated verification — remove after check');
 await page.getByRole('button',{name:'Create Room',exact:true}).click();
 const codeElement=page.locator('p.font-mono');
 await codeElement.waitFor();
 const code=await codeElement.innerText();
 console.log('ROOM_CODE='+code);
 const landscapes=['meadow','riverside','rocky-hills','lakeside','coastal'];
 for (const landscapeId of landscapes) {
  const student=await context.newPage();
  await student.addInitScript(({landscapeId})=>{
   sessionStorage.setItem('landscape-game', JSON.stringify({version:0,state:{
    playerName:'Test '+landscapeId, landscapeId, phase:'submission', currentRound:3,
    roundResults:[{round:1,stars:3},{round:2,stars:3},{round:3,stars:3}],
    placements:[{id:'test-tree',elementType:'oak_tree',x:100,y:200,round:1}],submittedRoomCode:null,
   }}));
  },{landscapeId});
  await student.goto(base+'/submit');
  await student.locator('canvas').first().waitFor();
  await student.waitForFunction(()=>{
   const c=document.querySelector('canvas');return c && c.getContext('2d').getImageData(10,10,1,1).data[3]===255;
  });
  await student.getByPlaceholder('e.g. ABC123').fill(code);
  const requestPromise=student.waitForRequest(r=>r.url().endsWith('/submit') && r.method()==='POST');
  await student.getByRole('button',{name:'Submit',exact:true}).click();
  assert.equal((await requestPromise).postDataJSON().landscapeId,landscapeId);
  await student.getByRole('button',{name:'View Gallery'}).waitFor();
  await student.close();
 }
 await page.goto(base+'/gallery/'+code);
 await page.getByText('5 submissions',{exact:true}).waitFor();
 await page.waitForFunction(()=>{
  const cs=[...document.querySelectorAll('canvas')].filter((_,i)=>i%2===0);
  return cs.length===5 && cs.every(c=>c.getContext('2d').getImageData(10,10,1,1).data[3]===255);
 });
 const backgrounds=await page.locator('canvas').evaluateAll(cs=>cs.filter((_,i)=>i%2===0).map(c=>c.toDataURL()));
 assert.equal(new Set(backgrounds).size,5,'each selected background must render differently');
 await page.getByPlaceholder('Enter your name').fill('Test Voter');
 await page.getByRole('button',{name:'Most Beautiful',exact:true}).first().click();
 await page.getByRole('button',{name:'Submit Votes'}).click();
 await page.getByRole('button',{name:'View Results'}).click();
 await page.getByText('1 vote',{exact:true}).waitFor();
 await page.screenshot({path:'/tmp/landscape-gallery-verification.png',fullPage:true});
 const response=await context.request.get(base+'/api/rooms/'+code+'/submissions');
 assert.deepEqual((await response.json()).submissions.map(s=>s.landscapeId),landscapes);
 assert.deepEqual(external,[],'no browser requests should leave the website');
 assert.deepEqual(errors,[],'no browser errors');
 console.log('PASS: create room, submit all five backgrounds, render gallery, vote, display results; zero external browser requests.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
