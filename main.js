(function(){
const $=s=>document.querySelector(s);
const wa=t=>`https://wa.me/${SITE.whatsapp}${t?"?text="+encodeURIComponent(t):""}`;

let revealObserver;
function observeReveals(){
  if(!revealObserver){
    revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -40px"});
  }
  document.querySelectorAll(".reveal:not(.is-visible)").forEach(el=>revealObserver.observe(el));
}

/* Optional fallback art for any product not yet supplied with a photo */
function art(p,i){
  const id="p"+i, a=p.a, b=p.b, pats={
    v:`<path d="M0 6l7 8 7-8M0 20l7 8 7-8" fill="none" stroke="${b}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    granny:`<circle cx="10" cy="10" r="6" fill="none" stroke="${b}" stroke-width="3"/><circle cx="10" cy="10" r="1.5" fill="${b}"/>`,
    rib:`<path d="M5 0v20M15 0v20" stroke="${b}" stroke-width="4" stroke-linecap="round" opacity=".85"/>`,
    mesh:`<path d="M0 10h20M10 0v20" stroke="${b}" stroke-width="2.5"/><circle cx="10" cy="10" r="3" fill="${b}"/>`};
  const size=p.pattern==="v"?"14 28":"20 20";
  return `<svg class="art" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Placeholder image for ${p.name}. Replace with a photo."><defs><pattern id="${id}" width="${size.split(" ")[0]}" height="${size.split(" ")[1]}" patternUnits="userSpaceOnUse">${pats[p.pattern]}</pattern></defs><rect width="320" height="240" fill="${a}"/><rect width="320" height="240" fill="url(#${id})"/></svg>`;
}
const photo=p=>`<img class="art" src="${p.photo}" alt="${p.name}" loading="lazy">`;

/* shop */
const cats=["All",...new Set(PRODUCTS.map(p=>p.cat))];
function show(cat){
  $("#products").innerHTML=PRODUCTS.map((p,i)=>({p,i})).filter(o=>cat==="All"||o.p.cat===cat).map(({p,i})=>`
  <article class="prod reveal">${p.photo?photo(p):art(p,i)}<div class="body"><h3>${p.name}</h3><p>${p.desc}</p><p class="mat">Materials: ${p.materials}</p>
  <div class="price"><span>${typeof p.price==="number"?SITE.currency+p.price:"from "+SITE.currency+String(p.price).replace("from ","")}<small> sample price</small></span><div class="prod-actions"><button class="detail-button" type="button" data-detail="${i}">Details</button><a class="btn btn-sm" href="#order" data-item="${p.name}">Order</a></div></div></div></article>`).join("");
  document.querySelectorAll("[data-item]").forEach((a,index)=>{
    a.style.setProperty("--reveal-delay",`${Math.min(index,3)*70}ms`);
    a.onclick=()=>{
      $("#f-item").value="I'd like a custom "+a.dataset.item+". ";
      $("#selectedChoiceText").textContent=a.dataset.item+" selected";
      $("#selectedChoice").hidden=false;
      $("#order").scrollIntoView({behavior:"smooth",block:"start"});
      setTimeout(()=>$("#f-colors").focus({preventScroll:true}),650);
    };
  });
  document.querySelectorAll("[data-detail]").forEach(button=>{
    button.onclick=()=>{
      const p=PRODUCTS[Number(button.dataset.detail)];
      $("#productContent").innerHTML=`<div class="product-layout"><img src="${p.photo}" alt="${p.name}" width="800" height="800"><div class="product-info"><p class="eyebrow">${p.cat}</p><h2>${p.name}</h2><p>${p.desc}</p><dl><dt>Fibre</dt><dd>${p.fibre}</dd><dt>Size</dt><dd>${p.size}</dd><dt>Care</dt><dd>${p.care}</dd><dt>Allergens</dt><dd>${p.allergens}</dd></dl><a class="btn" href="#order" data-modal-order="${p.name}">Choose this piece</a></div></div>`;
      $("#productDialog").showModal();
      document.querySelector("[data-modal-order]").onclick=()=>{
        $("#productDialog").close();
        $("#f-item").value="I'd like a custom "+p.name+". ";
        $("#selectedChoiceText").textContent=p.name+" selected";
        $("#selectedChoice").hidden=false;
        $("#order").scrollIntoView({behavior:"smooth",block:"start"});
      };
    };
  });
  document.querySelectorAll("#filters .chip").forEach(c=>c.setAttribute("aria-pressed",c.textContent===cat));
  observeReveals();
}
$("#filters").innerHTML=cats.map(c=>`<button class="chip" type="button">${c}</button>`).join("");
$("#filters").onclick=e=>{if(e.target.classList.contains("chip"))show(e.target.textContent)};
show("All");

/* contact links */
$("#waBtn").href=$("#fWa").href=wa("Hi Esther, I'd like to ask about a custom piece.");
$("#mailLink").href=$("#fMail").href="mailto:"+SITE.email;
$("#mailLink").textContent=SITE.email; $("#fIg").href=SITE.instagram; $("#fFb").href=SITE.facebook; $("#yr").textContent=new Date().getFullYear();
[$("#fIg"),$("#fFb")].forEach(a=>{a.target="_blank";a.rel="noopener"});

$("#clearChoice").onclick=()=>{
  $("#selectedChoice").hidden=true;
  $("#selectedChoiceText").textContent="";
  $("#f-item").value="";
  $("#f-item").focus();
};

const statusLabels=["placed","creating","done","shipped"];
const statusNames={placed:"Order placed",creating:"Started creating it",done:"Done creating it",shipped:"Shipped"};
function getOrder(number){
  return (JSON.parse(localStorage.getItem("hbeOrders")||"[]")).find(order=>order.number.toUpperCase()===number.trim().toUpperCase());
}
function showTracking(number){
  const order=getOrder(number);
  const result=$("#trackingResult");
  result.hidden=false;
  if(!order){
    fetch("/api/orders/"+encodeURIComponent(number.trim()),{headers:{"Accept":"application/json"}})
      .then(response=>response.ok?response.json():Promise.reject(new Error("not found")))
      .then(renderServerOrder)
      .catch(()=>{result.innerHTML="<strong>Order not found.</strong><p>Check the order number, or use the exact number sent with your confirmation.</p>";});
    return;
  }
  renderTrackedOrder(order);
}
function renderTrackedOrder(order){
  const result=$("#trackingResult");
  const current=statusLabels.indexOf(order.status);
  result.innerHTML=`<strong>${order.number}</strong><p>${statusNames[order.status]} · ${order.item}</p>
    <ol>${statusLabels.map((status,index)=>`<li class="${index<=current?"done":""}">${statusNames[status]}</li>`).join("")}</ol>`;
}
function renderServerOrder(order){
  const saved=JSON.parse(localStorage.getItem("hbeOrders")||"[]");
  if(!saved.some(item=>item.number===order.number))saved.unshift(order);
  localStorage.setItem("hbeOrders",JSON.stringify(saved.slice(0,20)));
  renderTrackedOrder(order);
}
$("#trackingForm").onsubmit=e=>{
  e.preventDefault();
  showTracking($("#trackingNumber").value);
};

/* order form -> pre-filled WhatsApp message */
$("#orderForm").onsubmit=e=>{
  e.preventDefault(); const f=e.target, v=n=>f[n].value.trim();
  if(!v("name")||!v("item")||!v("contact")){
    $("#formErr").textContent="Please fill in your name, what you'd like and how to reach you.";
    $("#formErr").hidden=false;
    (!v("name")?f.name:!v("item")?f.item:f.contact).focus();
    return;
  }
  const payment=f.querySelector("[name='payment']:checked").value;
  if(payment==="secure"&&!SITE.stripePaymentLink){
    $("#formErr").textContent="Secure online checkout is not connected yet. Choose an invoice, or add the Stripe Payment Link in config.js.";
    $("#formErr").hidden=false;
    f.querySelector("[value='invoice']").focus();
    return;
  }
  $("#formErr").hidden=true;
  const dateCode=new Date().toISOString().slice(2,10).replaceAll("-","");
  const randomCode=Math.random().toString(36).slice(2,6).toUpperCase();
  const number="HBE-"+dateCode+"-"+randomCode;
  const order={number,item:v("item"),colors:v("colors"),size:v("size"),name:v("name"),contact:v("contact"),status:"placed",created:new Date().toISOString()};
  const saved=JSON.parse(localStorage.getItem("hbeOrders")||"[]");
  saved.unshift(order);
  localStorage.setItem("hbeOrders",JSON.stringify(saved.slice(0,20)));
  fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(order)})
    .then(response=>response.ok?response.json():Promise.reject(new Error("Order API unavailable")))
    .then(serverOrder=>{
      if(serverOrder.number)$("#trackingNumber").value=serverOrder.number;
      showTracking(serverOrder.number);
    })
    .catch(()=>{showTracking(number);});
  const message=`Hi Esther! I'm ${v("name")}.\nOrder number: ${number}\nI'd like: ${v("item")}\nColours: ${v("colors")||"not sure yet"}\nSize: ${v("size")||"not sure yet"}\nContact: ${v("contact")}`;
  $("#trackingNumber").value=number;
  showTracking(number);
  if(payment==="secure"){
    const separator=SITE.stripePaymentLink.includes("?")?"&":"?";
    window.open(SITE.stripePaymentLink+separator+"client_reference_id="+encodeURIComponent(number)+"&prefilled_email="+encodeURIComponent(v("contact").includes("@")?v("contact"):""),"_blank","noopener");
  }
  window.open(wa(message),"_blank","noopener");
};

/* chat widget */
const fab=$("#chatFab"),panel=$("#chatPanel"),log=$("#chatLog");let started=false;
function add(t,who){const d=document.createElement("div");d.className="msg "+who;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight;}
function reply(q){
  const text=q.toLowerCase();let best=null,score=0;
  const orderMatch=q.match(/HBE-[A-Z0-9-]+/i);
  if(orderMatch){
    const order=getOrder(orderMatch[0]);
    if(order){
      const status=statusNames[order.status];
      setTimeout(()=>add(`Order ${order.number}\nStatus: ${status}\nItem: ${order.item}\n\nThis local demo reflects your last saved order status. Esther controls confirmed updates.`, "bot"),700);
      return;
    }
    fetch("/api/orders/"+encodeURIComponent(orderMatch[0]))
      .then(response=>response.ok?response.json():Promise.reject(new Error("not found")))
      .then(serverOrder=>setTimeout(()=>add(`Order ${serverOrder.number}\nStatus: ${statusNames[serverOrder.status]}\nItem: ${serverOrder.item}\n\nEsther's current recorded status is shown above.`, "bot"),700))
      .catch(()=>setTimeout(()=>add("I could not find that order number. Please check it and try again, or include HBE- in the message.", "bot"),700));
    return;
  }
  CHAT.answers.forEach(a=>{const s=a.keys.filter(k=>text.includes(k)).length;if(s>score){score=s;best=a}});
  const t=document.createElement("div");t.className="msg bot typing";t.setAttribute("aria-label","Typing");t.innerHTML="<i></i><i></i><i></i>";log.appendChild(t);log.scrollTop=log.scrollHeight;
  setTimeout(()=>{t.remove();add((best?best.text:CHAT.fallback).replaceAll("{c}",SITE.currency),"bot");},700+Math.random()*500);
}
function ask(q){if(!q.trim())return;add(q,"me");reply(q);}
function open(o){panel.hidden=!o;fab.setAttribute("aria-expanded",o);if(o){if(!started){started=true;add(CHAT.greeting,"bot");}$("#chatIn").focus();}else fab.focus();}
fab.onclick=()=>open(panel.hidden);$("#chatClose").onclick=()=>open(false);
panel.addEventListener("keydown",e=>{if(e.key==="Escape")open(false)});
$("#chips").innerHTML=CHAT.chips.map(c=>`<button class="chip" type="button">${c}</button>`).join("");
$("#chips").onclick=e=>{if(e.target.classList.contains("chip"))ask(e.target.textContent)};
$("#chatForm").onsubmit=e=>{e.preventDefault();ask($("#chatIn").value);$("#chatIn").value="";};

const menuToggle=$("#menuToggle"),topHeader=document.querySelector(".top");
menuToggle.onclick=()=>{
  const open=menuToggle.getAttribute("aria-expanded")==="true";
  menuToggle.setAttribute("aria-expanded",String(!open));
  menuToggle.setAttribute("aria-label",open?"Open menu":"Close menu");
  topHeader.classList.toggle("menu-open",!open);
};
$("#mainNav").addEventListener("click",e=>{
  if(e.target.matches("a")){
    menuToggle.setAttribute("aria-expanded","false");
    menuToggle.setAttribute("aria-label","Open menu");
    topHeader.classList.remove("menu-open");
  }
});

const policyText={
  content:`<h2>Content policy</h2><p>Images, branding and written content on this website belong to Hooked by Esther unless otherwise credited. Stock photography is used for presentation and may be replaced with Esther's own work.</p><p>Requests for offensive, unsafe or infringing custom designs may be declined. Finished pieces remain subject to their individual care and safety labels.</p>`,
  refund:`<h2>Refund policy</h2><p>Made-to-order and personalised pieces are prepared specifically for each customer. Esther will confirm colours, size, materials, price and estimated completion time before work begins.</p><p>Damaged or incorrect orders should be reported within 7 days of delivery with photographs. Refunds or replacements are considered when a fault is confirmed. Changes of mind, buyer colour preferences and issues disclosed before creation may not qualify for a refund.</p><p>Cancellation terms depend on work already completed and materials purchased. The final terms will be stated in your order confirmation.</p>`,
  privacy:`<h2>Privacy policy</h2><p>Order details entered on this device are used to generate and display order tracking information. A server-backed order may store the submitted name, contact, item, colours and size to fulfil the request.</p><p>The order is sent to Esther through the selected WhatsApp or email contact flow. No payment details are stored on this website. Remove locally saved demo orders by clearing this site's browser storage.</p><p>Only essential browser storage is used. No advertising or behavioural tracking cookies are loaded by this static design.</p>`
};
document.querySelectorAll("[data-policy]").forEach(button=>{
  button.onclick=()=>{
    $("#policyContent").innerHTML=policyText[button.dataset.policy];
    $("#policyDialog").showModal();
  };
});
$("#policyClose").onclick=()=>$("#policyDialog").close();
$("#policyDialog").addEventListener("click",e=>{
  if(e.target===e.currentTarget)e.currentTarget.close();
});
$("#productClose").onclick=()=>$("#productDialog").close();
$("#productDialog").addEventListener("click",e=>{
  if(e.target===e.currentTarget)e.currentTarget.close();
});
if(!localStorage.getItem("hbePrivacyChoice")){
  $("#cookieBanner").hidden=false;
}
$("#cookieAccept").onclick=()=>{
  localStorage.setItem("hbePrivacyChoice","essential");
  $("#cookieBanner").hidden=true;
};
$("#cookieDetails").onclick=()=>{
  $("#policyContent").innerHTML=policyText.privacy;
  $("#policyDialog").showModal();
};

if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  document.documentElement.classList.add("reveal-ready");
  observeReveals();
}
})();
