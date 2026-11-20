const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const engine=require('./audio-boundary-nudge-v4d.cjs');
engine.initialize();
const port=3011;
const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  try{
    if(req.method==='GET'&&req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fs.readFileSync(path.join(__dirname,'audio-nudge-ui-v4d.html')));}
    if(req.method==='GET'&&req.url==='/api/state'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(engine.getState()));}
    if(req.method==='POST'&&req.url==='/api/boundary'){
      if(req.headers.origin&&req.headers.origin!==`http://localhost:${port}`&&req.headers.origin!==`http://127.0.0.1:${port}`)throw Error('Origin rejected');
      let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)throw Error('Request too large');}
      const {index,correctionMs}=JSON.parse(body);const result=engine.update(index,correctionMs);
      res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(result));
    }
    res.statusCode=404;res.end('Not found');
  }catch(e){res.statusCode=400;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:e.message}));}
});
server.listen(port,'127.0.0.1',()=>console.log(`Manual Audio Boundary Nudge: http://localhost:${port}`));
