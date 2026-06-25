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
var SK='ds.plunder.m.'+(game_data.world||'x');

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

function loadSettings(){
  try{
    var raw=localStorage.getItem(SK);
    if(!raw)return;
    var cfg=JSON.parse(raw);
    applySettings(cfg);
    if(cfg.group)window.__mqSavedGroup=cfg.group;
  }catch(e){}
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
    setTimeout(function(){btn.text("💾 Slot "+n+" speichern").css("background","")},1500);
  }catch(e){}
}

function loadSlot(n){
  try{
    var raw=localStorage.getItem(SK+'.s'+n);
    if(!raw){setStatus("Slot "+n+" noch leer!","#e05555");return}
    applySettings(JSON.parse(raw));
    saveSettings();
    setStatus("Slot "+n+" geladen ✔","#5cb85c");
    $(".mq-sl-load").css("border-color","#5a3a08").css("color","#f0e6c8");
    $("#mqload"+n).css("border-color","#c9a84c").css("color","#c9a84c");
  }catch(e){}
}

// ============================================================
// COUNTDOWN
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
// BOT-SCHUTZ CHECK
// ============================================================
function botCheck(){
  if($('div#bot_check,div#popup_box_bot_protection').length){
    $('div#bot_check,div#popup_box_bot_protection').find('iframe')
      .css('padding','4px 3px 2px 4px')
      .css('background-color','#e8c97a');
    document.title='⚠ BOT CHECK!';
    return false;
  }
  return true;
}

var botPollTimer=null;
function waitForBotClear(callback){
  if(botCheck())return true;
  setStatus("&#9888; Bot-Check erkannt! Bitte loesen ...","#e05555");
  clearInterval(botPollTimer);
  botPollTimer=setInterval(function(){
    if(!$('div#bot_check,div#popup_box_bot_protection').length){
      clearInterval(botPollTimer);
      botPollTimer=null;
      document.title=game_data.village.name||'Die Staemme';
      setStatus("&#10004; Bot-Check geloest — setze fort ...","#5cb85c");
      setTimeout(callback,2000);
    }
  },3000);
  return false;
}

// ============================================================
// SENDEN
// ============================================================
function setStatus(msg,color){
  $("#mqst").html(msg).css("color",color||"#f0e6c8");
}

function sendBatches(bt,onDone){
  var i=0;
  function next(){
    if(i>=bt.length){if(onDone)onDone();return}
    if(!waitForBotClear(next))return;
    var idx=i; i++;
    setStatus("Sende "+(idx+1)+" / "+bt.length+" ...","#c9a84c");
    TribalWars.post("scavenge_api",{ajaxaction:"send_squads"},{squad_requests:bt[idx]},function(){
      setTimeout(next,1500);
    },false);
  }
  next();
}

function buildAndSend(s,autoRepeat){
  if(!waitForBotClear(function(){buildAndSend(s,autoRepeat)}))return;
  stopCountdown();
  setStatus("Lade ...","#c9a84c");
  isRunning=true;
  LA(function(vs,w){
    var all=[],vu=0;
    vs.forEach(function(v){var r=VS(v,s,w);if(r.length){vu++;all=all.concat(r)}});
    if(!all.length){
      if(autoRepeat){
        var wait=(parseFloat($("#mqI").val())||30)*60000;
        setStatus("Keine Doerfer — warte ...","#e05555");
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
      setStatus(vu+" Doerfer, "+all.length+" Raids — sende ...","#c9a84c");
      sendBatches(bt,function(){
        var wait=(parseFloat($("#mqI").val())||30)*60000;
        setStatus("&#10004; Gesendet! Naechste Runde:","#5cb85c");
        startCountdown(wait);
        autoTimer=setTimeout(function(){buildAndSend(s,true)},wait);
      });
    }else{
      var h='<div style="font-size:13px;color:#c9a84c;margin-bottom:6px">'+vu+' Doerfer &mdash; '+all.length+' Raids</div>';
      bt.forEach(function(b,i){
        h+='<button class="ms" data-i="'+i+'">Paket '+(i+1)+' ('+b.length+')</button>';
      });
      h+='<button id="mqsendall">&#10004; Alle senden</button>';
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
          setStatus("Alle gesendet!","#5cb85c");
        });
      });
      isRunning=false;
      $("#mqc").prop("disabled",false);
      setStatus(vu+" Doerfer, "+all.length+" Raids bereit","#c9a84c");
    }
  });
}

// ============================================================
// MOBILES UI
// ============================================================
var un=U.map(function(u){
  return '<label class="mql"><input type="checkbox" class="mu" data-u="'+u+'" checked><span class="mql-txt">'+u+'</span><input class="mk" data-u="'+u+'" value="0" placeholder="0"></label>';
}).join("");

