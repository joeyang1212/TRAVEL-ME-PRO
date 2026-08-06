"use client";

import type { RouteStop } from "../../data/nz/routeStops";

type DayRouteMapProps = {
  day: number;
  stops: RouteStop[];
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] || char));
}

export function DayRouteMap({ day, stops }: DayRouteMapProps) {
  const visibleStops = stops
    .filter((stop) => stop.day === day)
    .sort((a, b) => a.order - b.order);

  const mapData = JSON.stringify(visibleStops).replace(/</g, "\\u003c");
  const srcDoc = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
html,body,#map{height:100%;margin:0}.leaflet-container{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.number-marker{width:32px;height:32px;border-radius:50%;background:#0f766e;color:white;border:3px solid white;box-shadow:0 2px 8px #0005;display:grid;place-items:center;font-weight:800}
.popup h3{margin:0 0 4px;font-size:16px}.popup p{margin:0 0 8px;color:#60706d}.popup a{display:inline-block;color:#0f766e;font-weight:700;text-decoration:none}
</style></head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const stops=${mapData};
const map=L.map('map',{scrollWheelZoom:false});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
if(stops.length){
 const latlngs=stops.map(s=>[s.lat,s.lng]);
 L.polyline(latlngs,{color:'#0f766e',weight:4,opacity:.8,dashArray:'8 8'}).addTo(map);
 stops.forEach((s,i)=>{
   const icon=L.divIcon({className:'',html:'<div class="number-marker">'+(i+1)+'</div>',iconSize:[32,32],iconAnchor:[16,16]});
   const title=${JSON.stringify("Day ")}+${day}+' · '+(i+1)+'. '+s.name;
   const subtitle=s.subtitle?'<p>'+s.subtitle+'</p>':'';
   const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.lat+','+s.lng);
   L.marker([s.lat,s.lng],{icon}).addTo(map).bindPopup('<div class="popup"><h3>'+title+'</h3>'+subtitle+'<a target="_blank" rel="noreferrer" href="'+maps+'">開啟 Google Maps</a></div>');
 });
 map.fitBounds(latlngs,{padding:[34,34],maxZoom:12});
}else{map.setView([-41.2,174.7],5)}
</script></body></html>`;

  return (
    <section className="mapPanel dayRouteMapPanel">
      <div className="sectionHead">
        <div>
          <h2>📍 Day {day} 完整行程地圖</h2>
          <p>依當日順序顯示每個行程點，編號與路線同步。</p>
        </div>
        <span>{visibleStops.length} 個行程點</span>
      </div>

      <iframe
        title={`Day ${day} 完整行程地圖`}
        srcDoc={srcDoc}
        loading="lazy"
        style={{ width: "100%", height: 520, border: 0, borderRadius: 18 }}
      />

      <div className="routeStopList">
        {visibleStops.map((stop, index) => (
          <a
            key={`${stop.day}-${stop.order}-${stop.name}`}
            href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <b>{index + 1}</b>
            <span><strong>{escapeHtml(stop.name)}</strong>{stop.subtitle && <small>{escapeHtml(stop.subtitle)}</small>}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
