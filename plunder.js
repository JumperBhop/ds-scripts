(function(){
"use strict";

if(typeof game_data=="undefined"||typeof TribalWars=="undefined"){alert("Im Spiel oeffnen");return}
if(location.href.indexOf("scavenge_mass")<0){
  window.location=(game_data.player.sitter>0?"game.php?t="+game_data.player.id+"&":"game.php?")+"screen=place&mode=scavenge_mass";
  return
}

// ============================================================
// ORIGINAL BERECHNUNG — UNVERAENDERT
// ============================================================
var R=[.1,.25,.5,.75],
    H={spear:25,sword:15,axe:10,archer:10,light:80,marcher:50,heavy:50,knight:100},
    U=[];
for(var u in H)if((game_data.units||[]).indexOf(u)>=0)U.push(u);
if(!U.length)for(var z in H)U.push(z);

function D(c,r,w){return(Math.pow(Math.pow(c*r,2)*100,w.e)+w.s)*w.f}
function CR(T,r,w){var A=T/w.f-w.s;if(A<=0)return 0;return Math.sqrt(Math.pow(A,1/w.e)/100)/r}
function FW(h){h=h||"";var a=h.match(/duration_factor[":\s]*([\d.]+)/),e=h.match(/duration_exponent[":\s]*([\d.]+)/),i=h.match(/duration_initial_seconds[":\s]*([\d.]+)/);return a?{f:+a[1],e:e?+e[1]:.45,s:i?+i[1]:1800}:null}
function bal(h,i){var d=0,s=false,e=false;for(var p=i;p<h.length;p++){var c=h[p];if(s){if(e)e=false;else if(c=="\\")e=true;else if(c=='"')s=false;continue}if(c=='"'){s=true;continue}if(c=="{"||c=="[")d++;else if(c=="}"||c=="]"){d--;if(d==0)return p}}return -1}
function FV(h){h=h||"";var vi=h.indexOf("village_id");if(vi<0)return[];var p=vi;while(p>0&&h[p]!="{")p--;var op,q=p-1;while(q>=0&&(h[q]==" "||h[q]=="\n"||h[q]=="\r"||h[q]=="\t"))q--;if(h[q]=="["){op=q}else{var dd=0;op=-1;for(var r=p-1;r>=0;r--){var c=h[r];if(c=="}"||c=="]")dd++;else if(c=="{"||c=="["){if(dd==0){op=r;break}dd--}}}if(op<0)return[];var en=bal(h,op);if(en<0)return[];try{var d=JSON.parse(h.slice(op,en+1)),a=d&&d.constructor===Array?d:[];if(!a.length)for(var k in d)a.push(d[k]);var o=[];for(var z=0;z<a.length;z++)if(a[z]&&a[z].unit_counts_home)o.push(a[z]);return o}catch(x){return[]}}
function OP(a,t){var f=[0,0,0,0];a.map(function(i){f[i]=1/a.length});function E(g){var v=0;a.map(function(i){var x=g[i]*t*R[i];v+=x/(Math.pow(x*x*100,.45)+1800)});return v}for(var d=.05,k=0;d>1e-4&&k<400;k++){var m=0,bf=E(f);a.map(function(p){a.map(function(q){if(p!=q&&f[p]>=d){var g=f.slice();g[p]-=d;g[q]+=d;if(E(g)>bf+1e-9){f=g;bf=E(g);m=1}}})});if(!m)d/=2}return f}
function BUSY(o){var q=o.scavenging_squad;if(!q)return false;var c=q.unit_counts;if(c)for(var u in c)if(c[u]>0)return true;return false}
function VS(v,st,w){if(v.has_rally_point===false)return[];var rot=[],a=[];for(var k=1;k<=4;k++){var o=v.options[k];if(o&&!o.is_locked&&st.cats[k-1]){rot.push(k-1);if(!BUSY(o))a.push(k-1)}}if(!a.length)return[];var uf=v.unit_carry_factor||1,av={},ca={},t=0;U.forEach(function(u){ca[u]=H[u]*uf;if(!st.use[u]){av[u]=0;return}var n=(v.unit_counts_home[u]||0)-(st.keep[u]||0);av[u]=n>0?n:0;t+=av[u]*ca[u]});if(t<=0)return[];var od=U.filter(function(u){return st.use[u]}).sort(function(x,y){return ca[y]-ca[x]}),cap,aw=0;rot.forEach(function(c){var q=v.options[c+1].scavenging_squad;if(q&&q.unit_counts){var uu=q.unit_counts;for(var u in uu)aw+=(uu[u]||0)*(H[u]||0)*uf}});var tot=t+aw;if(st.mode=="limit"){cap=function(c){return CR(st.T,R[c],w)}}else{var f=OP(rot,tot);cap=function(c){return f[c]*tot}}var s={};a.forEach(function(i){s[i]={}});var rm={};U.forEach(function(u){rm[u]=av[u]||0});a.slice().sort(function(p,q){return q-p}).forEach(function(c){var nd=cap(c);od.forEach(function(u){if(nd<=0||!rm[u])return;var n=Math.min(Math.floor(nd/ca[u]),rm[u]);if(n>0){s[c][u]=(s[c][u]||0)+n;rm[u]-=n;nd-=n*ca[u]}})});var rq=[];a.forEach(function(c){var uc=s[c],hs=0;for(var u in uc)if(uc[u]>0){hs=1;break}if(!hs)return;rq.push({village_id:v.village_id,candidate_squad:{unit_counts:uc,carry_max:9999999999},option_id:c+1,use_premium:false})});return rq}
function LA(cb){var b=(game_data.player.sitter>0?"game.php?t="+game_data.player.id+"&":"game.php?")+"screen=place&mode=scavenge_mass",g=$("#mqg").val();if(g>0)b+="&group="+g;$.get(b,function(dt){dt=""+dt;var w=FW(dt)||{e:.45,s:1800,f:Math.pow(game_data.speed||1,-.55)},mx=0,pm=dt.match(/[?&]page=(\d+)/g)||[];pm.forEach(function(x){var n=+x.replace(/\D/g,"");if(n>mx)mx=n});var us=[];for(var i=0;i<=mx;i++)us.push(b+"&page="+i);var vs=[],ix=0;(function nx(){if(ix>=us.length){cb(vs,w);return}$.get(us[ix],function(d){try{vs=vs.concat(FV(""+d))}catch(e){}ix++;setTimeout(nx,200)}).fail(function(){ix++;setTimeout(nx,200)})})()})}

// ============================================================
// STATE & STORAGE
// ============================================================
var autoTimer=null, isRunning=false, cdTimer=null;
var SK='ds.plunder.'+(game_data.world||'x');

function saveSettings(){
  try{
    var cfg={use:{},keep:{},group:$("#mqg").val(),mode:$("input[name=mm]:checked").val(),
             maxH:$("#mqT").val(),cats:[],auto:$("#mqauto").prop("checked"),interval:$("#mqI").val()};
    $(".mu").each(function(){cfg.use[$(this).data("u")]=this.checked});
    $(".mk").each(function(){var u=$(this).data("u");if(u)cfg.keep[u]=this.value});
    $(".mc").each(function(){cfg.cats[$(this).data("c")]=this.checked});
    localStorage.setItem(SK,JSON.stringify(cfg));
  }catch(e){}
}

function loadSettings(){
  try{
    var raw=localStorage.getItem(SK);
    if(!raw)return;
    var cfg=JSON.parse(raw);
    applySettings(cfg);
    if(cfg.group)window.__mqSavedGroup=cfg.group;
  }catch(e){}
}

// ============================================================
// COUNTDOWN TIMER
// ============================================================
function startCountdown(ms){
  clearInterval(cdTimer);
  var end=Date.now()+ms;
  $("#mqcd").show();
  function tick(){
    var rem=end-Date.now();
    if(rem<=0){clearInterval(cdTimer);$("#mqcd").hide();return}
    var m=Math.floor(rem/60000),s=Math.floor((rem%60000)/1000);
    $("#mqcd-time").text((m<10?"0"+m:m)+":"+(s<10?"0"+s:s));
    $("#mqcd-bar").css("width",Math.round((1-rem/ms)*100)+"%");
  }
  tick();
  cdTimer=setInterval(tick,1000);
}

function stopCountdown(){
  clearInterval(cdTimer);
  cdTimer=null;
  $("#mqcd").hide();
}

// ============================================================
// SETTINGS SLOTS
// ============================================================
function applySettings(cfg){
  if(cfg.use)$(".mu").each(function(){var u=$(this).data("u");if(cfg.use[u]!==undefined)$(this).prop("checked",cfg.use[u])});
  if(cfg.keep)$(".mk").each(function(){var u=$(this).data("u");if(u&&cfg.keep[u]!==undefined)$(this).val(cfg.keep[u])});
  if(cfg.mode)$("input[name=mm][value='"+cfg.mode+"']").prop("checked",true);
  if(cfg.maxH)$("#mqT").val(cfg.maxH);
  if(cfg.cats)$(".mc").each(function(){var c=$(this).data("c");if(cfg.cats[c]!==undefined)$(this).prop("checked",cfg.cats[c])});
  if(cfg.auto!==undefined)$("#mqauto").prop("checked",cfg.auto);
  if(cfg.interval)$("#mqI").val(cfg.interval);
  if(cfg.group)$("#mqg").val(cfg.group);
}

function saveSlot(n){
  try{
    var cfg={use:{},keep:{},group:$("#mqg").val(),mode:$("input[name=mm]:checked").val(),
             maxH:$("#mqT").val(),cats:[],auto:$("#mqauto").prop("checked"),interval:$("#mqI").val()};
    $(".mu").each(function(){cfg.use[$(this).data("u")]=this.checked});
    $(".mk").each(function(){var u=$(this).data("u");if(u)cfg.keep[u]=this.value});
    $(".mc").each(function(){cfg.cats[$(this).data("c")]=this.checked});
    localStorage.setItem(SK+'.s'+n,JSON.stringify(cfg));
    var btn=$("#mqsave"+n);
    btn.text("✔ Gespeichert!").css("background","#2d6a1f");
    setTimeout(function(){btn.text("💾 Speichern "+n).css("background","")},1500);
  }catch(e){}
}

function loadSlot(n){
  try{
    var raw=localStorage.getItem(SK+'.s'+n);
    if(!raw){setStatus("Slot "+n+" noch leer — zuerst speichern!","#e05555");return}
    applySettings(JSON.parse(raw));
    saveSettings();
    setStatus("Settings "+n+" geladen ✔","#5cb85c");
    $(".mq-sl-load").css("border-color","#5a3a08").css("color","#f0e6c8");
    $("#mqload"+n).css("border-color","#c9a84c").css("color","#c9a84c");
  }catch(e){}
}

// ============================================================
// VOLLAUTOMATISCHES ABSENDEN
// ============================================================
function setStatus(msg,color){
  $("#mqst").html(msg).css("color",color||"#f0e6c8");
}

function sendBatches(bt,onDone){
  var i=0;
  function next(){
    if(i>=bt.length){if(onDone)onDone();return}
    var idx=i; i++;
    setStatus("Sende Paket "+(idx+1)+" von "+bt.length+" ...","#c9a84c");
    TribalWars.post("scavenge_api",{ajaxaction:"send_squads"},{squad_requests:bt[idx]},function(){
      setTimeout(next,1500);
    },false);
  }
  next();
}

function buildAndSend(s,autoRepeat){
  stopCountdown();
  setStatus("Lade Doerfer ...","#c9a84c");
  isRunning=true;
  LA(function(vs,w){
    var all=[],vu=0;
    vs.forEach(function(v){var r=VS(v,s,w);if(r.length){vu++;all=all.concat(r)}});
    if(!all.length){
      if(autoRepeat){
        var wait=(parseFloat($("#mqI").val())||30)*60000;
        setStatus("Keine Doerfer verfuegbar — warte ...","#e05555");
        startCountdown(wait);
        autoTimer=setTimeout(function(){buildAndSend(s,true)},wait);
      }else{
        setStatus("Nichts sendbar.","#e05555");
        isRunning=false;
        $("#mqc").prop("disabled",false);
      }
      return;
    }
    var bt=[],cu=[];
    all.forEach(function(q){cu.push(q);if(cu.length==200){bt.push(cu);cu=[]}});
    if(cu.length)bt.push(cu);

    if(autoRepeat){
      setStatus(vu+" Doerfer, "+all.length+" Raubzuege — sende ...","#c9a84c");
      sendBatches(bt,function(){
        var wait=(parseFloat($("#mqI").val())||30)*60000;
        setStatus("&#10004; Gesendet! Naechste Runde:","#5cb85c");
        startCountdown(wait);
        autoTimer=setTimeout(function(){buildAndSend(s,true)},wait);
      });
    }else{
      var h='<div style="margin-bottom:5px;font-size:12px;color:#c9a84c">'+vu+' Doerfer &mdash; '+all.length+' Raubzuege</div>';
      bt.forEach(function(b,i){
        h+='<button class="ms" data-i="'+i+'">Paket '+(i+1)+' ('+b.length+')</button> ';
      });
      h+='<br><button id="mqsendall">&#10004; Alle senden</button>';
      window.__mqB=bt;
      $("#mqr").html(h);
      $(".ms").click(function(){
        var i=+$(this).data("i"),bn=this;
        bn.disabled=true; bn.textContent="...";
        TribalWars.post("scavenge_api",{ajaxaction:"send_squads"},{squad_requests:window.__mqB[i]},function(){
          bn.textContent="&#10004; "+(i+1); bn.style.background="#2d6a1f";
        },false);
      });
      $("#mqsendall").click(function(){
        var self=$(this); self.prop("disabled",true).text("Sende ...");
        sendBatches(bt,function(){
          self.text("&#10004; Alle gesendet!").css("background","#2d6a1f");
          setStatus("Alle Raubzuege gesendet!","#5cb85c");
        });
      });
      isRunning=false;
      $("#mqc").prop("disabled",false);
      setStatus(vu+" Doerfer, "+all.length+" Raubzuege bereit","#c9a84c");
    }
  });
}

// ============================================================
// UI
// ============================================================
var un=U.map(function(u){
  return '<label class="mql"><input type="checkbox" class="mu" data-u="'+u+'" checked> '+u+' <input class="mk" data-u="'+u+'" value="0"></label>';
}).join("");

var sl=[0,1,2,3].map(function(c){
  return '<label class="mql2"><input type="checkbox" class="mc" data-c="'+c+'" checked> Slot '+(c+1)+'</label>';
}).join("");

var css=
  '#mqx{position:fixed;left:16px;top:16px;z-index:9999;width:336px;background:#1c1108;color:#f0e6c8;border:2px solid #9b7a1a;border-radius:8px;font:13px/1.5 sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.8)}'+
  '#mqx-hd{background:#271608;padding:10px 14px;border-bottom:1px solid #9b7a1a;display:flex;align-items:center;justify-content:space-between;border-radius:6px 6px 0 0}'+
  '#mqx-bd{padding:12px 14px;max-height:82vh;overflow-y:auto}'+
  '#mqx h3{margin:0;font-size:14px;color:#c9a84c;letter-spacing:1.5px;font-weight:bold;text-shadow:0 1px 4px #0008}'+
  '#mqcl{cursor:pointer;color:#d04040;font-size:20px;font-weight:bold;line-height:1;user-select:none}'+
  '#mqcl:hover{color:#ff5555}'+
  '.mqs{margin:8px 0;background:#271608;border:1px solid #5a3a08;border-radius:6px;padding:8px 10px}'+
  '.mq-lb{font-size:10px;color:#9b7a1a;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}'+
  '.mql{display:inline-flex;align-items:center;gap:3px;width:49%;font-size:12px;padding:2px 0}'+
  '.mql2{display:inline-flex;align-items:center;gap:3px;margin:2px 10px 2px 0;font-size:12px}'+
  '.mk{width:34px;padding:1px 3px;background:#130c03;border:1px solid #5a3a08;border-radius:3px;color:#f0e6c8;text-align:center;font-size:11px}'+
  '.mq-row{display:flex;align-items:center;gap:6px;margin:4px 0;flex-wrap:wrap}'+
  'select{background:#130c03;color:#f0e6c8;border:1px solid #5a3a08;border-radius:3px;padding:2px 5px;font-size:12px}'+
  'input[type=radio],input[type=checkbox]{accent-color:#c9a84c;cursor:pointer}'+
  '#mqc{background:linear-gradient(180deg,#a02020,#7a1010);color:#f5e6c8;border:1px solid #c03030;border-radius:5px;padding:8px 22px;font-size:13px;cursor:pointer;font-weight:bold;letter-spacing:.5px;transition:background .15s}'+
  '#mqc:hover:not(:disabled){background:linear-gradient(180deg,#c0392b,#9a1a1a)}'+
  '#mqc:disabled{background:#3a3a3a;border-color:#555;color:#888;cursor:default}'+
  '#mqstop{background:#3a3a3a;color:#ccc;border:1px solid #555;border-radius:5px;padding:8px 14px;font-size:13px;cursor:pointer;display:none}'+
  '#mqstop:hover{background:#555;color:#fff}'+
  '.ms{background:#3d2606;color:#f0e6c8;border:1px solid #8b6914;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin:2px;transition:background .1s}'+
  '.ms:hover:not(:disabled){background:#7a5010}'+
  '#mqsendall{background:linear-gradient(180deg,#a02020,#7a1010);color:#fff;border:1px solid #c03030;border-radius:5px;padding:6px 16px;font-size:12px;cursor:pointer;margin-top:7px;font-weight:bold;display:block;transition:background .15s}'+
  '#mqsendall:hover:not(:disabled){background:linear-gradient(180deg,#c0392b,#9a1a1a)}'+
  '#mqst{font-size:11px;min-height:14px;margin-top:4px;padding:2px 0}'+
  '#mqcd{display:none;margin:6px 0;background:#271608;border:1px solid #5a3a08;border-radius:6px;padding:8px 10px;text-align:center}'+
  '#mqcd-lbl{font-size:10px;color:#9b7a1a;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}'+
  '#mqcd-time{font-size:30px;font-weight:bold;color:#c9a84c;letter-spacing:4px;font-family:monospace}'+
  '#mqcd-wrap{background:#130c03;border-radius:3px;height:5px;margin-top:6px;overflow:hidden}'+
  '#mqcd-bar{height:100%;background:linear-gradient(90deg,#7a5010,#c9a84c);border-radius:3px;width:0%;transition:width 1s linear}'+
  '#mqr{margin-top:4px}'+
  '.mq-sl-load{background:#3d2606;color:#f0e6c8;border:1px solid #8b6914;border-radius:4px;padding:5px 0;font-size:12px;cursor:pointer;flex:1;transition:background .1s;text-align:center}'+
  '.mq-sl-load:hover{background:#7a5010}'+
  '.mq-sl-save{background:#1e1a08;color:#aaa;border:1px solid #444;border-radius:4px;padding:5px 10px;font-size:12px;cursor:pointer;transition:all .1s}'+
  '.mq-sl-save:hover{background:#3a3008;color:#f0e6c8;border-color:#8b6914}';

var P=
  '<div id="mqx"><style>'+css+'</style>'+
  '<div id="mqx-hd"><h3>&#9876; Massen-Raubzug</h3><span id="mqcl">&#x2715;</span></div>'+
  '<div id="mqx-bd">'+

  '<div class="mqs"><div class="mq-lb">Truppen &amp; Reserve (behalten)</div>'+un+'</div>'+

  '<div class="mqs"><div class="mq-lb">Einstellungen</div>'+
    '<div class="mq-row">'+
      '<span style="color:#888;font-size:11px;min-width:28px">Grp</span>'+
      '<select id="mqg"><option value="0">Alle Gruppen</option></select>'+
    '</div>'+
    '<div class="mq-row">'+
      '<span style="color:#888;font-size:11px;min-width:28px">Modus</span>'+
      '<label><input type="radio" name="mm" value="eff" checked> Eff</label>'+
      '<label style="margin-left:8px"><input type="radio" name="mm" value="limit"> Limit</label>'+
      '<span style="color:#888;font-size:11px;margin-left:10px">Max</span>'+
      '<input id="mqT" value="3" style="width:34px;padding:1px 3px;background:#130c03;border:1px solid #5a3a08;border-radius:3px;color:#f0e6c8;text-align:center;font-size:11px">'+
      '<span style="color:#888;font-size:11px">h</span>'+
    '</div>'+
    '<div class="mq-row"><span style="color:#888;font-size:11px;min-width:28px">Slots</span>'+sl+'</div>'+
  '</div>'+

  '<div class="mqs"><div class="mq-lb">&#9654; Vollautomatik</div>'+
    '<div class="mq-row">'+
      '<label style="display:flex;align-items:center;gap:6px;cursor:pointer">'+
        '<input type="checkbox" id="mqauto"> Automatisch wiederholen'+
      '</label>'+
    '</div>'+
    '<div class="mq-row">'+
      '<span style="color:#888;font-size:11px">Alle</span>'+
      '<input id="mqI" value="30" style="width:34px;padding:1px 3px;background:#130c03;border:1px solid #5a3a08;border-radius:3px;color:#f0e6c8;text-align:center;font-size:11px">'+
      '<span style="color:#888;font-size:11px">min erneut senden</span>'+
    '</div>'+
  '</div>'+

  '<div class="mqs"><div class="mq-lb">&#128190; Gespeicherte Settings</div>'+
    '<div class="mq-row">'+
      '<button class="mq-sl-load" id="mqload1">&#128194; Settings 1 laden</button>'+
      '<button class="mq-sl-save" id="mqsave1">&#128190; Speichern 1</button>'+
    '</div>'+
    '<div class="mq-row">'+
      '<button class="mq-sl-load" id="mqload2">&#128194; Settings 2 laden</button>'+
      '<button class="mq-sl-save" id="mqsave2">&#128190; Speichern 2</button>'+
    '</div>'+
  '</div>'+

  '<div class="mq-row" style="margin-top:10px">'+
    '<button id="mqc">&#9654; Starten</button>'+
    '<button id="mqstop">&#9632; Stop</button>'+
  '</div>'+
  '<div id="mqst"></div>'+

  '<div id="mqcd">'+
    '<div id="mqcd-lbl">&#9201; Naechste Runde in</div>'+
    '<div id="mqcd-time">00:00</div>'+
    '<div id="mqcd-wrap"><div id="mqcd-bar"></div></div>'+
  '</div>'+

  '<div id="mqr"></div>'+
  '</div></div>';

$("#mqx").remove();
$("body").append(P);

// Settings laden
loadSettings();

// Einstellungen bei jeder Aenderung speichern
$(document).on("change","#mqx .mu,#mqx .mk,#mqx .mc,#mqx input[name=mm],#mqx #mqauto",saveSettings);
$(document).on("input","#mqx #mqT,#mqx #mqI",saveSettings);
$(document).on("change","#mqg",saveSettings);

// X — schliessen
$("#mqcl").click(function(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  stopCountdown();
  isRunning=false;
  $("#mqx").remove();
});

// Stop
$("#mqstop").click(function(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  stopCountdown();
  isRunning=false;
  $(this).hide();
  $("#mqc").prop("disabled",false);
  setStatus("Gestoppt.","#d04040");
});

// Gruppen laden + gespeicherte Gruppe wiederherstellen
$.get(game_data.link_base_pure+"groups&ajax=load_group_menu",function(r){
  ((r&&r.result)||[]).map(function(g){
    g.group_id&&$("#mqg").append('<option value="'+g.group_id+'">'+g.name+'</option>');
  });
  if(window.__mqSavedGroup){
    $("#mqg").val(window.__mqSavedGroup);
    delete window.__mqSavedGroup;
  }
},"json");

// Settings Slots
$("#mqload1").click(function(){loadSlot(1)});
$("#mqload2").click(function(){loadSlot(2)});
$("#mqsave1").click(function(){saveSlot(1)});
$("#mqsave2").click(function(){saveSlot(2)});

// Starten
$("#mqc").click(function(){
  if(isRunning)return;
  var auto=$("#mqauto").prop("checked");
  var s={use:{},keep:{},cats:[],mode:$("input[name=mm]:checked").val()};
  $(".mu").each(function(){s.use[$(this).data("u")]=this.checked});
  $(".mk").each(function(){var u=$(this).data("u");if(u)s.keep[u]=parseInt(this.value,10)||0});
  $(".mc").each(function(){s.cats[$(this).data("c")]=this.checked});
  s.T=(parseFloat($("#mqT").val())||3)*3600;
  saveSettings();
  $("#mqr").html("");
  $("#mqc").prop("disabled",true);
  if(auto){
    $("#mqstop").show();
    buildAndSend(s,true);
  }else{
    buildAndSend(s,false);
  }
});

})()
