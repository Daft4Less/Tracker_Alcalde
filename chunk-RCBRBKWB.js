import{i as k}from"./chunk-DCONWBCJ.js";import{$a as g,Ca as u,Ga as f,Ob as v,Za as s,_a as o,eb as h,fb as b,gb as y,ha as c,hb as x,jb as d,ta as l}from"./chunk-RSVH2VFL.js";var w=["mapContainer"],Q=class p{constructor(t){this.router=t}router;_quadrants=[];set quadrants(t){this._quadrants=t||[]}get quadrants(){return this._quadrants}singleQuadrant;mapHeight="450px";mapContainer;map;markerLayer;ngOnChanges(t){this.map&&(t.quadrants||t.singleQuadrant)&&(this.singleQuadrant?this.renderSingle():this.renderMarkers())}esc(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}photosHtml(t){let r=t.imagen;return r?`<img src="${this.esc(r)}" alt="Registro fotogr\xE1fico de la obra" style="width:100%; height:120px; object-fit:cover; border-radius:6px; display:block; margin-top:8px;"/>`:'<div style="margin-top:6px; font-size:0.72rem; color:#9ca3af; font-style:italic;">Sin registro fotogr\xE1fico</div>'}centerOf(t){return t&&t.lat!==void 0&&t.lng!==void 0?[t.lat,t.lng]:[-.1807,-78.4678]}ngAfterViewInit(){this.initMap()}ngOnDestroy(){this.map&&this.map.remove()}initMap(){if(typeof L>"u"){console.warn("Leaflet (L) no se ha cargado a\xFAn.");return}let t=this.mapContainer.nativeElement,r=-.1807,e=-78.4678,n=12;if(this.singleQuadrant){let a=this.centerOf(this.singleQuadrant);r=a[0],e=a[1],n=14}if(this.map=L.map(t,{center:[r,e],zoom:n,zoomControl:!0}),this.markerLayer=L.layerGroup().addTo(this.map),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(this.map),this.singleQuadrant){this.renderSingle();return}this.renderMarkers()}renderSingle(){if(!this.map||!this.markerLayer)return;let t=this.singleQuadrant;if(!t)return;this.markerLayer.clearLayers();let r=this.centerOf(t),e=a=>{let i="#C8102E";return(a==="emerald"||a==="cumplidas")&&(i="#22c55e"),(a==="cyan"||a==="en-proceso")&&(i="#0ea5e9"),(a==="amber"||a==="detenidas")&&(i="#f59e0b"),(a==="rose"||a==="sin-comenzar")&&(i="#f43f5e"),a==="purple"&&(i="#a855f7"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${i};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(200, 16, 46, 0.4), 0 0 10px ${i};
        "></div>`,iconSize:[24,24],iconAnchor:[12,12]})};L.marker(r,{icon:e(t.statusColor)}).addTo(this.markerLayer).bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
        <strong style="color: #000; font-size: 0.95rem;">${this.esc(t.title)}</strong><br/>
        <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.esc(t.locationZone)}</span><br/>
        ${this.photosHtml(t)}
      </div>
    `).openPopup(),this.map.setView(r,Math.max(14,this.map.getZoom()))}renderMarkers(){if(!this.map||!this.markerLayer)return;this.markerLayer.clearLayers();let t=e=>{let n="#C8102E";return(e==="emerald"||e==="cumplidas")&&(n="#22c55e"),(e==="cyan"||e==="en-proceso")&&(n="#0ea5e9"),(e==="amber"||e==="detenidas")&&(n="#f59e0b"),(e==="rose"||e==="sin-comenzar")&&(n="#f43f5e"),e==="purple"&&(n="#a855f7"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${n};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,iconSize:[24,24],iconAnchor:[12,12]})},r=[];this._quadrants.forEach(e=>{if(e.lat===void 0||e.lng===void 0)return;r.push([e.lat,e.lng]);let n=[e.lat,e.lng],a=L.marker(n,{icon:t(e.statusColor)}).addTo(this.markerLayer),i=document.createElement("div");i.style.fontFamily="sans-serif",i.style.padding="4px",i.style.maxWidth="240px",i.innerHTML=`
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
        `,a.bindPopup(i),a.on("popupopen",()=>{let m=document.getElementById(`btn-map-go-${e.id}`);m&&(m.onclick=()=>{this.router.navigate(["/cuadrante",e.id])})})}),r.length&&this.map.fitBounds(L.latLngBounds(r),{padding:[40,40],maxZoom:14})}static \u0275fac=function(r){return new(r||p)(u(k))};static \u0275cmp=f({type:p,selectors:[["app-mapa-quito"]],viewQuery:function(r,e){if(r&1&&h(w,5),r&2){let n;b(n=y())&&(e.mapContainer=n.first)}},inputs:{quadrants:"quadrants",singleQuadrant:"singleQuadrant",mapHeight:"mapHeight"},features:[c],decls:14,vars:2,consts:[["mapContainer",""],[1,"map-card-wrapper"],[1,"map-card-header"],[1,"header-title-box"],[1,"material-symbols-rounded","map-header-icon"],[1,"map-heading"],[1,"map-subheading"],[1,"location-badge"],[1,"leaflet-map-container"]],template:function(r,e){r&1&&(s(0,"div",1)(1,"div",2)(2,"div",3)(3,"span",4),d(4,"location_on"),o(),s(5,"div")(6,"h3",5),d(7,"Mapa de Geolocalizaci\xF3n de Obras - Quito, Ecuador"),o(),s(8,"p",6),d(9,"Ubicaci\xF3n de proyectos y promesas municipales en los distritos Norte, Centro y Sur de Quito."),o()()(),s(10,"span",7),d(11,"Quito - Pichincha"),o()(),g(12,"div",8,0),o()),r&2&&(l(12),x("height",e.mapHeight))},dependencies:[v],styles:[".map-card-wrapper[_ngcontent-%COMP%]{background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:flex;flex-direction:column;box-shadow:0 10px 30px #0000004d}.map-card-header[_ngcontent-%COMP%]{padding:1.25rem 1.75rem;background:#0003;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:1rem}.header-title-box[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem}.map-header-icon[_ngcontent-%COMP%]{color:var(--accent-rose);font-size:1.8rem}.map-heading[_ngcontent-%COMP%]{font-family:var(--font-heading);font-size:1.1rem;color:#fff}.map-subheading[_ngcontent-%COMP%]{font-size:.82rem;color:var(--text-muted)}.location-badge[_ngcontent-%COMP%]{font-size:.75rem;font-weight:700;color:var(--secondary);background:#f8fafc1f;border:1px solid rgba(248,250,252,.25);padding:.3rem .75rem;border-radius:var(--radius-full)}.leaflet-map-container[_ngcontent-%COMP%]{width:100%;border-radius:0 0 var(--radius-lg) var(--radius-lg);z-index:1}  .custom-map-pin{background:transparent;border:none}"]})};export{Q as a};
