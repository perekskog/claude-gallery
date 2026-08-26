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
// ---------------------------------------------------------------------
const SCENES = {
  "ostersund-gagata-10": {
    // "image" is a path relative to panorama-viewer.html. Requires this
    // page to be served over http(s) (e.g. a real web server) — opening
    // it directly as a local file:// page will be blocked by the browser.
    image: "ostersund-gagata-10.jpg",
    // Initial view direction in degrees (lon: 0-360, lat: -85 to 85)
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 245.7, lat: -1.1, label: "20", target: "ostersund-gagata-20" },
    ],
  },
  "ostersund-gagata-20": {
    // "image" is a path relative to panorama-viewer.html. Requires this
    // page to be served over http(s) (e.g. a real web server) — opening
    // it directly as a local file:// page will be blocked by the browser.
    image: "ostersund-gagata-20.jpg",
    // Initial view direction in degrees (lon: 0-360, lat: -85 to 85)
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 27.8, lat: -2.5, label: "", target: "ostersund-gagata-10" },
      { lon: 206.4, lat: -0.6, label: "", target: "ostersund-gagata-50" },
    ],
  },
  "ostersund-gagata-50": {
    // "image" is a path relative to panorama-viewer.html. Requires this
    // page to be served over http(s) (e.g. a real web server) — opening
    // it directly as a local file:// page will be blocked by the browser.
    image: "ostersund-gagata-50.jpg",
    // Initial view direction in degrees (lon: 0-360, lat: -85 to 85)
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 242.5, lat: -3.7, label: "", target: "ostersund-gagata-20" },
      { lon: 63.7, lat: 1.1, label: "", target: "ostersund-gagata-80" },
    ],
  },
  "ostersund-gagata-80": {
    // "image" is a path relative to panorama-viewer.html. Requires this
    // page to be served over http(s) (e.g. a real web server) — opening
    // it directly as a local file:// page will be blocked by the browser.
    image: "ostersund-gagata-80.jpg",
    // Initial view direction in degrees (lon: 0-360, lat: -85 to 85)
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 349.1, lat: -1.4, label: "", target: "ostersund-gagata-50" },
      { lon: 169.5, lat: -1.0, label: "", target: "ostersund-gagata-90" },
    ],
  },
  "ostersund-gagata-90": {
    // "image" is a path relative to panorama-viewer.html. Requires this
    // page to be served over http(s) (e.g. a real web server) — opening
    // it directly as a local file:// page will be blocked by the browser.
    image: "ostersund-gagata-90.jpg",
    // Initial view direction in degrees (lon: 0-360, lat: -85 to 85)
    startLon: 0,
    startLat: 0,
    hotspots: [
      { lon: 155.3, lat: 0.3, label: "", target: "ostersund-gagata-80" },
    ],
  },
};

const START_SCENE = "ostersund-gagata-10";
