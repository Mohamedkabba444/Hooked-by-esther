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
  const id="p"+i, a=p.a||"#f2eee4", b=p.b||"#b85f45", pattern=p.pattern||"granny", pats={
    v:`<path d="M0 6l7 8 7-8M0 20l7 8 7-8" fill="none" stroke="${b}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    granny:`<circle cx="10" cy="10" r="6" fill="none" stroke="${b}" stroke-width="3"/><circle cx="10" cy="10" r="1.5" fill="${b}"/>`,
    rib:`<path d="M5 0v20M15 0v20" stroke="${b}" stroke-width="4" stroke-linecap="round" opacity=".85"/>`,
    mesh:`<path d="M0 10h20M10 0v20" stroke="${b}" stroke-width="2.5"/><circle cx="10" cy="10" r="3" fill="${b}"/>`};
  const size=pattern==="v"?"14 28":"20 20";
  return `<svg class="art" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Decorative yarn pattern for ${p.name}."><defs><pattern id="${id}" width="${size.split(" ")[0]}" height="${size.split(" ")[1]}" patternUnits="userSpaceOnUse">${pats[pattern]||pats.granny}</pattern></defs><rect width="320" height="240" fill="${a}"/><rect width="320" height="240" fill="url(#${id})"/></svg>`;
}
const photo=(p,i)=>`<img class="art" src="${p.photo}" alt="${p.alt||p.name}" data-product-index="${i}" loading="lazy">`;
function addImageFallback(image,index=-1){
  image.addEventListener("error",()=>{
    const product=PRODUCTS[index]||{name:"Handmade crochet"};
    image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(art(product,index<0?0:index));
  },{once:true});
}
document.querySelectorAll("img[src^='assets/']").forEach(image=>{
  addImageFallback(image,image.hasAttribute("data-product-index")?Number(image.dataset.productIndex):-1);
});

/* shop */
const cats=["All",...new Set(PRODUCTS.map(p=>p.cat))];
function show(cat){
  $("#products").innerHTML=PRODUCTS.map((p,i)=>({p,i})).filter(o=>cat==="All"||o.p.cat===cat).map(({p,i})=>`
  <article class="prod reveal">${p.photo?photo(p,i):art(p,i)}<div class="body"><h3>${p.name}</h3><p>${p.desc}</p><p class="mat">Materials: ${p.materials}</p>
  <div class="price"><span>${typeof p.price==="number"?SITE.currency+p.price:"from "+SITE.currency+String(p.price).replace("from ","")}<small> sample price</small></span><div class="prod-actions"><button class="detail-button" type="button" data-detail="${i}">Details</button><a class="btn btn-sm" href="#order" data-item="${p.name}">Order</a></div></div></div></article>`).join("");
  $("#products").querySelectorAll("img[data-product-index]").forEach(image=>addImageFallback(image,Number(image.dataset.productIndex)));
  document.querySelectorAll("[data-item]").forEach((a,index)=>{
    a.style.setProperty("--reveal-delay",`${Math.min(index,3)*70}ms`);
    a.onclick=()=>{
      $("#f-piece").value=a.dataset.item;
      $("#f-piece").dispatchEvent(new Event("change"));
      $("#f-item").value="I'd like a custom "+a.dataset.item+". ";
      $("#selectedChoiceText").textContent=a.dataset.item+" selected";
      $("#selectedChoice").hidden=false;
      $("#order").scrollIntoView({behavior:"smooth",block:"start"});
      setTimeout(()=>$("#colorSwatches .swatch").focus({preventScroll:true}),650);
    };
  });
  document.querySelectorAll("[data-detail]").forEach(button=>{
    button.onclick=()=>{
      const productIndex=Number(button.dataset.detail), p=PRODUCTS[productIndex];
      $("#productContent").innerHTML=`<div class="product-layout"><img src="${p.photo}" alt="${p.alt||p.name}" data-product-index="${productIndex}" width="800" height="800"><div class="product-info"><p class="eyebrow">${p.cat}</p><h2>${p.name}</h2><p>${p.desc}</p><dl><dt>Fibre</dt><dd>${p.fibre}</dd><dt>Size</dt><dd>${p.size}</dd><dt>Care</dt><dd>${p.care}</dd><dt>Allergens</dt><dd>${p.allergens}</dd></dl><a class="btn" href="#order" data-modal-order="${p.name}">Choose this piece</a></div></div>`;
      addImageFallback($("#productContent img"),productIndex);
      $("#productDialog").showModal();
      document.querySelector("[data-modal-order]").onclick=()=>{
        $("#productDialog").close();
        $("#f-piece").value=p.name;
        $("#f-piece").dispatchEvent(new Event("change"));
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
$("#reviewLink").href=wa("Hi Esther, I'd love to leave a review about a piece I've ordered.\n\nMy review:\n");
$("#reviewLink").target="_blank";
$("#reviewLink").rel="noopener";
[$("#fIg"),$("#fFb")].forEach(a=>{a.target="_blank";a.rel="noopener"});

$("#clearChoice").onclick=()=>{
  $("#selectedChoice").hidden=true;
  $("#selectedChoiceText").textContent="";
  $("#f-item").value="";
  $("#f-piece").value="";
  updateEstimate();
  $("#f-item").focus();
};

/* Custom order builder */
const pieceSelect=$("#f-piece"), sizeSelect=$("#f-size"), selectedColors=new Set();
pieceSelect.innerHTML+=[...PRODUCTS].map(p=>`<option value="${p.name}">${p.name}</option>`).join("");
$("#colorSwatches").innerHTML=ORDER_SWATCHES.map(color=>`<button class="swatch" type="button" aria-label="${color.name}" aria-pressed="false" title="${color.name}" style="--swatch-color:${color.color}"></button>`).join("");
$("#colorSwatches").onclick=e=>{
  const button=e.target.closest(".swatch");
  if(!button)return;
  const color=ORDER_SWATCHES.find(item=>item.name===button.getAttribute("aria-label"));
  if(selectedColors.has(color.name)){
    selectedColors.delete(color.name);
    button.setAttribute("aria-pressed","false");
  }else{
    selectedColors.add(color.name);
    button.setAttribute("aria-pressed","true");
  }
  $("#f-colors").value=[...selectedColors].join(", ");
  $("#swatchSelection").textContent=selectedColors.size?[...selectedColors].join(", "):"No colours selected yet.";
};
function updateEstimate(){
  const product=PRODUCTS.find(p=>p.name===pieceSelect.value);
  if(!product){
    $("#orderEstimate").textContent="Choose a piece to see an estimated price and making time.";
    return;
  }
  const size=ORDER_SIZES.find(option=>option.name===sizeSelect.value)||ORDER_SIZES[1];
  const basePrice=parseFloat(String(product.price).replace(/[^\d.]/g,""));
  const range=product.cat==="Blankets"?[2,3]:[1,2];
  const minWeeks=range[0]+size.extraWeeks, maxWeeks=range[1]+size.extraWeeks;
  const isStartingPrice=String(product.price).startsWith("from ");
  const estimatedPrice=Math.round(basePrice*size.multiplier);
  const amount=isStartingPrice?Math.max(basePrice,estimatedPrice):estimatedPrice;
  $("#orderEstimate").textContent=`Estimated ${isStartingPrice?"from":"about"} ${SITE.currency}${amount} · about ${minWeeks}–${maxWeeks} weeks to make. Esther will confirm the final price and timing.`;
}
pieceSelect.onchange=()=>{
  const product=PRODUCTS.find(p=>p.name===pieceSelect.value);
  if(product){
    $("#selectedChoiceText").textContent=product.name+" selected";
    $("#selectedChoice").hidden=false;
    if(!$("#f-item").value.trim()||$("#f-item").value.startsWith("I'd like a custom ")){
      $("#f-item").value="I'd like a custom "+product.name+". ";
    }
  }else{
    $("#selectedChoice").hidden=true;
    $("#selectedChoiceText").textContent="";
  }
  updateEstimate();
};
sizeSelect.onchange=updateEstimate;

const photoInput=$("#f-photo");let photoPreviewUrl="";
photoInput.onchange=()=>{
  const file=photoInput.files[0];
  if(!file){
    if(photoPreviewUrl)URL.revokeObjectURL(photoPreviewUrl);
    photoPreviewUrl="";
    $("#photoPreview").hidden=true;
    $("#photoPreviewImage").removeAttribute("src");
    return;
  }
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){
    $("#formErr").textContent="Choose a JPG, PNG or WebP image no larger than 5 MB.";
    $("#formErr").hidden=false;
    photoInput.value="";
    if(photoPreviewUrl)URL.revokeObjectURL(photoPreviewUrl);
    photoPreviewUrl="";
    $("#photoPreview").hidden=true;
    $("#photoPreviewImage").removeAttribute("src");
    return;
  }
  $("#formErr").hidden=true;
  if(photoPreviewUrl)URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl=URL.createObjectURL(file);
  $("#photoPreviewImage").src=photoPreviewUrl;
  $("#photoPreview").hidden=false;
};
$("#removePhoto").onclick=()=>{
  photoInput.value="";
  if(photoPreviewUrl)URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl="";
  $("#photoPreview").hidden=true;
  $("#photoPreviewImage").removeAttribute("src");
};
function readPhoto(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(new Error("The selected photo could not be read."));
    reader.readAsDataURL(file);
  });
}

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
  e.preventDefault(); const f=e.target, field=n=>f.elements.namedItem(n), v=n=>field(n).value.trim();
  if(!v("name")||!v("item")||!v("contact")||!v("piece")){
    $("#formErr").textContent="Please fill in your name, choose a piece, describe your request and add contact details.";
    $("#formErr").hidden=false;
    (!v("name")?$("#f-name"):!v("piece")?$("#f-piece"):!v("item")?$("#f-item"):$("#f-contact")).focus();
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
  const file=photoInput.files[0];
  const whatsappTab=window.open("about:blank","_blank");
  const submitButton=f.querySelector("[type='submit']");
  submitButton.disabled=true;
  submitButton.textContent="Sending request...";
  (async()=>{
    try{
      const order={
        number,item:v("item"),piece:v("piece"),colors:v("colors"),size:v("size"),
        name:v("name"),contact:v("contact"),payment,fulfillment:f.querySelector("[name='fulfillment']:checked").value,
        location:v("location"),estimate:$("#orderEstimate").textContent,status:"placed",created:new Date().toISOString()
      };
      if(file)order.imageData=await readPhoto(file);
      let savedOrder;
      try{
        const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(order)});
        if(!response.ok){
          let reason="";
          try{reason=(await response.json()).error||"";}catch{}
          throw new Error(reason||"The order could not be saved.");
        }
        savedOrder=await response.json();
      }catch(error){
        if(file)throw new Error(error.message||"The photo could not be sent. Please try again.");
        savedOrder={...order,number};
      }
      const saved=JSON.parse(localStorage.getItem("hbeOrders")||"[]");
      saved.unshift(savedOrder);
      localStorage.setItem("hbeOrders",JSON.stringify(saved.slice(0,20)));
      $("#trackingNumber").value=savedOrder.number;
      showTracking(savedOrder.number);
      const photoLink=savedOrder.imageUrl?`\nInspiration photo: ${new URL(savedOrder.imageUrl,location.href).href}`:"";
      const message=`Hi Esther! I'm ${v("name")}.\nOrder number: ${savedOrder.number}\nPiece: ${v("piece")}\nDetails: ${v("item")}\nColours: ${v("colors")||"not sure yet"}\nSize: ${v("size")}\n${$("#orderEstimate").textContent}\nPayment: ${payment==="invoice"?"invoice after confirmation":"secure online checkout"}\nPickup / delivery: ${f.querySelector("[name='fulfillment']:checked").value}${v("location")?" — "+v("location"):""}\nContact: ${v("contact")}${photoLink}`;
      if(whatsappTab)whatsappTab.location.href=wa(message);
      else{
        $("#formErr").textContent="Your request was saved. Pop-ups are blocked, so use the WhatsApp button to send your order details.";
        $("#formErr").hidden=false;
      }
      if(payment==="secure"){
        const separator=SITE.stripePaymentLink.includes("?")?"&":"?";
        window.open(SITE.stripePaymentLink+separator+"client_reference_id="+encodeURIComponent(savedOrder.number)+"&prefilled_email="+encodeURIComponent(v("contact").includes("@")?v("contact"):""),"_blank","noopener");
      }
    }catch(error){
      if(whatsappTab)whatsappTab.close();
      $("#formErr").textContent=file
        ?`${error.message} Your photo has not been sent; please retry or contact Esther on WhatsApp.`
        :error.message;
      $("#formErr").hidden=false;
    }finally{
      submitButton.disabled=false;
      submitButton.textContent="Place order request";
    }
  })();
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
function setMenuOpen(isOpen,restoreFocus=false){
  menuToggle.setAttribute("aria-expanded",String(isOpen));
  menuToggle.setAttribute("aria-label",isOpen?"Close menu":"Open menu");
  $(".menu-label").textContent=isOpen?"Close":"Menu";
  topHeader.classList.toggle("menu-open",isOpen);
  if(isOpen)$("#mainNav").querySelector("a").focus();
  else if(restoreFocus)menuToggle.focus();
}
menuToggle.onclick=()=>setMenuOpen(menuToggle.getAttribute("aria-expanded")!=="true");
$("#mainNav").addEventListener("click",e=>{
  if(e.target.closest("a"))setMenuOpen(false);
});
document.addEventListener("click",e=>{
  if(menuToggle.getAttribute("aria-expanded")==="true"&&!topHeader.contains(e.target))setMenuOpen(false);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&menuToggle.getAttribute("aria-expanded")==="true")setMenuOpen(false,true);
});

const policyText={
  content:`<h2>Content policy</h2><p>Images, branding and written content on this website belong to Hooked by Esther unless otherwise credited. Stock photography is used for presentation and may be replaced with Esther's own work.</p><p>Requests for offensive, unsafe or infringing custom designs may be declined. Finished pieces remain subject to their individual care and safety labels.</p>`,
  refund:`<h2>Refund policy</h2><p>Made-to-order and personalised pieces are prepared specifically for each customer. Esther will confirm colours, size, materials, price and estimated completion time before work begins.</p><p>Damaged or incorrect orders should be reported within 7 days of delivery with photographs. Refunds or replacements are considered when a fault is confirmed. Changes of mind, buyer colour preferences and issues disclosed before creation may not qualify for a refund.</p><p>Cancellation terms depend on work already completed and materials purchased. The final terms will be stated in your order confirmation.</p>`,
  privacy:`<h2>Privacy policy</h2><p>Order details entered on this device are used to generate and display order tracking information. A server-backed order may store the submitted name, contact, item, colours, size, delivery preference and inspiration photo to fulfil the request.</p><p>Uploaded photos are stored on the order server and shared with Esther as a link in the WhatsApp order message. Anyone with that link may be able to view the photo, so do not upload sensitive images. No payment details are stored on this website. Remove locally saved demo orders by clearing this site's browser storage.</p><p>Only essential browser storage is used. No advertising or behavioural tracking cookies are loaded by this static design.</p>`
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
