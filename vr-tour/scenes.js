// ---------------------------------------------------------------------
// SCENES CONFIG
// One entry per panorama. Add more scenes here as more equirectangular
// images become available, and add hotspots (with a target scene id)
// to link them into a tour. "image" is a path relative to panorama-viewer.html.
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
// HEADING ALIGNMENT (headingOffset)
// Each panorama was shot facing whatever direction the camera happened
// to point, so lon=0 lands on a different real-world direction in every
// photo — disorienting when moving between scenes along a street.
// "headingOffset" (degrees) rotates the raw image so you can make lon=0
// mean the same real-world direction in every scene, e.g. "facing the
// way you're walking" (with lon=180 then being "facing back the way
// you came"). To calibrate a scene: pick a landmark visible in it that
// you can also identify in a neighboring, already-calibrated scene,
// click it in both, and adjust headingOffset until the reported lon in
// the new scene lines up with the same real-world direction as in the
// other scene. Defaults to 0 (no rotation) if omitted.
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
  },
  "ostersund-gagata-20": {
    image: "ostersund-gagata-20.jpg",
    headingOffset: 112.0,
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 27.8, lat: -2.5, label: "", target: "ostersund-gagata-10", entryLon: -90, entryLat: 0 },
      { lon: 206.4, lat: -0.6, label: "", target: "ostersund-gagata-50", entryLon: 90, entryLat: 0 },
    ],
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
  },
  "ostersund-gagata-90": {
    image: "ostersund-gagata-90.jpg",
    headingOffset: 244.0,
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 155.3, lat: 0.3, label: "", target: "ostersund-gagata-80", entryLon: -90, entryLat: 0 },
    ],
  },
};

const START_SCENE = "ostersund-gagata-10";
