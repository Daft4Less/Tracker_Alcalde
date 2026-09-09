import{i as C}from"./chunk-YSG5K4RZ.js";import{$a as h,Ca as g,Ga as b,Lb as w,Za as d,_a as a,fb as y,gb as x,hb as v,ib as Q,kb as s,ta as f}from"./chunk-LMVJACDQ.js";var M=["mapContainer"],E=class l{constructor(t){this.router=t}router;quadrants=[];singleQuadrant;mapHeight="450px";mapContainer;map;centerOf(t){return t&&t.lat!==void 0&&t.lng!==void 0?[t.lat,t.lng]:[-.1807,-78.4678]}ngAfterViewInit(){this.initMap()}ngOnDestroy(){this.map&&this.map.remove()}initMap(){if(typeof L>"u"){console.warn("Leaflet (L) no se ha cargado a\xFAn.");return}let t=this.mapContainer.nativeElement,n=-.1807,r=-78.4678,i=12;if(this.singleQuadrant){let e=this.centerOf(this.singleQuadrant);n=e[0],r=e[1],i=14}this.map=L.map(t,{center:[n,r],zoom:i,zoomControl:!0}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(this.map);let m=e=>{let o="#6366f1";return e==="emerald"&&(o="#10b981"),e==="cyan"&&(o="#06b6d4"),e==="amber"&&(o="#f59e0b"),e==="rose"&&(o="#f43f5e"),e==="purple"&&(o="#8b5cf6"),L.divIcon({className:"custom-map-pin",html:`<div style="
          background-color: ${o};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #090d16;
          box-shadow: 0 0 12px ${o};
        "></div>`,iconSize:[22,22],iconAnchor:[11,11]})};if(this.singleQuadrant){let e=this.centerOf(this.singleQuadrant);L.marker(e,{icon:m(this.singleQuadrant.statusColor)}).addTo(this.map).bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #000; font-size: 0.95rem;">${this.singleQuadrant.title}</strong><br/>
          <span style="color: #4b5563; font-size: 0.8rem;">Quito, Ecuador - ${this.singleQuadrant.locationZone}</span><br/>
          <div style="margin-top: 6px; font-weight: bold; color: #059669;">${this.singleQuadrant.value}</div>
        </div>
      `).openPopup()}else this.quadrants.forEach(e=>{if(e.lat===void 0||e.lng===void 0)return;let o=[e.lat,e.lng],c=L.marker(o,{icon:m(e.statusColor)}).addTo(this.map),p=document.createElement("div");p.style.fontFamily="sans-serif",p.style.padding="4px",p.innerHTML=`
            <strong style="color: #090d16; font-size: 0.95rem; display: block; margin-bottom: 2px;">${e.title}</strong>
            <span style="color: #4b5563; font-size: 0.8rem; display: block; margin-bottom: 6px;">Quito - ${e.locationZone}</span>
            <span style="display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: bold;">
              ${e.badgeText} (${e.progressPercentage}%)
            </span>
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
          `,c.bindPopup(p),c.on("popupopen",()=>{let u=document.getElementById(`btn-map-go-${e.id}`);u&&(u.onclick=()=>{this.router.navigate(["/cuadrante",e.id])})})})}static \u0275fac=function(n){return new(n||l)(g(C))};static \u0275cmp=b({type:l,selectors:[["app-mapa-quito"]],viewQuery:function(n,r){if(n&1&&y(M,5),n&2){let i;x(i=v())&&(r.mapContainer=i.first)}},inputs:{quadrants:"quadrants",singleQuadrant:"singleQuadrant",mapHeight:"mapHeight"},decls:14,vars:2,consts:[["mapContainer",""],[1,"map-card-wrapper"],[1,"map-card-header"],[1,"header-title-box"],[1,"material-symbols-rounded","map-header-icon"],[1,"map-heading"],[1,"map-subheading"],[1,"location-badge"],[1,"leaflet-map-container"]],template:function(n,r){n&1&&(d(0,"div",1)(1,"div",2)(2,"div",3)(3,"span",4),s(4,"location_on"),a(),d(5,"div")(6,"h3",5),s(7,"Mapa de Geolocalizaci\xF3n de Obras - Quito, Ecuador"),a(),d(8,"p",6),s(9,"Ubicaci\xF3n de proyectos y promesas municipales en los distritos Norte, Centro y Sur de Quito."),a()()(),d(10,"span",7),s(11,"Quito - Pichincha"),a()(),h(12,"div",8,0),a()),n&2&&(f(12),Q("height",r.mapHeight))},dependencies:[w],styles:[".map-card-wrapper[_ngcontent-%COMP%]{background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:flex;flex-direction:column;box-shadow:0 10px 30px #0000004d}.map-card-header[_ngcontent-%COMP%]{padding:1.25rem 1.75rem;background:#0003;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:1rem}.header-title-box[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem}.map-header-icon[_ngcontent-%COMP%]{color:var(--accent-rose);font-size:1.8rem}.map-heading[_ngcontent-%COMP%]{font-family:var(--font-heading);font-size:1.1rem;color:#fff}.map-subheading[_ngcontent-%COMP%]{font-size:.82rem;color:var(--text-muted)}.location-badge[_ngcontent-%COMP%]{font-size:.75rem;font-weight:700;color:var(--secondary);background:#06b6d41f;border:1px solid rgba(6,182,212,.25);padding:.3rem .75rem;border-radius:var(--radius-full)}.leaflet-map-container[_ngcontent-%COMP%]{width:100%;border-radius:0 0 var(--radius-lg) var(--radius-lg);z-index:1}  .custom-map-pin{background:transparent;border:none}"]})};export{E as a};