var sl=[0,1,2,3].map(function(c){
  return '<label class="mql2"><input type="checkbox" class="mc" data-c="'+c+'" checked> S'+(c+1)+'</label>';
}).join("");

var css=
  // Panel — unten, volle Breite
  '#mqx{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1c1108;color:#f0e6c8;border-top:2px solid #9b7a1a;border-radius:14px 14px 0 0;font:14px/1.5 sans-serif;box-shadow:0 -4px 24px rgba(0,0,0,.8);max-height:85vh;display:flex;flex-direction:column}'+
  // Header
  '#mqx-hd{background:#271608;padding:12px 16px;border-bottom:1px solid #9b7a1a;display:flex;align-items:center;justify-content:space-between;border-radius:14px 14px 0 0;flex-shrink:0}'+
  '#mqx h3{margin:0;font-size:15px;color:#c9a84c;letter-spacing:1px;font-weight:bold}'+
  '#mqcl{cursor:pointer;color:#d04040;font-size:26px;font-weight:bold;line-height:1;padding:4px 8px;-webkit-tap-highlight-color:transparent}'+
  // Body scrollbar
  '#mqx-bd{padding:10px 14px 20px;overflow-y:auto;flex:1}'+
  // Sektionen
  '.mqs{margin:8px 0;background:#271608;border:1px solid #5a3a08;border-radius:8px;padding:10px 12px}'+
  '.mq-lb{font-size:11px;color:#9b7a1a;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}'+
  // Truppen — 2 Spalten
  '.mql{display:flex;align-items:center;gap:6px;width:50%;padding:4px 0;font-size:13px;box-sizing:border-box}'+
  '.mql-txt{flex:1;min-width:0}'+
  '.mk{width:42px;padding:4px 4px;background:#130c03;border:1px solid #5a3a08;border-radius:5px;color:#f0e6c8;text-align:center;font-size:13px}'+
  '.mq-units{display:flex;flex-wrap:wrap}'+
  // Rows
  '.mq-row{display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap}'+
  'select{background:#130c03;color:#f0e6c8;border:1px solid #5a3a08;border-radius:6px;padding:6px 8px;font-size:13px;flex:1}'+
  'input[type=radio],input[type=checkbox]{accent-color:#c9a84c;width:18px;height:18px;cursor:pointer;flex-shrink:0}'+
  '.mq-radio-lbl{display:flex;align-items:center;gap:6px;font-size:13px}'+
  // Slots checkboxes
  '.mql2{display:flex;align-items:center;gap:4px;margin:2px 10px 2px 0;font-size:13px}'+
  // Kleine inputs (Max h, Interval)
  '.mq-sm{width:46px;padding:5px 4px;background:#130c03;border:1px solid #5a3a08;border-radius:5px;color:#f0e6c8;text-align:center;font-size:13px}'+
  // Haupt-Buttons
  '#mqc{background:linear-gradient(180deg,#a02020,#7a1010);color:#f5e6c8;border:1px solid #c03030;border-radius:8px;padding:14px;font-size:15px;cursor:pointer;font-weight:bold;flex:1;-webkit-tap-highlight-color:transparent}'+
  '#mqc:disabled{background:#3a3a3a;border-color:#555;color:#888}'+
  '#mqstop{background:#3a3a3a;color:#ccc;border:1px solid #555;border-radius:8px;padding:14px;font-size:15px;cursor:pointer;display:none;-webkit-tap-highlight-color:transparent}'+
  // Paket Buttons
  '.ms{background:#3d2606;color:#f0e6c8;border:1px solid #8b6914;border-radius:6px;padding:10px 12px;font-size:13px;cursor:pointer;margin:3px;display:inline-block}'+
  '#mqsendall{background:linear-gradient(180deg,#a02020,#7a1010);color:#fff;border:1px solid #c03030;border-radius:8px;padding:12px;font-size:14px;cursor:pointer;margin-top:8px;font-weight:bold;display:block;width:100%;box-sizing:border-box}'+
  // Settings Slot Buttons
  '.mq-sl-load{background:#3d2606;color:#f0e6c8;border:1px solid #8b6914;border-radius:6px;padding:11px 0;font-size:13px;cursor:pointer;flex:1;text-align:center;-webkit-tap-highlight-color:transparent}'+
  '.mq-sl-save{background:#1e1a08;color:#aaa;border:1px solid #444;border-radius:6px;padding:11px 10px;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
  // Status & Countdown
  '#mqst{font-size:13px;min-height:16px;margin-top:6px;padding:2px 0}'+
  '#mqcd{display:none;margin:8px 0;background:#271608;border:1px solid #5a3a08;border-radius:8px;padding:10px 12px;text-align:center}'+
  '#mqcd-lbl{font-size:11px;color:#9b7a1a;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}'+
  '#mqcd-time{font-size:36px;font-weight:bold;color:#c9a84c;letter-spacing:4px;font-family:monospace}'+
  '#mqcd-wrap{background:#130c03;border-radius:4px;height:6px;margin-top:8px;overflow:hidden}'+
  '#mqcd-bar{height:100%;background:linear-gradient(90deg,#7a5010,#c9a84c);border-radius:4px;width:0%;transition:width 1s linear}'+
  '#mqr{margin-top:6px}';

