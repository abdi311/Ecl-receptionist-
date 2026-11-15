const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1600,height:1100}});
 p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
 for(const spec of process.argv.slice(2)){
   const [view,mode,out,tools]=spec.split(':');
   await p.goto(`http://localhost:8765/index.html?view=${view}&mode=${mode}&tools=${tools||1}`);
   await p.waitForFunction(()=>window.DONE,null,{timeout:300000});
   await p.screenshot({path:out});
   console.log('ok',out);
 }
 await b.close();
})();
