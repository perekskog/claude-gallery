// SCENES CONFIG
// One entry per panorama. Add more scenes here as more equirectangular
// images become available, and add hotspots (with a target scene id)
// to link them into a tour. "image" is a path relative to panorama-viewer.html.
//
// TWO COORDINATE FRAMES — read this before setting any lon/lat below.
// This viewer uses lon/lat in two different senses depending on where
// they're used:
//   - startLon/startLat and a hotspot's entryLon/entryLat describe a
//     VIEWING DIRECTION. They ignore headingOffset, so once a scene is
//     calibrated (see HEADING ALIGNMENT below), lon=0 means the same
//     real-world direction in every scene.
//   - A hotspot's own lon/lat describe a PHOTO-ANCHORED point (the exact
//     spot in that image you clicked, e.g. a doorway). These marker
//     positions automatically re-render according to headingOffset, so
//     they stay glued to that same spot in the photo even if you tweak
//     headingOffset afterward.
// Click-to-log always reports a hotspot-style, photo-anchored lon/lat
// for whatever you clicked — that's the right value to paste straight
// into a hotspot's own lon/lat. If you instead want that same clicked
// direction for a startLon/entryLon (a viewing direction), first make
// sure the scene's headingOffset is already how you want it, then use
// the value the viewer was already facing when you clicked (or click
// dead-center of the view) rather than an off-center click reading.
//
// To find lon/lat values for a new hotspot: open the viewer, click the
// spot on the panorama you want to link from — the exact coordinates
// are logged to the browser console and shown on screen, ready to paste
// into a hotspot entry below.
//
// ARRIVAL DIRECTION (entryLon / entryLat, on a hotspot)
// By default, arriving at a scene via a hotspot faces that scene's own
// startLon/startLat, same as opening it directly. A hotspot can override
// this with "entryLon" (and optionally "entryLat") so the same scene
// faces a different direction depending on where you walked in from —
// e.g. arriving from the south you keep facing north (continuing the
// direction of travel), while arriving from the north you'd set a
// different hotspot (the one placed in the other scene, going the
// other way) with entryLon rotated ~180° so you again face "onward".
// Both entryLon/entryLat are optional; omit to just use the scene's
// startLon/startLat.
//
// INFO BOXES (separate from hotspots)
// "infoBoxes" is its own array, next to "hotspots", for markers that
// show a text panel instead of navigating anywhere. Each entry has its
// own attributes: { lon, lat, title, text } — no "target", no
// "label"/"entryLon" (those are hotspot-only). Clicking the marker
// toggles a small panel showing title/text. Uses the same
// photo-anchored lon/lat as hotspots (see above), so click-to-log works
// identically for placing either kind.
//
// HEADING ALIGNMENT (headingOffset)
// Each panorama was shot facing whatever direction the camera happened
// to point, so lon=0 lands on a different real-world direction in every
// photo — disorienting when moving between scenes along a street.
// "headingOffset" (degrees) rotates the raw image so you can make lon=0
// mean the same real-world direction in every scene, e.g. "facing the
// way you're walking" (with lon=180 then being "facing back the way
// you came"), or true compass north. To calibrate a scene: pick a
// landmark visible in it that you can also identify in a neighboring,
// already-calibrated scene, click it in both (photo-anchored lon from
// click-to-log), and adjust headingOffset until the direction that
// landmark now appears at (when facing it, read the current view's
// lon/lat) lines up with the same real-world direction as in the other
// scene. Set headingOffset for a scene BEFORE placing its hotspots and
// info boxes — their markers move with headingOffset changes to stay
// pinned to the photo, but the exact numbers involved are easiest to
// reason about if calibration is settled first. Defaults to 0 (no
// rotation) if omitted.
// ---------------------------------------------------------------------
const SCENES = {
  "ostersund-gagata-10": {
    // "image" is a path relative to panorama-viewer.html. Requires this
    // page to be served over http(s) (e.g. a real web server) — opening
    // it directly as a local file:// page will be blocked by the browser.
    image: "ostersund-gagata-10.jpg",
    // Rotates the raw image so lon=0 faces a chosen consistent direction
    // (e.g. "down the street"). See HEADING ALIGNMENT note above.
    headingOffset: 156.0,
    // Initial view direction in degrees (lon: 0-360, lat: -85 to 85)
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 245.7, lat: -1.1, label: "20", target: "ostersund-gagata-20", entryLon: 90, entryLat: 0  },
    ],
    infoBoxes: [
      // Example for future scenes (shows a text panel, no navigation):
      // { lon: 200, lat: -5, title: "Gamla gata 10", text: "Byggnaden uppfördes ..." }
      { lon: 244, lat: -23, title: "Gågatan/Prästgatan västerut", text: "", tilt:150 },
      { lon: 64, lat: -23, title: "Gågatan/Prästgatan österut", text: "", tilt:150 },
      { lon: 338.0, lat: 15.6, title:"Gamla Domus", text:"", tilt:90 }
    ]
  },
  "ostersund-gagata-20": {
    image: "ostersund-gagata-20.jpg",
    headingOffset: 112.0,
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 28, lat: -2.5, label: "", target: "ostersund-gagata-10", entryLon: -90, entryLat: 0 },
      { lon: 206, lat: -0.6, label: "", target: "ostersund-gagata-50", entryLon: 90, entryLat: 0 },
    ],
    infoBoxes: [
      { lon: 206, lat: -23, title: "Gågatan/Prästgatan västerut", text: "", tilt:150 },
      { lon: 26, lat: -23, title: "Gågatan/Prästgatan österut", text: "", tilt:150 }
    ]
  },
  "ostersund-gagata-50": {
    image: "ostersund-gagata-50.jpg",
    headingOffset: 335.0,
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 242.5, lat: -3.7, label: "", target: "ostersund-gagata-20", entryLon: -90, entryLat: 0 },
      { lon: 63.7, lat: 1.1, label: "", target: "ostersund-gagata-80", entryLon: 90, entryLat: 0 },
    ],
    infoBoxes: [
      { lon: 63.7, lat: -23, title: "Gågatan/Prästgatan västerut", text: "", tilt:150 },
      { lon: 243.7, lat: -23, title: "Gågatan/Prästgatan österut", text: "", tilt:150 }
    ]
  },
  "ostersund-gagata-80": {
    image: "ostersund-gagata-80.jpg",
    headingOffset: 79.0,
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 349.1, lat: -1.4, label: "", target: "ostersund-gagata-50", entryLon: -90, entryLat: 0 },
      { lon: 169.5, lat: -1.0, label: "", target: "ostersund-gagata-90", entryLon: 90, entryLat: 0 },
    ],
    infoBoxes: [
      { lon: 169.5, lat: -23, title: "Gågatan/Prästgatan västerut", text: "", tilt:150 },
      { lon: 349.5, lat: -23, title: "Gågatan/Prästgatan österut", text: "", tilt:150 }
    ]
  },
  "ostersund-gagata-90": {
    image: "ostersund-gagata-90.jpg",
    headingOffset: 244.0,
    startLon: 303,
    startLat: 0,
    hotspots: [
      { lon: 155.3, lat: 0.3, label: "", target: "ostersund-gagata-80", entryLon: -90, entryLat: 0 },
    ],
    infoBoxes: [
      { lon: 333, lat: -23, title: "Gågatan/Prästgatan västerut", text: "", tilt:150 },
      { lon: 153, lat: -23, title: "Gågatan/Prästgatan österut", text: "", tilt:150 },
      { lon: 240, lat: -5, title: "Cantina", text:"Bästa restaurangen!", tilt:90, yaw: 70, scale:0.8, push:-60 },
      { lon: 330.9, lat: -0.1, title: "Vårat hotell", text:"", tilt:90, scale:0.7 },
    ]
  },
};

const START_SCENE = "ostersund-gagata-90";
