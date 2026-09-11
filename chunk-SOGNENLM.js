import{i as w}from"./chunk-KO6XXET6.js";import{$a as b,Ca as f,Ga as h,Pb as E,Za as s,_a as i,fb as y,gb as x,hb as v,ib as Q,kb as p,ta as g}from"./chunk-72NWBKXN.js";var M=["mapContainer"],C=class l{constructor(t){this.router=t}router;quadrants=[];singleQuadrant;mapHeight="450px";mapContainer;map;esc(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}photosHtml(t){let n=t.imagen;return n?`<img src="${this.esc(n)}" alt="Registro fotogr\xE1fico de la obra" style="width:100%; height:120px; object-fit:cover; border-radius:6px; display:block; margin-top:8px;"/>`:'<div style="margin-top:6px; font-size:0.72rem; color:#9ca3af; font-style:italic;">Sin registro fotogr\xE1fico</div>'}centerOf(t){return t&&t.lat!==void 0&&t.lng!==void 0?[t.lat,t.lng]:[-.1807,-78.4678]}ngAfterViewInit(){this.initMap()}ngOnDestroy(){this.map&&this.map.remove()}initMap(){if(typeof L>"u"){console.warn("Leaflet (L) no se ha cargado a\xFAn.");return}let t=this.mapContainer.nativeElement,n=-.1807,r=-78.4678,a=12;if(this.singleQuadrant){let e=this.centerOf(this.singleQuadrant);n=e[0],r=e[1],a=14}this.map=L.map(t,{center:[n,r],zoom:a,zoomControl:!0}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(this.map);let c=e=>{let o="#C8102E";return(e==="emerald"||e==="cumplidas")&&(o="#C8102E"),(e==="cyan"||e==="en-proceso")&&(o="#E53935"),(e==="amber"||e==="detenidas")&&(o="#D32F2F"),(e==="rose"||e==="sin-comenzar")&&(o="#9B0A20"),e==="purple"&&(o="#B71C1C"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${o};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(200, 16, 46, 0.4), 0 0 10px ${o};
        "></div>`,iconSize:[24,24],iconAnchor:[12,12]})};if(this.singleQuadrant){let e=this.centerOf(this.singleQuadrant);L.marker(e,{icon:c(this.singleQuadrant.statusColor)}).addTo(this.map).bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
          <strong style="color: #000; font-size: 0.95rem;">${this.esc(this.singleQuadrant.title)}</strong><br/>
          <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.esc(this.singleQuadrant.locationZone)}</span><br/>
          ${this.photosHtml(this.singleQuadrant)}
        </div>
      `).openPopup()}else this.quadrants.forEach(e=>{if(e.lat===void 0||e.lng===void 0)return;let o=[e.lat,e.lng],m=L.marker(o,{icon:c(e.statusColor)}).addTo(this.map),d=document.createElement("div");d.style.fontFamily="sans-serif",d.style.padding="4px",d.style.maxWidth="240px",d.innerHTML=`
            <strong style="color: #090d16; font-size: 0.95rem; display: block; margin-bottom: 2px;">${this.esc(e.title)}</strong>
            <span style="color: #4b5563; font-size: 0.8rem; display: block; margin-bottom: 6px;">Quito - ${this.esc(e.locationZone)}</span>
            ${this.photosHtml(e)}
            <br/>
            <button id="btn-map-go-${e.id}" style="
              margin-top: 8px;
              background: #C8102E;
              color: #ffffff;
              border: none;
              padding: 6px 10px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.78rem;
              font-weight: 600;
              width: 100%;
            ">Ver detalles de la obra</button>
          `,m.bindPopup(d),m.on("popupopen",()=>{let u=document.getElementById(`btn-map-go-${e.id}`);u&&(u.onclick=()=>{this.router.navigate(["/cuadrante",e.id])})})})}static \u0275fac=function(n){return new(n||l)(f(w))};static \u0275cmp=h({type:l,selectors:[["app-mapa-quito"]],viewQuery:function(n,r){if(n&1&&y(M,5),n&2){let a;x(a=v())&&(r.mapContainer=a.first)}},inputs:{quadrants:"quadrants",singleQuadrant:"singleQuadrant",mapHeight:"mapHeight"},decls:14,vars:2,consts:[["mapContainer",""],[1,"map-card-wrapper"],[1,"map-card-header"],[1,"header-title-box"],[1,"material-symbols-rounded","map-header-icon"],[1,"map-heading"],[1,"map-subheading"],[1,"location-badge"],[1,"leaflet-map-container"]],template:function(n,r){n&1&&(s(0,"div",1)(1,"div",2)(2,"div",3)(3,"span",4),p(4,"location_on"),i(),s(5,"div")(6,"h3",5),p(7,"Mapa de Geolocalizaci\xF3n de Obras - Quito, Ecuador"),i(),s(8,"p",6),p(9,"Ubicaci\xF3n de proyectos y promesas municipales en los distritos Norte, Centro y Sur de Quito."),i()()(),s(10,"span",7),p(11,"Quito - Pichincha"),i()(),b(12,"div",8,0),i()),n&2&&(g(12),Q("height",r.mapHeight))},dependencies:[E],styles:[".map-card-wrapper[_ngcontent-%COMP%]{background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:flex;flex-direction:column;box-shadow:0 10px 30px #0000004d}.map-card-header[_ngcontent-%COMP%]{padding:1.25rem 1.75rem;background:#0003;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:1rem}.header-title-box[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem}.map-header-icon[_ngcontent-%COMP%]{color:var(--accent-rose);font-size:1.8rem}.map-heading[_ngcontent-%COMP%]{font-family:var(--font-heading);font-size:1.1rem;color:#fff}.map-subheading[_ngcontent-%COMP%]{font-size:.82rem;color:var(--text-muted)}.location-badge[_ngcontent-%COMP%]{font-size:.75rem;font-weight:700;color:var(--secondary);background:#f8fafc1f;border:1px solid rgba(248,250,252,.25);padding:.3rem .75rem;border-radius:var(--radius-full)}.leaflet-map-container[_ngcontent-%COMP%]{width:100%;border-radius:0 0 var(--radius-lg) var(--radius-lg);z-index:1}  .custom-map-pin{background:transparent;border:none}"]})};export{C as a};
