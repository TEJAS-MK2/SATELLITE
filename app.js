const API='https://osirisai.live/api';
const state={satellites:[],earthquakes:[],flights:[],stats:null};
const $=id=>document.getElementById(id);

const map=new maplibregl.Map({container:'map',style:{version:8,sources:{carto:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png','https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap © CARTO'}},layers:[{id:'background',type:'background',paint:{'background-color':'#05070b'}},{id:'carto',type:'raster',source:'carto',paint:{'raster-opacity':.82}}],projection:{type:'globe'}},center:[0,20],zoom:1.45,dragRotate:true,renderWorldCopies:false});
map.addControl(new maplibregl.NavigationControl({showCompass:true}), 'bottom-right');

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function setConnection(ok){$('connection').textContent=ok?'LIVE':'OFFLINE';$('apiState').textContent=ok?'LIVE DATA':'API UNAVAILABLE'}
function asArray(data,keys=[]){if(Array.isArray(data))return data;for(const k of keys)if(Array.isArray(data?.[k]))return data[k];return []}
function coords(o){const lat=Number(o.latitude??o.lat??o.sat_lat??o.latitude_deg),lon=Number(o.longitude??o.lon??o.lng??o.sat_lon??o.longitude_deg);return Number.isFinite(lat)&&Number.isFinite(lon)?[lon,lat]:null}
function clearLayer(id){if(map.getLayer(id))map.removeLayer(id);if(map.getSource(id))map.removeSource(id)}
function addPoints(id,items,color,click){clearLayer(id);const features=items.map((o,i)=>{const c=coords(o);return c?{type:'Feature',geometry:{type:'Point',coordinates:c},properties:{...o,_i:i}}:null}).filter(Boolean);map.addSource(id,{type:'geojson',data:{type:'FeatureCollection',features}});map.addLayer({id,type:'circle',source:id,paint:{'circle-radius':['interpolate',['linear'],['zoom'],1,2.5,4,4.5,8,6],'circle-color':color,'circle-opacity':.88,'circle-stroke-width':1,'circle-stroke-color':'#ffffff','circle-stroke-opacity':.35}});map.on('click',id,e=>{const p=e.features?.[0]?.properties||{};click(p)});map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',id,()=>map.getCanvas().style.cursor='')}
function objectDetail(p,type){let title=p.name||p.satellite_name||p.callsign||p.icao24||type.toUpperCase();let rows=[];if(type==='satellite'){rows=[['NORAD',p.norad_id??p.noradId??'—'],['LAT',p.latitude??p.lat??'—'],['LON',p.longitude??p.lon??'—'],['ALT',p.altitude??p.alt_km??'—'],['TYPE',p.type??p.object_type??'—']]}else if(type==='earthquake'){rows=[['MAG',p.magnitude??p.mag??'—'],['DEPTH',p.depth??p.depth_km??'—'],['PLACE',p.place??p.location??'—']]}else{rows=[['CALLSIGN',p.callsign??'—'],['ALT',p.altitude??'—'],['SPEED',p.velocity??p.speed??'—'],['HEADING',p.heading??'—']]};$('detailCard').innerHTML='<div class="card-kicker">SELECTED OBJECT</div><h2>'+escapeHtml(title)+'</h2>'+rows.map(r=>'<p style="margin:7px 0;color:#9baab4"><span style="color:#596873;font-size:8px;letter-spacing:.12em">'+escapeHtml(r[0])+'</span><br>'+escapeHtml(String(r[1]))+'</p>').join('')}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

async function get(path){const r=await fetch(API+path,{cache:'no-store'});if(!r.ok)throw new Error(path+' '+r.status);return r.json()}
async function load(){
  $('apiState').textContent='FETCHING…';
  try{
    const [stats,sats,quakes,flights]=await Promise.all([get('/stats'),get('/satellites'),get('/earthquakes'),get('/flights')]);
    state.stats=stats?.stats||stats; state.satellites=asArray(sats,['satellites','objects']); state.earthquakes=asArray(quakes,['earthquakes','events']);
    const f=flights?.commercial_flights||flights?.flights||flights?.aircraft||[];state.flights=asArray(flights,['flights','aircraft']); if(!state.flights.length&&Array.isArray(f))state.flights=f;
    $('satCount').textContent=state.satellites.length||state.stats?.sats||'—';$('quakeCount').textContent=state.earthquakes.length||'—';$('flightCount').textContent=state.flights.length||state.stats?.flights||'—';
    $('statSats').textContent=state.stats?.sats??state.satellites.length??'—';$('statFlights').textContent=state.stats?.flights??state.flights.length??'—';$('statEvents').textContent=state.stats?.incidents??state.earthquakes.length??'—';$('statWeather').textContent=state.stats?.weather??'—';
    const total=Object.values(state.stats||{}).filter(v=>typeof v==='number').reduce((a,b)=>a+b,0);$('totalCount').textContent=total?total.toLocaleString():'—';
    if($('nightMode').checked){addPoints('satellites',state.satellites,'#47e7ff',p=>objectDetail(p,'satellite'));addPoints('earthquakes',state.earthquakes,'#ffc857',p=>objectDetail(p,'earthquake'));addPoints('flights',state.flights,'#5b8cff',p=>objectDetail(p,'flight'))}
    const now=new Date();$('lastUpdate').textContent=now.toISOString().replace('T',' ').slice(0,19)+' UTC';setConnection(true);toast('Live OSIRIS data updated');
  }catch(e){console.error(e);setConnection(false);toast('OSIRIS API unavailable — map remains online')}
}

function updateVisibility(){for(const id of ['satellites','earthquakes','flights'])if(map.getLayer(id))map.setLayoutProperty(id,'visibility',document.querySelector(`[data-layer="${id}"]`).classList.contains('active')?'visible':'none')}
document.querySelectorAll('.layer').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');updateVisibility()}));
$('refreshBtn').onclick=load;$('autoRefresh').onchange=()=>{if($('autoRefresh').checked)toast('Auto refresh enabled')};
$('nightMode').onchange=()=>{document.querySelectorAll('.layer').forEach(x=>x.classList.toggle('active',true));load()};
setInterval(()=>{$('clock').textContent=new Date().toISOString().slice(11,19)+' UTC'},1000);
setInterval(()=>{if($('autoRefresh').checked)load()},60000);
map.on('load',load);
