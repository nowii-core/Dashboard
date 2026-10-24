# Analytics Dashboard

Una piattaforma analitica web per la visualizzazione di KPI finanziari e metriche di business, sviluppata interamente in Vanilla JavaScript e Canvas 2D API senza l'ausilio di framework o librerie grafiche esterne.

---

## Preview

![Analytics Dashboard Screenshot](Screenshot-1.png)

> **Live Demo:** [nowii-core.github.io/Dashboard/dashboard/](https://nowii-core.github.io/Dashboard/dashboard/)

---

## Caratteristiche Principali

- **Indicatori KPI Dinamici:** Carte riassuntive con calcolo in tempo reale dei delta percentuali e animazioni di stato.
- **Grafico Lineare Interattivo:** Rendering custom via Canvas 2D per il tracciamento dei trend con selettore di intervallo temporale (7, 30 e 90 giorni).
- **Grafico a Ciambella (Donut Chart):** Rappresentazione della distribuzione dei dati con legenda dinamica coordinata.
- **Registro Transazioni:** Tabella dettagliata per il monitoraggio dei flussi con indicatori visivi basati sullo stato delle operazioni.
- **Design Responsive:** Interfaccia utente flessibile adattabile a qualsiasi risoluzione desktop e mobile.
- **Zero Dipendenze:** Nessuna libreria esterna (es. Chart.js, D3.js) per garantire la massima efficienza e tempi di caricamento minimi.

---

## Architettura Tecnica

- **Frontend:** HTML5, CSS3 (Flexbox/Grid, CSS Variables)
- **Engine Grafico:** JavaScript ES6+ nativo, Canvas 2D API
- **Ottimizzazione Retina:** Gestione dinamica tramite `devicePixelRatio` per garantire nitidezza ad alta risoluzione su display HiDPI.

---

## Installazione e Utilizzo Locale

1. Clonare il repository:
   ```bash
   git clone [https://github.com/nowii-core/Dashboard.git](https://github.com/nowii-core/Dashboard.git)