var P=
  '<div id="mqx"><style>'+css+'</style>'+
  '<div id="mqx-hd"><h3>&#9876; Massen-Raubzug</h3><span id="mqcl">&#x2715;</span></div>'+
  '<div id="mqx-bd">'+

  '<div class="mqs"><div class="mq-lb">Truppen &amp; Reserve</div>'+
    '<div class="mq-units">'+un+'</div>'+
  '</div>'+

  '<div class="mqs"><div class="mq-lb">Einstellungen</div>'+
    '<div class="mq-row">'+
      '<span style="color:#888;font-size:12px">Gruppe</span>'+
      '<select id="mqg"><option value="0">Alle Gruppen</option></select>'+
    '</div>'+
    '<div class="mq-row">'+
      '<label class="mq-radio-lbl"><input type="radio" name="mm" value="eff" checked> Eff</label>'+
      '<label class="mq-radio-lbl" style="margin-left:4px"><input type="radio" name="mm" value="limit"> Limit</label>'+
      '<span style="color:#888;font-size:12px;margin-left:6px">Max</span>'+
      '<input id="mqT" value="3" class="mq-sm">'+
      '<span style="color:#888;font-size:12px">h</span>'+
    '</div>'+
    '<div class="mq-row"><span style="color:#888;font-size:12px">Slots</span>'+sl+'</div>'+
  '</div>'+

  '<div class="mqs"><div class="mq-lb">&#9654; Vollautomatik</div>'+
    '<div class="mq-row">'+
      '<label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer">'+
        '<input type="checkbox" id="mqauto"> Automatisch wiederholen'+
      '</label>'+
    '</div>'+
    '<div class="mq-row">'+
      '<span style="color:#888;font-size:12px">Alle</span>'+
      '<input id="mqI" value="30" class="mq-sm">'+
      '<span style="color:#888;font-size:12px">min erneut senden</span>'+
    '</div>'+
  '</div>'+

  '<div class="mqs"><div class="mq-lb">&#128190; Settings Slots</div>'+
    '<div class="mq-row">'+
      '<button class="mq-sl-load" id="mqload1">&#128194; Slot 1 laden</button>'+
      '<button class="mq-sl-save" id="mqsave1">&#128190; Speichern</button>'+
    '</div>'+
    '<div class="mq-row">'+
      '<button class="mq-sl-load" id="mqload2">&#128194; Slot 2 laden</button>'+
      '<button class="mq-sl-save" id="mqsave2">&#128190; Speichern</button>'+
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

loadSettings();

$(document).on("change","#mqx .mu,#mqx .mk,#mqx .mc,#mqx input[name=mm],#mqx #mqauto",saveSettings);
$(document).on("input","#mqx #mqT,#mqx #mqI",saveSettings);
$(document).on("change","#mqg",saveSettings);

// X — native capture listener
document.getElementById('mqcl').addEventListener('click',function(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  stopCountdown();
  isRunning=false;
  var el=document.getElementById('mqx');
  if(el)el.parentNode.removeChild(el);
},true);

$("#mqstop").click(function(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  stopCountdown();
  isRunning=false;
  $(this).hide();
  $("#mqc").prop("disabled",false);
  setStatus("Gestoppt.","#d04040");
});

$.get(game_data.link_base_pure+"groups&ajax=load_group_menu",function(r){
  ((r&&r.result)||[]).map(function(g){
    g.group_id&&$("#mqg").append('<option value="'+g.group_id+'">'+g.name+'</option>');
  });
  if(window.__mqSavedGroup){
    $("#mqg").val(window.__mqSavedGroup);
    delete window.__mqSavedGroup;
  }
},"json");

$("#mqload1").click(function(){loadSlot(1)});
$("#mqload2").click(function(){loadSlot(2)});
$("#mqsave1").click(function(){saveSlot(1)});
$("#mqsave2").click(function(){saveSlot(2)});

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
