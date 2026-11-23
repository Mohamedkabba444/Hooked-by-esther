const http=require("http");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const root=__dirname;
const dataFile=path.join(root,"orders.json");
const port=Number(process.env.PORT||4173);
const allowedStatus=["placed","creating","done","shipped"];

function readOrders(){
  try{return JSON.parse(fs.readFileSync(dataFile,"utf8"));}catch{return [];}
}
function writeOrders(orders){
  fs.writeFileSync(dataFile,JSON.stringify(orders,null,2));
}
function send(res,status,data,headers={}){
  res.writeHead(status,{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...headers});
  res.end(JSON.stringify(data));
}
function readJson(req,res,done){
  let body="";
  req.on("data",chunk=>{body+=chunk;if(body.length>100000){res.destroy();}});
  req.on("end",()=>{try{done(JSON.parse(body||"{}"));}catch{send(res,400,{error:"Invalid JSON"});}});
}
function safePath(urlPath){
  const clean=decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/,"");
  const resolved=path.resolve(root,clean||"index.html");
  return resolved===root||resolved.startsWith(root+path.sep)?resolved:null;
}
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp",".jpg":"image/jpeg",".png":"image/png"};

const server=http.createServer((req,res)=>{
  if(req.url.startsWith("/api/orders")&&req.method==="POST"){
    return readJson(req,res,body=>{
      const name=String(body.name||"").trim().slice(0,80);
      const item=String(body.item||"").trim().slice(0,200);
      const contact=String(body.contact||"").trim().slice(0,160);
      if(!name||!item||!contact)return send(res,400,{error:"Name, item and contact are required"});
      const date=new Date().toISOString().slice(2,10).replaceAll("-","");
      const random=crypto.randomBytes(3).toString("hex").slice(0,4).toUpperCase();
      const number="HBE-"+date+"-"+random;
      const order={number,name,item,colors:String(body.colors||"").trim().slice(0,120),size:String(body.size||"").trim().slice(0,120),contact,status:"placed",created:new Date().toISOString()};
      const orders=readOrders();orders.unshift(order);writeOrders(orders.slice(0,1000));
      send(res,201,order);
    });
  }
  if(req.url.startsWith("/api/orders/")&&req.method==="GET"){
    const number=decodeURIComponent(req.url.split("/").pop()).toUpperCase();
    const order=readOrders().find(item=>item.number===number);
    return order?send(res,200,order):send(res,404,{error:"Order not found"});
  }
  if(req.url.startsWith("/api/orders/")&&req.method==="PATCH"){
    const number=decodeURIComponent(req.url.split("/").pop()).toUpperCase();
    if(req.headers["x-admin-token"]!==process.env.ADMIN_TOKEN)return send(res,401,{error:"Admin authentication required"});
    return readJson(req,res,body=>{
      if(!allowedStatus.includes(body.status))return send(res,400,{error:"Invalid status"});
      const orders=readOrders();
      const index=orders.findIndex(item=>item.number===number);
      if(index<0)return send(res,404,{error:"Order not found"});
      orders[index].status=body.status;
      orders[index].updated=new Date().toISOString();
      writeOrders(orders);
      send(res,200,orders[index]);
    });
  }
  if(req.method!=="GET"&&req.method!=="HEAD")return send(res,405,{error:"Method not allowed"});
  const file=safePath(req.url);
  if(!file)return send(res,403,{error:"Forbidden"});
  fs.stat(file,(error,stats)=>{
    if(error||!stats.isFile())return send(res,404,{error:"Not found"});
    res.writeHead(200,{"Content-Type":types[path.extname(file).toLowerCase()]||"application/octet-stream","X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","X-Frame-Options":"SAMEORIGIN","Permissions-Policy":"camera=(), microphone=(), geolocation=()"});
    if(req.method==="HEAD")return res.end();
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(port,()=>console.log("Hooked by Esther listening at http://localhost:"+port));
