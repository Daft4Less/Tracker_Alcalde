import{i as Q}from"./chunk-KO6XXET6.js";import{$a as f,Ca as u,Ga as g,Pb as v,Za as d,_a as o,fb as h,gb as b,ha as c,hb as y,ib as x,kb as s,ta as l}from"./chunk-72NWBKXN.js";var k=["mapContainer"],E=class m{constructor(t){this.router=t}router;_quadrants=[];set quadrants(t){this._quadrants=t||[]}get quadrants(){return this._quadrants}singleQuadrant;mapHeight="450px";mapContainer;map;markerLayer;ngOnChanges(t){this.map&&(t.quadrants||t.singleQuadrant)&&this.renderMarkers()}esc(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}photosHtml(t){let r=t.imagen;return r?`<img src="${this.esc(r)}" alt="Registro fotogr\xE1fico de la obra" style="width:100%; height:120px; object-fit:cover; border-radius:6px; display:block; margin-top:8px;"/>`:'<div style="margin-top:6px; font-size:0.72rem; color:#9ca3af; font-style:italic;">Sin registro fotogr\xE1fico</div>'}centerOf(t){return t&&t.lat!==void 0&&t.lng!==void 0?[t.lat,t.lng]:[-.1807,-78.4678]}ngAfterViewInit(){this.initMap()}ngOnDestroy(){this.map&&this.map.remove()}initMap(){if(typeof L>"u"){console.warn("Leaflet (L) no se ha cargado a\xFAn.");return}let t=this.mapContainer.nativeElement,r=-.1807,e=-78.4678,a=12;if(this.singleQuadrant){let n=this.centerOf(this.singleQuadrant);r=n[0],e=n[1],a=14}this.map=L.map(t,{center:[r,e],zoom:a,zoomControl:!0}),this.markerLayer=L.layerGroup().addTo(this.map),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(this.map);let p=n=>{let i="#C8102E";return(n==="emerald"||n==="cumplidas")&&(i="#C8102E"),(n==="cyan"||n==="en-proceso")&&(i="#E53935"),(n==="amber"||n==="detenidas")&&(i="#D32F2F"),(n==="rose"||n==="sin-comenzar")&&(i="#9B0A20"),n==="purple"&&(i="#B71C1C"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${i};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(200, 16, 46, 0.4), 0 0 10px ${i};
        "></div>`,iconSize:[24,24],iconAnchor:[12,12]})};if(this.singleQuadrant){let n=this.centerOf(this.singleQuadrant);L.marker(n,{icon:p(this.singleQuadrant.statusColor)}).addTo(this.map).bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
          <strong style="color: #000; font-size: 0.95rem;">${this.esc(this.singleQuadrant.title)}</strong><br/>
          <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.esc(this.singleQuadrant.locationZone)}</span><br/>
          ${this.photosHtml(this.singleQuadrant)}
        </div>
      `).openPopup();return}this.renderMarkers()}renderMarkers(){if(!this.map||!this.markerLayer)return;this.markerLayer.clearLayers();let t=e=>{let a="#C8102E";return(e==="emerald"||e==="cumplidas")&&(a="#22c55e"),(e==="cyan"||e==="en-proceso")&&(a="#0ea5e9"),(e==="amber"||e==="detenidas")&&(a="#f59e0b"),(e==="rose"||e==="sin-comenzar")&&(a="#f43f5e"),e==="purple"&&(a="#a855f7"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${a};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,iconSize:[24,24],iconAnchor:[12,12]})},r=[];this._quadrants.forEach(e=>{if(e.lat===void 0||e.lng===void 0)return;r.push([e.lat,e.lng]);let a=[e.lat,e.lng],p=L.marker(a,{icon:t(e.statusColor)}).addTo(this.markerLayer),n=document.createElement("div");n.style.fontFamily="sans-serif",n.style.padding="4px",n.style.maxWidth="240px",n.innerHTML=`
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
        `,p.bindPopup(n),p.on("popupopen",()=>{let i=document.getElementById(`btn-map-go-${e.id}`);i&&(i.onclick=()=>{this.router.navigate(["/cuadrante",e.id])})})}),r.length&&this.map.fitBounds(L.latLngBounds(r),{padding:[40,40],maxZoom:14})}static \u0275fac=function(r){return new(r||m)(u(Q))};static \u0275cmp=g({type:m,selectors:[["app-mapa-quito"]],viewQuery:function(r,e){if(r&1&&h(k,5),r&2){let a;b(a=y())&&(e.mapContainer=a.first)}},inputs:{quadrants:"quadrants",singleQuadrant:"singleQuadrant",mapHeight:"mapHeight"},features:[c],decls:14,vars:2,consts:[["mapContainer",""],[1,"map-card-wrapper"],[1,"map-card-header"],[1,"header-title-box"],[1,"material-symbols-rounded","map-header-icon"],[1,"map-heading"],[1,"map-subheading"],[1,"location-badge"],[1,"leaflet-map-container"]],template:function(r,e){r&1&&(d(0,"div",1)(1,"div",2)(2,"div",3)(3,"span",4),s(4,"location_on"),o(),d(5,"div")(6,"h3",5),s(7,"Mapa de Geolocalizaci\xF3n de Obras - Quito, Ecuador"),o(),d(8,"p",6),s(9,"Ubicaci\xF3n de proyectos y promesas municipales en los distritos Norte, Centro y Sur de Quito."),o()()(),d(10,"span",7),s(11,"Quito - Pichincha"),o()(),f(12,"div",8,0),o()),r&2&&(l(12),x("height",e.mapHeight))},dependencies:[v],styles:[".map-card-wrapper[_ngcontent-%COMP%]{background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:flex;flex-direction:column;box-shadow:0 10px 30px #0000004d}.map-card-header[_ngcontent-%COMP%]{padding:1.25rem 1.75rem;background:#0003;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:1rem}.header-title-box[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem}.map-header-icon[_ngcontent-%COMP%]{color:var(--accent-rose);font-size:1.8rem}.map-heading[_ngcontent-%COMP%]{font-family:var(--font-heading);font-size:1.1rem;color:#fff}.map-subheading[_ngcontent-%COMP%]{font-size:.82rem;color:var(--text-muted)}.location-badge[_ngcontent-%COMP%]{font-size:.75rem;font-weight:700;color:var(--secondary);background:#f8fafc1f;border:1px solid rgba(248,250,252,.25);padding:.3rem .75rem;border-radius:var(--radius-full)}.leaflet-map-container[_ngcontent-%COMP%]{width:100%;border-radius:0 0 var(--radius-lg) var(--radius-lg);z-index:1}  .custom-map-pin{background:transparent;border:none}"]})};export{E as a};
