import{i as C}from"./chunk-YSG5K4RZ.js";import{$a as b,Ca as f,Ga as h,Lb as w,Za as p,_a as a,fb as y,gb as x,hb as v,ib as Q,kb as l,ta as g}from"./chunk-LMVJACDQ.js";var k=["mapContainer"],E=class c{constructor(t){this.router=t}router;quadrants=[];singleQuadrant;mapHeight="450px";mapContainer;map;esc(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}photosHtml(t){let n=t.imagenAntes,o=t.imagenDespues,r=(e,i)=>`
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.68rem; color:#6b7280; font-weight:700; margin-bottom:2px;">${i}</div>
          <img src="${this.esc(e)}" alt="${i}" style="width:100%; height:64px; object-fit:cover; border-radius:6px; display:block;"/>
        </div>`,s=[n?r(n,"Antes"):"",o?r(o,"Despu\xE9s"):""].join("");return s?`<div style="display:flex; gap:6px; margin-top:8px;">${s}</div>`:'<div style="margin-top:6px; font-size:0.72rem; color:#9ca3af; font-style:italic;">Sin registro fotogr\xE1fico</div>'}centerOf(t){return t&&t.lat!==void 0&&t.lng!==void 0?[t.lat,t.lng]:[-.1807,-78.4678]}ngAfterViewInit(){this.initMap()}ngOnDestroy(){this.map&&this.map.remove()}initMap(){if(typeof L>"u"){console.warn("Leaflet (L) no se ha cargado a\xFAn.");return}let t=this.mapContainer.nativeElement,n=-.1807,o=-78.4678,r=12;if(this.singleQuadrant){let e=this.centerOf(this.singleQuadrant);n=e[0],o=e[1],r=14}this.map=L.map(t,{center:[n,o],zoom:r,zoomControl:!0}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(this.map);let s=e=>{let i="#6366f1";return e==="emerald"&&(i="#10b981"),e==="cyan"&&(i="#06b6d4"),e==="amber"&&(i="#f59e0b"),e==="rose"&&(i="#f43f5e"),e==="purple"&&(i="#8b5cf6"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${i};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #090d16;
          box-shadow: 0 0 12px ${i};
        "></div>`,iconSize:[22,22],iconAnchor:[11,11]})};if(this.singleQuadrant){let e=this.centerOf(this.singleQuadrant);L.marker(e,{icon:s(this.singleQuadrant.statusColor)}).addTo(this.map).bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
          <strong style="color: #000; font-size: 0.95rem;">${this.esc(this.singleQuadrant.title)}</strong><br/>
          <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.esc(this.singleQuadrant.locationZone)}</span><br/>
          <div style="margin-top: 6px; font-weight: bold; color: #059669;">${this.esc(this.singleQuadrant.value)}</div>
          ${this.photosHtml(this.singleQuadrant)}
        </div>
      `).openPopup()}else this.quadrants.forEach(e=>{if(e.lat===void 0||e.lng===void 0)return;let i=[e.lat,e.lng],m=L.marker(i,{icon:s(e.statusColor)}).addTo(this.map),d=document.createElement("div");d.style.fontFamily="sans-serif",d.style.padding="4px",d.style.maxWidth="240px",d.innerHTML=`
            <strong style="color: #090d16; font-size: 0.95rem; display: block; margin-bottom: 2px;">${this.esc(e.title)}</strong>
            <span style="color: #4b5563; font-size: 0.8rem; display: block; margin-bottom: 6px;">Quito - ${this.esc(e.locationZone)}</span>
            <span style="display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: bold;">
              ${this.esc(e.badgeText)} (${e.progressPercentage}%)
            </span>
            ${this.photosHtml(e)}
            <br/>
            <button id="btn-map-go-${e.id}" style="
              margin-top: 8px;
              background: #6366f1;
              color: #ffffff;
              border: none;
              padding: 4px 10px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.78rem;
              font-weight: 600;
              width: 100%;
            ">Ver detalles de la obra</button>
          `,m.bindPopup(d),m.on("popupopen",()=>{let u=document.getElementById(`btn-map-go-${e.id}`);u&&(u.onclick=()=>{this.router.navigate(["/cuadrante",e.id])})})})}static \u0275fac=function(n){return new(n||c)(f(C))};static \u0275cmp=h({type:c,selectors:[["app-mapa-quito"]],viewQuery:function(n,o){if(n&1&&y(k,5),n&2){let r;x(r=v())&&(o.mapContainer=r.first)}},inputs:{quadrants:"quadrants",singleQuadrant:"singleQuadrant",mapHeight:"mapHeight"},decls:14,vars:2,consts:[["mapContainer",""],[1,"map-card-wrapper"],[1,"map-card-header"],[1,"header-title-box"],[1,"material-symbols-rounded","map-header-icon"],[1,"map-heading"],[1,"map-subheading"],[1,"location-badge"],[1,"leaflet-map-container"]],template:function(n,o){n&1&&(p(0,"div",1)(1,"div",2)(2,"div",3)(3,"span",4),l(4,"location_on"),a(),p(5,"div")(6,"h3",5),l(7,"Mapa de Geolocalizaci\xF3n de Obras - Quito, Ecuador"),a(),p(8,"p",6),l(9,"Ubicaci\xF3n de proyectos y promesas municipales en los distritos Norte, Centro y Sur de Quito."),a()()(),p(10,"span",7),l(11,"Quito - Pichincha"),a()(),b(12,"div",8,0),a()),n&2&&(g(12),Q("height",o.mapHeight))},dependencies:[w],styles:[".map-card-wrapper[_ngcontent-%COMP%]{background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:flex;flex-direction:column;box-shadow:0 10px 30px #0000004d}.map-card-header[_ngcontent-%COMP%]{padding:1.25rem 1.75rem;background:#0003;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:1rem}.header-title-box[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem}.map-header-icon[_ngcontent-%COMP%]{color:var(--accent-rose);font-size:1.8rem}.map-heading[_ngcontent-%COMP%]{font-family:var(--font-heading);font-size:1.1rem;color:#fff}.map-subheading[_ngcontent-%COMP%]{font-size:.82rem;color:var(--text-muted)}.location-badge[_ngcontent-%COMP%]{font-size:.75rem;font-weight:700;color:var(--secondary);background:#06b6d41f;border:1px solid rgba(6,182,212,.25);padding:.3rem .75rem;border-radius:var(--radius-full)}.leaflet-map-container[_ngcontent-%COMP%]{width:100%;border-radius:0 0 var(--radius-lg) var(--radius-lg);z-index:1}  .custom-map-pin{background:transparent;border:none}"]})};export{E as a};
