# Costa del Sol Guide

Kompletter Reiseplan für Torremolinos und Andalusien, **31.08.–10.09.2026**.
Eine einzelne, offline-taugliche Webseite — gebaut, um sie unterwegs auf dem Handy zu benutzen.

## Live

👉 **https://pelalonuss.github.io/costa-del-sol-guide/**

## Was drin ist

| Bereich | Inhalt |
|---|---|
| **Übersicht** | Sofort-To-dos, Hotel- und Standortinfos, Wettervorhersage für genau diese Tage, die 12 wichtigsten Spartipps |
| **Die 11 Tage** | Tag für Tag mit Zeitleiste, echten Kosten, Parkplätzen und den Fallen, die genau dort lauern |
| **Essen** | Menú-del-día-Strategie, konkrete Adressen, Gerichte mit Preisen, Touristenfallen erkennen, Rechnungs-Tricks |
| **Shopping** | Marktkalender für jeden einzelnen Reisetag, Outlets, Vintage-Läden in Málaga |
| **Achtung** | Betrugsmaschen, Kamera- und Autosicherheit, Radarfallen, Umweltzonen, Drohnenrecht, Notfallnummern |
| **Budget** | Gesamt- und Tagesbudget, Einzelpreise aller Aktivitäten |
| **Extras** | Optionale Ausflüge, Content-Plan, Packliste, Spanisch-Spickzettel |

## Features

- **Offline nutzbar** — einmal geöffnet, funktioniert die Seite auch ohne Netz (Service Worker)
- **Als App installierbar** — im Browser auf „Zum Startbildschirm hinzufügen" tippen
- **Volltextsuche** über alle Bereiche — Treffer werden farbig markiert, gezählt und mit ‹ › durchgesprungen (Enter = nächster, Esc = beenden). Über jedem Fundort steht, aus welchem Bereich er stammt. Groß-/Kleinschreibung und Akzente sind egal: „malaga" findet auch „Málaga"
- **Abhakbare Checklisten** (Sofort-To-dos, Packliste) — Haken bleiben gespeichert
- **Der aktuelle Reisetag klappt sich automatisch auf**
- **Hell/Dunkel**, mobile-first

## Die wichtigsten Erkenntnisse aus der Recherche

- **Stierkampf:** Die Corrida Goyesca in Ronda (05.09.) ist seit April ausverkauft — Zweitmarkt ab 400 €. Die **Novillada am Fr 04.09. um 18:00 kostet ab 10 €** und ist die einzige bezahlbare Option im Zeitraum.
- **Caminito del Rey:** offiziell für den gesamten Aufenthalt ausverkauft. Es gibt zwei Hintertüren (Agentur-Kontingente, Brauerei-Paket).
- **Delfine:** Costasol Cruceros ab Puerto Marina Benalmádena, 20 € p. P., 88 % Sichtungsquote — und der Hafen ist **zu Fuß vom Hotel erreichbar**.
- **Gibraltar:** Die Seilbahn ist bis ~2027 geschlossen, die Personenkontrollen an der Landgrenze wurden im Juli 2026 abgeschafft.
- **Sonntag 06.09.** ist Gratis-Museumstag in Málaga (Alcazaba, Gibralfaro, Picasso).
- **Das Hotel** heißt seit der Renovierung *Riu Palace Nautilus* und liegt an der Carihuela, nicht am Bajondillo.

## Technik

Statisches HTML/CSS/JS, keine Abhängigkeiten, kein Build.

```
index.html            # kompletter Inhalt
style.css             # Design, Dark Mode
app.js                # Tabs, Akkordeon, Suche, Checklisten
sw.js                 # Offline-Cache
manifest.webmanifest  # als App installierbar
assets/icon.svg
research/             # das komplette Recherche-Rohmaterial (13 Themen, ~770 KB)
```

Lokal ansehen:

```bash
npx serve .
```

Im Ordner `research/` liegt das ungekürzte Rohmaterial, aus dem die Seite entstanden ist —
mit allen Quellen, Telefonnummern, Alternativen und Details, die auf der Seite keinen Platz hatten.
Nachschlagen lohnt sich, wenn vor Ort etwas anders läuft als geplant.

## Hinweis

Stand der Recherche: **29.08.2026**. Öffnungszeiten, Preise und Verfügbarkeiten ändern sich —
alles, was Geld kostet oder wo ihr hinfahrt, kurz vorher nochmal prüfen.
Stellen, an denen die Quellenlage widersprüchlich war, sind im Text mit **PRÜFEN** markiert.
