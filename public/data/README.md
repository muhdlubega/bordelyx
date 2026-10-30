# Local geography data

`npm run preprocess` builds the offline `lib/world-geography.json` and `public/data/borders.json` from bundled Natural Earth 1:110m country polygons and the original `lib/regional-geography.json` table. The graph contains all 249 ISO country/territory names plus Kosovo, with 323 symmetric borders. English country names come from the runtime's Unicode CLDR-backed `Intl.DisplayNames`, supplemented with Natural Earth names and common aliases.

A shared whole boundary segment is required; touching at a single point never creates a border. No nearest-neighbor, ferry, tunnel, or bridge-only adjacency is inferred. Small omitted islands remain recognized country entries with no land-border moves. Centers for omitted small territories are approximate display positions.

The existing game model excludes overseas shortcuts. In particular, France refers to its European territory and cannot jump to Brazil/Suriname. French Guiana is represented separately by its own ISO territory entry `GF`; it borders Brazil and Suriname. Other separately coded territories are also separate entries. Country-level disconnected territory is combined where the original model does so, including Russia's exclave and the United States' Alaska. The graph is a game abstraction, not a statement about sovereignty, border access, or disputed boundaries.

Very small borders not present in 1:110m polygons are supplemented explicitly. Primary references:

- [Natural Earth country data](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson)
- [Gibraltar government fact sheets](https://www.gibraltar.gov.gi/press/gibraltar-fact-sheets) — Gibraltar/Spain
- [EU Rafah mission](https://www.eeas.europa.eu/eubam-rafah/about-us_en) — Gaza/Egypt
- [France's overseas ministry: Guyane](https://www.outre-mer.gouv.fr/territoires/guyane) — French Guiana/Brazil/Suriname
- [Hong Kong Immigration annual report](https://www.immd.gov.hk/publications/a_report_2024/en/chapter3.html) — Hong Kong/Mainland China
- [Sint Maarten government's agreed land border](https://gis.sintmaartengov.org/arcgis/rest/services/Landborder_SintMaarten_SaintMartin/MapServer) — Saint Martin/Sint Maarten
- [South Africa Cross-Border Road Transport Agency schedule](https://www.cbrta.co.za/uploads/files/Gazette-01072022-01-JULY-2022-website.pdf) — Botswana/Zambia

Daily challenges keep their stable original 58-country starting/objective pool through `expeditionCountries`, while movement and input use the worldwide graph. Separate landmasses are intentionally disconnected. Valid names on a different landmass therefore receive normal incorrect-route feedback rather than being rejected by an input whitelist.
