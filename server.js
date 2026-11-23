const http=require("http");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const root=__dirname;
const dataFile=path.join(root,"orders.json");
const port=Number(process.env.PORT||4173);
const allowedStatus=["placed","creating","done","shipped"];

function readOrders(){
  try{
    const orders=JSON.parse(fs.readFileSync(dataFile,"utf8"));
    if(!Array.isArray(orders))throw new Error("Order data must be an array");
    return orders;
  }catch(error){
    if(error.code==="ENOENT")return [];
    throw error;
  }
}
function writeOrders(orders){
  fs.writeFileSync(dataFile,JSON.stringify(orders,null,2));
}
function send(res,status,data,headers={}){
  res.writeHead(status,{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...headers});
  res.end(JSON.stringify(data));
}
function readJson(req,res,done,maxBytes=100000){
  const chunks=[];
  let bytes=0,tooLarge=false;
  req.on("data",chunk=>{
    bytes+=chunk.length;
    if(bytes>maxBytes){tooLarge=true;return;}
    chunks.push(chunk);
  });
  req.on("end",()=>{
    if(tooLarge)return send(res,413,{error:"Request is too large"});
    let body;
    try{body=JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}");}catch{return send(res,400,{error:"Invalid JSON"});}
    if(!body||typeof body!=="object"||Array.isArray(body))return send(res,400,{error:"JSON body must be an object"});
    done(body);
  });
}
function safePath(urlPath){
  let clean;
  try{clean=decodeURIComponent(new URL(urlPath,"http://localhost").pathname).replace(/^\/+/,"");}catch{return null;}
  const resolved=path.resolve(root,clean||"index.html");
  if(resolved!==root&&!resolved.startsWith(root+path.sep))return null;
  const relative=path.relative(root,resolved);
  if(relative.split(path.sep).some(part=>part.startsWith("."))||relative.toLowerCase()==="orders.json")return null;
  return resolved;
}
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png"};

const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,"http://localhost").pathname;
  if(pathname==="/api/orders"&&req.method==="POST"){
    return readJson(req,res,body=>{
      const name=String(body.name||"").trim().slice(0,80);
      const item=String(body.item||"").trim().slice(0,200);
      const contact=String(body.contact||"").trim().slice(0,160);
      if(!name||!item||!contact)return send(res,400,{error:"Name, item and contact are required"});
      const date=new Date().toISOString().slice(2,10).replaceAll("-","");
      const random=crypto.randomBytes(3).toString("hex").slice(0,4).toUpperCase();
      const number="HBE-"+date+"-"+random;
      let imageUrl="";
      if(body.imageData){
        const match=String(body.imageData).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
        if(!match)return send(res,400,{error:"Photo must be a JPG, PNG or WebP image"});
        const image=Buffer.from(match[2],"base64");
        if(image.length>5*1024*1024||image.toString("base64")!==match[2])return send(res,400,{error:"Photo must be no larger than 5 MB"});
        const extension={"image/jpeg":".jpg","image/png":".png","image/webp":".webp"}[match[1]];
        const filename=crypto.randomBytes(18).toString("hex")+extension;
        try{
          const imageDirectory=path.join(root,"uploads");
          fs.mkdirSync(imageDirectory,{recursive:true});
          fs.writeFileSync(path.join(imageDirectory,filename),image,{flag:"wx"});
        }catch(error){
          console.error("Could not save order photo:",error.message);
          return send(res,500,{error:"The photo could not be saved. Please try again."});
        }
        imageUrl="/uploads/"+filename;
      }
      const order={
        number,name,item,piece:String(body.piece||"").trim().slice(0,100),
        colors:String(body.colors||"").trim().slice(0,120),size:String(body.size||"").trim().slice(0,120),
        contact,payment:body.payment==="secure"?"secure":"invoice",
        fulfillment:body.fulfillment==="delivery"?"delivery":"pickup",
        location:String(body.location||"").trim().slice(0,200),
        estimate:String(body.estimate||"").trim().slice(0,200),imageUrl,
        status:"placed",created:new Date().toISOString()
      };
      try{
        const orders=readOrders();orders.unshift(order);writeOrders(orders.slice(0,1000));
      }catch(error){
        console.error("Could not save order:",error.message);
        return send(res,500,{error:"The order could not be saved. Please try again."});
      }
      send(res,201,order);
    },8*1024*1024);
  }
  if(/^\/api\/orders\/[^/]+$/.test(pathname)&&req.method==="GET"){
    let number;
    try{number=decodeURIComponent(pathname.slice("/api/orders/".length)).toUpperCase();}catch{return send(res,400,{error:"Invalid order number"});}
    try{
      const order=readOrders().find(item=>item&&item.number===number);
      return order?send(res,200,{number:order.number,status:order.status,item:order.item}):send(res,404,{error:"Order not found"});
    }catch(error){
      console.error("Could not read orders:",error.message);
      return send(res,500,{error:"Order tracking is temporarily unavailable."});
    }
  }
  if(/^\/api\/orders\/[^/]+$/.test(pathname)&&req.method==="PATCH"){
    let number;
    try{number=decodeURIComponent(pathname.slice("/api/orders/".length)).toUpperCase();}catch{return send(res,400,{error:"Invalid order number"});}
    if(!process.env.ADMIN_TOKEN)return send(res,503,{error:"Order updates are not configured"});
    if(req.headers["x-admin-token"]!==process.env.ADMIN_TOKEN)return send(res,401,{error:"Admin authentication required"});
    return readJson(req,res,body=>{
      if(!allowedStatus.includes(body.status))return send(res,400,{error:"Invalid status"});
      try{
        const orders=readOrders();
        const index=orders.findIndex(item=>item&&item.number===number);
        if(index<0)return send(res,404,{error:"Order not found"});
        orders[index].status=body.status;
        orders[index].updated=new Date().toISOString();
        writeOrders(orders);
        send(res,200,orders[index]);
      }catch(error){
        console.error("Could not update order:",error.message);
        return send(res,500,{error:"The order could not be updated. Please try again."});
      }
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
