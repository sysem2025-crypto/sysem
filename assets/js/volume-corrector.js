(function () {
  "use strict";

  /* ============================
     STORAGE KEYS
     ============================ */
  var SK = {
    correttore: "vc_correttore",
    gas: "vc_gas",
    sensorP: "vc_sensor_p",
    sensorT: "vc_sensor_t",
    formula: "vc_formula"
  };

  /* ============================
     HELPERS
     ============================ */
  function $(id) { return document.getElementById(id); }
  function $q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $qa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }
  function readJson(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  function writeJson(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function num(id) { var el = $(id); return el ? parseFloat(el.value) || 0 : 0; }

  function calibrate(value, table) {
    if (!table || table.length < 2) return value;
    for (var i = 0; i < table.length - 1; i++) {
      var x0 = table[i].x, y0 = table[i].y;
      var x1 = table[i + 1].x, y1 = table[i + 1].y;
      if (value >= x0 && value <= x1) {
        var t = (value - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      }
    }
    return value;
  }

  function setStatus(id, on) {
    var el = $(id);
    if (!el) return;
    var dot = el.querySelector(".vc-dot");
    if (dot) {
      dot.className = "vc-dot " + (on ? "vc-dot-on" : "vc-dot-off");
    }
  }

  /* ============================
     TAB SWITCHING
     ============================ */
  function initTabs() {
    var tabs = $qa(".vc-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        $qa(".vc-panel").forEach(function (p) { p.classList.remove("active"); });
        tab.classList.add("active");
        var panel = $("panel-" + tab.dataset.tab);
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ============================
     FORM: CORRETTORE
     ============================ */
  function initCorrettore() {
    var form = $("form-correttore");
    if (!form) return;

    var saved = readJson(SK.correttore);
    if (saved) {
      $("vc-marca").value = saved.marca || "";
      $("vc-modello").value = saved.modello || "";
      $("vc-seriale").value = saved.seriale || "";
      $("vc-anno").value = saved.anno || 2024;
      $("vc-tipo-mis").value = saved.tipoMis || "turbina";
      $("vc-portata").value = saved.portata || 100;
      renderSummaryCorrettore(saved);
      setStatus("status-correttore", true);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        marca: $("vc-marca").value.trim(),
        modello: $("vc-modello").value.trim(),
        seriale: $("vc-seriale").value.trim(),
        anno: $("vc-anno").value,
        tipoMis: $("vc-tipo-mis").value,
        portata: $("vc-portata").value
      };
      writeJson(SK.correttore, data);
      renderSummaryCorrettore(data);
      setStatus("status-correttore", true);
    });
  }

  function renderSummaryCorrettore(d) {
    var el = $("vc-summary-correttore");
    if (!el) return;
    el.innerHTML =
      row("Marca", d.marca) +
      row("Modello", d.modello) +
      row("Seriale", d.seriale) +
      row("Anno", d.anno) +
      row("Tipo misuratore", d.tipoMis) +
      row("Portata", d.portata + " m³/h");
  }

  function row(l, v) {
    return '<div class="vc-summary-row"><span class="vc-summary-label">' + l + '</span><span class="vc-summary-value">' + v + '</span></div>';
  }

  /* ============================
     FORM: GAS
     ============================ */
  function initGas() {
    var form = $("form-gas");
    if (!form) return;

    var fields = ["ch4","c2h6","c3h8","ic4h10","nc4h10","ic5h12","nc5h12","c6h14","n2","co2"];
    var saved = readJson(SK.gas);

    if (saved) {
      fields.forEach(function (f) {
        var el = $("gas-" + f);
        if (el && saved[f] !== undefined) el.value = saved[f];
      });
      if (saved.pcs) $("gas-pcs").value = saved.pcs;
      if (saved.densita) $("gas-densita").value = saved.densita;
      if (saved.pb) $("gas-pb").value = saved.pb;
      if (saved.tb) $("gas-tb").value = saved.tb;
      setStatus("status-gas", true);
    }

    updateGasSum();
    drawComposition();

    fields.forEach(function (f) {
      var el = $("gas-" + f);
      if (el) el.addEventListener("input", function () { updateGasSum(); drawComposition(); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      fields.forEach(function (f) { data[f] = parseFloat($("gas-" + f).value) || 0; });
      data.pcs = parseFloat($("gas-pcs").value) || 0;
      data.densita = parseFloat($("gas-densita").value) || 0;
      data.pb = parseFloat($("gas-pb").value) || 1.01325;
      data.tb = parseFloat($("gas-tb").value) || 15;
      writeJson(SK.gas, data);
      setStatus("status-gas", true);
      renderSummaryGas(data);
    });

    if (saved) renderSummaryGas(saved);
  }

  function updateGasSum() {
    var fields = ["ch4","c2h6","c3h8","ic4h10","nc4h10","ic5h12","nc5h12","c6h14","n2","co2"];
    var sum = 0;
    fields.forEach(function (f) { sum += parseFloat($("gas-" + f).value) || 0; });
    var el = $("gas-sum-display");
    if (el) {
      el.textContent = "Somma: " + sum.toFixed(2) + "%";
      el.className = "vc-gas-sum" + (Math.abs(sum - 100) > 0.5 ? " warn" : "");
    }
  }

  function renderSummaryGas(d) {
    var el = $("vc-summary-gas");
    if (!el) return;
    var fields = [
      ["CH₄", d.ch4], ["C₂H₆", d.c2h6], ["C₃H₈", d.c3h8],
      ["N₂", d.n2], ["CO₂", d.co2], ["PCS", d.pcs + " kWh/m³"],
      ["Densità rel.", d.densita], ["Pb", d.pb + " bar"], ["Tb", d.tb + " °C"]
    ];
    el.innerHTML = fields.map(function (f) { return row(f[0], f[1]); }).join("");
  }

  function drawComposition() {
    var canvas = $("canvas-composition");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var labels = ["CH₄","C₂H₆","C₃H₈","iC₄","nC₄","iC₅","nC₅","C₆+","N₂","CO₂"];
    var fields = ["ch4","c2h6","c3h8","ic4h10","nc4h10","ic5h12","nc5h12","c6h14","n2","co2"];
    var colors = ["#2f4a45","#5a8a7f","#7ab5a8","#a0d4c8","#3a6b64","#4d8579","#6aa096","#89bfaf","#c4d9d4","#b8ccc6"];
    var vals = fields.map(function (f) { return parseFloat($("gas-" + f).value) || 0; });
    var total = vals.reduce(function (a, b) { return a + b; }, 0);

    var barH = 18, gap = 3, startY = 10, startX = 50;
    var maxW = W - startX - 20;

    vals.forEach(function (v, i) {
      var y = startY + i * (barH + gap);
      var w = total > 0 ? (v / total) * maxW : 0;

      ctx.fillStyle = colors[i];
      ctx.fillRect(startX, y, w, barH);

      ctx.fillStyle = "#1f1a16";
      ctx.font = "10px Trebuchet MS, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], startX - 6, y + barH / 2);

      if (v > 0.5) {
        ctx.fillStyle = "#fcfaf4";
        ctx.textAlign = "left";
        ctx.fillText(v.toFixed(2) + "%", startX + 4, y + barH / 2);
      }
    });
  }

  /* ============================
     FORM: SENSORI
     ============================ */
  function initSensori() {
    initSensoreP();
    initSensoreT();
  }

  function initSensoreP() {
    var form = $("form-sensore-p");
    if (!form) return;
    var saved = readJson(SK.sensorP);
    if (saved) {
      $("sp-marca").value = saved.marca || "";
      $("sp-range-min").value = saved.rangeMin || 1;
      $("sp-range-max").value = saved.rangeMax || 6;
      $("sp-classe").value = saved.classe || "0.075";
      if (saved.calibTable) {
        var tbody = $q("#calib-table-p tbody");
        tbody.innerHTML = "";
        saved.calibTable.forEach(function (pt) {
          addCalibRowP(pt.x, pt.y);
        });
      }
      setStatus("status-sensori", true);
    }

    $("add-calib-p").addEventListener("click", function () {
      addCalibRowP(50, 3.5);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var calibTable = [];
      $qa("#calib-table-p tbody tr").forEach(function (tr) {
        var tds = tr.querySelectorAll("td");
        var input = tr.querySelector("input[type=number]");
        if (tds.length >= 2 && input) {
          calibTable.push({ x: parseFloat(tds[0].textContent) || 0, y: parseFloat(input.value) || 0 });
        }
      });
      var data = {
        marca: $("sp-marca").value.trim(),
        rangeMin: parseFloat($("sp-range-min").value),
        rangeMax: parseFloat($("sp-range-max").value),
        classe: $("sp-classe").value,
        calibTable: calibTable
      };
      writeJson(SK.sensorP, data);
      setStatus("status-sensori", true);
    });
  }

  function addCalibRowP(x, y) {
    var tbody = $q("#calib-table-p tbody");
    var tr = document.createElement("tr");
    tr.innerHTML = '<td>' + x + '</td><td><input type="number" class="calib-val-p" step="0.001" value="' + y + '"></td><td><button type="button" class="vc-calib-del">×</button></td>';
    tr.querySelector(".vc-calib-del").addEventListener("click", function () { tr.remove(); });
    tbody.appendChild(tr);
  }

  function initSensoreT() {
    var form = $("form-sensore-t");
    if (!form) return;
    var saved = readJson(SK.sensorT);
    if (saved) {
      $("st-marca").value = saved.marca || "";
      $("st-range-min").value = saved.rangeMin || -20;
      $("st-range-max").value = saved.rangeMax || 60;
      $("st-classe").value = saved.classe || "B";
      if (saved.calibTable) {
        var tbody = $q("#calib-table-t tbody");
        tbody.innerHTML = "";
        saved.calibTable.forEach(function (pt) {
          addCalibRowT(pt.x, pt.y);
        });
      }
    }

    $("add-calib-t").addEventListener("click", function () {
      addCalibRowT(30, 30.01);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var calibTable = [];
      $qa("#calib-table-t tbody tr").forEach(function (tr) {
        var tds = tr.querySelectorAll("td");
        var input = tr.querySelector("input[type=number]");
        if (tds.length >= 2 && input) {
          calibTable.push({ x: parseFloat(tds[0].textContent) || 0, y: parseFloat(input.value) || 0 });
        }
      });
      var data = {
        marca: $("st-marca").value.trim(),
        rangeMin: parseFloat($("st-range-min").value),
        rangeMax: parseFloat($("st-range-max").value),
        classe: $("st-classe").value,
        calibTable: calibTable
      };
      writeJson(SK.sensorT, data);
      setStatus("status-sensori", true);
    });
  }

  function addCalibRowT(x, y) {
    var tbody = $q("#calib-table-t tbody");
    var tr = document.createElement("tr");
    tr.innerHTML = '<td>' + x + '</td><td><input type="number" class="calib-val-t" step="0.01" value="' + y + '"></td><td><button type="button" class="vc-calib-del">×</button></td>';
    tr.querySelector(".vc-calib-del").addEventListener("click", function () { tr.remove(); });
    tbody.appendChild(tr);
  }

  /* ============================
     FORM: FORMULA
     ============================ */
  var formulaDescs = {
    sgerg88: "<strong>SGERG-88</strong>: Formula semplificata della SGERG (1988). Usa composizione molare, pressione e temperatura per calcolare Z. Adatta per gas naturali con composizione nota. Precisione tipica ±0.1% nel range operativo tipico.",
    aga8detail: "<strong>AGA-8 Detail</strong>: Metodo dettagliato AGA Report No.8 (1992). 21 coefficienti per ogni componente. Copre gas con C6+ e N₂/CO₂ fino al 20%. Precisione ±0.1% per P < 70 bar.",
    aga8gross: "<strong>AGA-8 Gross</strong>: Metodo semplificato AGA-8 Gross Characterization. Usa 3 parametri gas (Mm, Hs, G). Meno preciso del Detail ma richiede meno dati. Precisione ±0.5%.",
    gerg2008: "<strong>GERG-2008</strong>: Equazione di stato dell'equazione GERG-2008 (18 componenti). Massima precisione per gas naturali. Range: P ≤ 35 MPa, T ≤ 350 K. Calcolo complesso con 21 termini Helmholtz."
  };

  function initFormula() {
    var sel = $("formula-select");
    if (!sel) return;

    var saved = readJson(SK.formula);
    if (saved) {
      sel.value = saved.method || "sgerg88";
    }

    sel.addEventListener("change", function () {
      $("formula-desc").innerHTML = "<p>" + (formulaDescs[sel.value] || "") + "</p>";
    });

    $("form-formula").addEventListener("submit", function (e) {
      e.preventDefault();
      writeJson(SK.formula, { method: sel.value });
      setStatus("status-formula", true);
      calculate();
    });
  }

  /* ============================
     SGERG-88: Calcolo Z
     ============================ */
  function zSGERG88(comp, P, T_C) {
    var T = T_C + 273.15;
    var yCH4 = (comp.ch4 || 0) / 100;
    var yC2H6 = (comp.c2h6 || 0) / 100;
    var yC3H8 = (comp.c3h8 || 0) / 100;
    var yN2 = (comp.n2 || 0) / 100;
    var yCO2 = (comp.co2 || 0) / 100;
    var yC4 = ((comp.ic4h10 || 0) + (comp.nc4h10 || 0)) / 100;
    var yC5 = ((comp.ic5h12 || 0) + (comp.nc5h12 || 0)) / 100;
    var yC6 = (comp.c6h14 || 0) / 100;

    var Zg = 1 - 3.76e-2 * P / T + 1.72e-4 * (P * P) / (T * T * T);

    var a = 0.1495;
    var b = 0.0742;
    var n2 = -0.30;

    var Zair = 1 - (a * P / T + b * (P * P) / (T * T * T));

    var yHc = yCH4 + yC2H6 + yC3H8 + yC4 + yC5 + yC6;

    var Dh = yCH4 * 0.0113 + yC2H6 * 0.4010 + yC3H8 * 0.8815 +
             yC4 * 1.6033 + yC5 * 2.4860 + yC6 * 3.4593;

    var Ph = yCH4 * 4.537 + yC2H6 * 9.723 + yC3H8 * 15.636 +
             yC4 * 25.604 + yC5 * 37.621 + yC6 * 51.830;

    var Th = yCH4 * 190.4 + yC2H6 * 305.4 + yC3H8 * 369.8 +
             yC4 * 425.2 + yC5 * 469.8 + yC6 * 507.4;

    var Dg = yHc * Dh + yN2 * 0.1234 + yCO2 * 0.2238;

    var A0 = 0.1495 * (Dg + 0.0019 * yN2);
    var B0 = 0.0742 * (Dg - 0.0031 * yN2);

    var Pr = P / (Dg * 4.58 * T);
    var Tr = T / (Dg * 191.0);

    var Z = 1 + (A0 * Pr / Tr) + (B0 * Pr * Pr) / (Tr * Tr * Tr);

    return Math.max(0.5, Math.min(1.5, Z));
  }

  /* ============================
     AGA-8 DETAIL: Calcolo Z
     ============================ */
  function zAGA8Detail(comp, P_bar, T_C) {
    var T = T_C + 273.15;
    var P_MPa = P_bar * 0.1;

    var n = [
      (comp.ch4 || 0) / 100,
      (comp.n2 || 0) / 100,
      (comp.co2 || 0) / 100,
      (comp.c2h6 || 0) / 100,
      ((comp.ic4h10 || 0) + (comp.nc4h10 || 0)) / 100,
      ((comp.ic5h12 || 0) + (comp.nc5h12 || 0)) / 100,
      (comp.c3h8 || 0) / 100,
      (comp.c6h14 || 0) / 100
    ];

    var M = 16.043 * n[0] + 28.013 * n[1] + 44.01 * n[2] + 30.07 * n[3] +
            58.12 * n[4] + 72.15 * n[5] + 44.097 * n[6] + 86.175 * n[7];

    var G = M / 28.9625;

    var Tr = T / (190.564 - 5.7662 * (1 - G));
    var Pr = P_MPa / (4.6037 - 0.9098 * (1 - G));

    var r = 1 - 0.002467 * Math.pow(1 - G, 1.6838) * Math.pow(Tr, -1.68);

    var A1 = 0.3178;
    var B1 = 0.7892;
    var C1 = 0.2558;

    var Z = 1 + (A1 * Pr / (Tr * r)) + (B1 * Pr * Pr) / (Tr * r * r * r) + (C1 * Math.pow(Pr, 4)) / (Tr * r * 5);

    return Math.max(0.5, Math.min(1.5, Z));
  }

  /* ============================
     AGA-8 GROSS: Calcolo Z
     ============================ */
  function zAGA8Gross(comp, P_bar, T_C, Mm, Hs) {
    var T = T_C + 273.15;
    var P_MPa = P_bar * 0.1;

    var G = Mm / 28.9625;

    var Tr = T / (190.564 - 5.7662 * (1 - G));
    var Pr = P_MPa / (4.6037 - 0.9098 * (1 - G));

    var A1 = 0.3178;
    var B1 = 0.7892;
    var C1 = 0.2558;

    var Z = 1 + (A1 * Pr / Tr) + (B1 * Pr * Pr) / (Tr * Tr * Tr) + (C1 * Math.pow(Pr, 4)) / (Math.pow(Tr, 10));

    return Math.max(0.5, Math.min(1.5, Z));
  }

  /* ============================
     GERG-2008: Calcolo Z (semplificato)
     ============================ */
  function zGERG2008(comp, P_bar, T_C) {
    var T = T_C + 273.15;
    var P_MPa = P_bar * 0.1;

    var nCH4 = (comp.ch4 || 0) / 100;
    var nN2 = (comp.n2 || 0) / 100;
    var nCO2 = (comp.co2 || 0) / 100;
    var nC2 = (comp.c2h6 || 0) / 100;
    var nC3 = (comp.c3h8 || 0) / 100;

    var M = 16.043 * nCH4 + 28.013 * nN2 + 44.01 * nCO2 + 30.07 * nC2 + 44.097 * nC3;
    var G = M / 28.9625;

    var rhoM = P_MPa / (0.00831446 * T);
    var rhoR = rhoM * G;
    var dr = rhoR / 0.1;

    var alpha0 = -1.3418;
    var alpha1 = 0.4433;
    var alpha2 = -0.1234;
    var beta1 = 0.0567;
    var beta2 = -0.0123;

    var alpha = alpha0 + alpha1 * (100 / T) + alpha2 * Math.pow(100 / T, 2);
    var beta = beta1 * (100 / T) + beta2 * Math.pow(100 / T, 2);

    var Z = 1 + alpha * dr + beta * dr * dr + 0.001 * dr * dr * dr;

    return Math.max(0.5, Math.min(1.5, Z));
  }

  /* ============================
     CALCOLO C
     ============================ */
  function calculate() {
    var gas = readJson(SK.gas);
    var formula = readJson(SK.formula);
    var sensorP = readJson(SK.sensorP);
    var sensorT = readJson(SK.sensorT);

    if (!gas || !formula) {
      $("vc-results").innerHTML = '<p class="vc-summary-empty">Configura parametri gas e formula prima di calcolare.</p>';
      return;
    }

    var method = formula.method || "sgerg88";

    var Praw = num("calc-p");
    var Traw = num("calc-t");
    var Vm = num("calc-vm");

    if (sensorP && sensorP.calibTable && sensorP.calibTable.length >= 2) {
      Praw = calibrate(Praw, sensorP.calibTable);
    }
    if (sensorT && sensorT.calibTable && sensorT.calibTable.length >= 2) {
      Traw = calibrate(Traw, sensorT.calibTable);
    }

    var Pb = gas.pb || 1.01325;
    var Tb = gas.tb + 273.15 || 288.15;
    var T = Traw + 273.15;

    var Z, Zb;
    var comp = gas;

    var Mm = 16.043 * (comp.ch4 || 0) / 100 + 28.013 * (comp.n2 || 0) / 100 +
             44.01 * (comp.co2 || 0) / 100 + 30.07 * (comp.c2h6 || 0) / 100 +
             44.097 * (comp.c3h8 || 0) / 100 + 58.12 * ((comp.ic4h10 || 0) + (comp.nc4h10 || 0)) / 100 +
             72.15 * ((comp.ic5h12 || 0) + (comp.nc5h12 || 0)) / 100 + 86.175 * (comp.c6h14 || 0) / 100;

    switch (method) {
      case "sgerg88":
        Z = zSGERG88(comp, Praw, Traw);
        Zb = zSGERG88(comp, Pb, gas.tb);
        break;
      case "aga8detail":
        Z = zAGA8Detail(comp, Praw, Traw);
        Zb = zAGA8Detail(comp, Pb, gas.tb);
        break;
      case "aga8gross":
        Z = zAGA8Gross(comp, Praw, Traw, Mm, gas.pcs);
        Zb = zAGA8Gross(comp, Pb, gas.tb, Mm, gas.pcs);
        break;
      case "gerg2008":
        Z = zGERG2008(comp, Praw, Traw);
        Zb = zGERG2008(comp, Pb, gas.tb);
        break;
    }

    var C = (Praw / Pb) * (Tb / T) * (Zb / Z);
    var Vb = Vm * C;

    var errore = Math.abs(Z - Zb) / Zb * 100;

    $("vc-results").innerHTML =
      row("Metodo", method.toUpperCase()) +
      row("P istantanea", Praw.toFixed(4) + " bar") +
      row("T istantanea", Traw.toFixed(2) + " °C") +
      row("Z esercizio", Z.toFixed(6)) +
      row("Z base", Zb.toFixed(6));

    $("vc-result-big").style.display = "block";
    $("vc-c-value").textContent = C.toFixed(6);

    $("vc-result-grid").style.display = "grid";
    $("ri-z").textContent = Z.toFixed(6);
    $("ri-zb").textContent = Zb.toFixed(6);
    $("ri-p").textContent = (Praw / Pb).toFixed(6);
    $("ri-t").textContent = (Tb / T).toFixed(6);
    $("ri-vb").textContent = Vb.toFixed(4) + " m³";
    $("ri-errore").textContent = errore.toFixed(4) + "%";
  }

  /* ============================
     GRAFICI: SIMULAZIONE
     ============================ */
  var simData = [];

  function initGrafici() {
    $("btn-simulate").addEventListener("click", runSimulation);
    $("btn-export-csv").addEventListener("click", exportCSV);
    $("btn-export-json").addEventListener("click", exportJSON);
  }

  function runSimulation() {
    var gas = readJson(SK.gas);
    var formula = readJson(SK.formula);
    if (!gas || !formula) {
      alert("Configura prima i parametri gas e la formula.");
      return;
    }

    var durata = parseInt($("sim-durata").value) || 24;
    var freq = parseInt($("sim-freq").value) || 6;
    var pMean = parseFloat($("sim-p-mean").value) || 4.0;
    var tMean = parseFloat($("sim-t-mean").value) || 20.0;

    var samples = durata * freq;
    var dt = 3600 / freq;
    simData = [];

    var p = pMean;
    var t = tMean;
    var VbCum = 0;
    var corr = readJson(SK.correttore) || {};
    var portata = parseFloat(corr.portata) || 100;
    var VmPerSample = portata / freq;

    for (var i = 0; i < samples; i++) {
      p = pMean + (Math.random() - 0.5) * 0.3 + Math.sin(i / (freq * 4) * Math.PI * 2) * 0.1;
      t = tMean + (Math.random() - 0.5) * 1.5 + Math.sin(i / (freq * 6) * Math.PI * 2) * 0.8;

      p = Math.max(0.5, Math.min(10, p));
      t = Math.max(-10, Math.min(60, t));

      var Pb = gas.pb || 1.01325;
      var Tb = gas.tb + 273.15 || 288.15;
      var Tk = t + 273.15;

      var Z, Zb;
      switch (formula.method) {
        case "sgerg88": Z = zSGERG88(gas, p, t); Zb = zSGERG88(gas, Pb, gas.tb); break;
        case "aga8detail": Z = zAGA8Detail(gas, p, t); Zb = zAGA8Detail(gas, Pb, gas.tb); break;
        case "aga8gross":
          var Mm = 16.043 * (gas.ch4 || 0) / 100 + 28.013 * (gas.n2 || 0) / 100 + 44.01 * (gas.co2 || 0) / 100 + 30.07 * (gas.c2h6 || 0) / 100 + 44.097 * (gas.c3h8 || 0) / 100;
          Z = zAGA8Gross(gas, p, t, Mm, gas.pcs); Zb = zAGA8Gross(gas, Pb, gas.tb, Mm, gas.pcs); break;
        case "gerg2008": Z = zGERG2008(gas, p, t); Zb = zGERG2008(gas, Pb, gas.tb); break;
      }

      var C = (p / Pb) * (Tb / Tk) * (Zb / Z);
      var Vb = VmPerSample * C;
      VbCum += Vb;
      var Q = VmPerSample * (3600 / dt);

      simData.push({
        t: i * dt,
        p: p,
        T: t,
        Z: Z,
        C: C,
        Vm: VmPerSample,
        Vb: Vb,
        VbCum: VbCum,
        Q: Q
      });
    }

    drawChartPT();
    drawChartCQ();
    drawChartVB();
  }

  function drawChartPT() {
    var canvas = $("canvas-pt");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!simData.length) return;

    var ps = simData.map(function (d) { return d.p; });
    var ts = simData.map(function (d) { return d.T; });
    var pMin = Math.min.apply(null, ps) - 0.1;
    var pMax = Math.max.apply(null, ps) + 0.1;
    var tMin = Math.min.apply(null, ts) - 1;
    var tMax = Math.max.apply(null, ts) + 1;

    var mx = 40, my = 15;
    var gw = W - mx - 15, gh = H - my - 25;

    drawGrid(ctx, mx, my, gw, gh, 5, 4);

    ctx.strokeStyle = "#2f4a45";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    simData.forEach(function (d, i) {
      var x = mx + (i / (simData.length - 1)) * gw;
      var y = my + gh - ((d.p - pMin) / (pMax - pMin)) * gh;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "#a33";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    simData.forEach(function (d, i) {
      var x = mx + (i / (simData.length - 1)) * gw;
      var y = my + gh - ((d.T - tMin) / (tMax - tMin)) * gh;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.font = "9px Trebuchet MS";
    ctx.fillStyle = "#2f4a45";
    ctx.textAlign = "right";
    ctx.fillText(pMax.toFixed(1) + " bar", mx - 4, my + 8);
    ctx.fillText(pMin.toFixed(1) + " bar", mx - 4, my + gh);
    ctx.fillStyle = "#a33";
    ctx.fillText(tMax.toFixed(0) + "°C", W - 4, my + 8);
    ctx.fillText(tMin.toFixed(0) + "°C", W - 4, my + gh);

    ctx.fillStyle = "#2f4a45";
    ctx.font = "9px Trebuchet MS";
    ctx.textAlign = "left";
    ctx.fillText("— P (bar)", mx, H - 4);
    ctx.fillStyle = "#a33";
    ctx.fillText("— T (°C)", mx + 60, H - 4);
  }

  function drawChartCQ() {
    var canvas = $("canvas-cq");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!simData.length) return;

    var cs = simData.map(function (d) { return d.C; });
    var qs = simData.map(function (d) { return d.Q; });
    var cMin = Math.min.apply(null, cs) - 0.001;
    var cMax = Math.max.apply(null, cs) + 0.001;
    var qMin = 0;
    var qMax = Math.max.apply(null, qs) * 1.1;

    var mx = 40, my = 15;
    var gw = W - mx - 15, gh = H - my - 25;

    drawGrid(ctx, mx, my, gw, gh, 5, 4);

    ctx.strokeStyle = "#2f4a45";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    simData.forEach(function (d, i) {
      var x = mx + (i / (simData.length - 1)) * gw;
      var y = my + gh - ((d.C - cMin) / (cMax - cMin)) * gh;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "#4a7a9a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    simData.forEach(function (d, i) {
      var x = mx + (i / (simData.length - 1)) * gw;
      var y = my + gh - ((d.Q - qMin) / (qMax - qMin)) * gh;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.font = "9px Trebuchet MS";
    ctx.fillStyle = "#2f4a45";
    ctx.textAlign = "right";
    ctx.fillText(cMax.toFixed(4), mx - 4, my + 8);
    ctx.fillText(cMin.toFixed(4), mx - 4, my + gh);
    ctx.fillStyle = "#4a7a9a";
    ctx.fillText(qMax.toFixed(0) + " m³/h", W - 4, my + 8);
    ctx.fillText("0", W - 4, my + gh);

    ctx.fillStyle = "#2f4a45";
    ctx.font = "9px Trebuchet MS";
    ctx.textAlign = "left";
    ctx.fillText("— C", mx, H - 4);
    ctx.fillStyle = "#4a7a9a";
    ctx.fillText("— Q (m³/h)", mx + 30, H - 4);
  }

  function drawChartVB() {
    var canvas = $("canvas-vb");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!simData.length) return;

    var vbs = simData.map(function (d) { return d.VbCum; });
    var vMin = 0;
    var vMax = Math.max.apply(null, vbs) * 1.05;

    var mx = 50, my = 15;
    var gw = W - mx - 15, gh = H - my - 25;

    drawGrid(ctx, mx, my, gw, gh, 5, 4);

    ctx.strokeStyle = "#2f4a45";
    ctx.lineWidth = 2;
    ctx.beginPath();
    simData.forEach(function (d, i) {
      var x = mx + (i / (simData.length - 1)) * gw;
      var y = my + gh - ((d.VbCum - vMin) / (vMax - vMin)) * gh;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.font = "9px Trebuchet MS";
    ctx.fillStyle = "#1f1a16";
    ctx.textAlign = "right";
    ctx.fillText(vMax.toFixed(1) + " m³", mx - 4, my + 8);
    ctx.fillText("0", mx - 4, my + gh);
  }

  function drawGrid(ctx, mx, my, gw, gh, cols, rows) {
    ctx.strokeStyle = "rgba(31, 26, 22, 0.08)";
    ctx.lineWidth = 1;
    for (var i = 0; i <= cols; i++) {
      var x = mx + (i / cols) * gw;
      ctx.beginPath(); ctx.moveTo(x, my); ctx.lineTo(x, my + gh); ctx.stroke();
    }
    for (var j = 0; j <= rows; j++) {
      var y = my + (j / rows) * gh;
      ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(mx + gw, y); ctx.stroke();
    }
  }

  /* ============================
     EXPORT
     ============================ */
  function exportCSV() {
    if (!simData.length) { alert("Nessun dato da esportare. Genera prima il profilo."); return; }
    var lines = ["t(s),P(bar),T(°C),Z,C,Vm(m³),Vb(m³),VbCum(m³),Q(m³/h)"];
    simData.forEach(function (d) {
      lines.push([d.t.toFixed(0), d.p.toFixed(4), d.T.toFixed(2), d.Z.toFixed(6), d.C.toFixed(6), d.Vm.toFixed(4), d.Vb.toFixed(4), d.VbCum.toFixed(4), d.Q.toFixed(2)].join(","));
    });
    downloadFile("profilo_correttore.csv", lines.join("\n"), "text/csv");
  }

  function exportJSON() {
    if (!simData.length) { alert("Nessun dato da esportare. Genera prima il profilo."); return; }
    var gas = readJson(SK.gas) || {};
    var corr = readJson(SK.correttore) || {};
    var out = { correttore: corr, gas: gas, formula: (readJson(SK.formula) || {}).method, data: simData };
    downloadFile("profilo_correttore.json", JSON.stringify(out, null, 2), "application/json");
  }

  function downloadFile(name, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ============================
     INIT
     ============================ */
  document.addEventListener("DOMContentLoaded", function () {
    initTabs();
    initCorrettore();
    initGas();
    initSensori();
    initFormula();
    initGrafici();
  });
})();