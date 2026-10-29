// Welch Bros Hauling — shared settings for the website (index.html) and the
// crew quote tool (crew.html). Change prices and the phone number HERE only.

const PHONE = "(334) 555-0123";          // PLACEHOLDER: put the real business line here
const BOOKING_ENDPOINT = "";             // Google Apps Script Web App URL (see SETUP.md). Empty = preview mode.

// Load sizes, by how much of the ~11 cu yd dump trailer the job fills.
// Mirrors the Pricing tab of Junk_Removal_Pricing_and_Costs.xlsx.
const LOADS = [
  {id:"single", name:"Single item",  short:"1 item", fill:.06, price:89,  sub:"One couch, fridge, or mattress set"},
  {id:"eighth", name:"1/8 trailer",  short:"1/8",    fill:.125,price:119, sub:"A few big items"},
  {id:"quarter",name:"1/4 trailer",  short:"1/4",    fill:.25, price:179, sub:"Small room or garage corner"},
  {id:"half",   name:"1/2 trailer",  short:"1/2",    fill:.5,  price:299, sub:"Garage or basement cleanout"},
  {id:"three",  name:"3/4 trailer",  short:"3/4",    fill:.75, price:419, sub:"Several rooms"},
  {id:"full",   name:"Full trailer", short:"Full",   fill:1,   price:549, sub:"Whole-house or estate cleanout"},
];
const ADDONS = [
  {id:"mattress", name:"Mattress / box spring", price:25},
  {id:"tire",     name:"Tire",                  price:10},
  {id:"freon",    name:"Fridge, freezer or AC unit", price:40},
];
const STAIRS = 25, AUBURN_TRAVEL = 50;

// Crew tool only: heavy debris (concrete, dirt, shingles, tile) is charged per
// estimated ton ON TOP of the load price — covers the dump's weight charge plus
// the extra labor. Dump fee is ~$45/ton (placeholder until the dumps are called).
const HEAVY_PER_TON = 120;

// Crew tool: names in the "Who's quoting" list.
const CREW = ["Braxton", "Brother 2", "Brother 3"];   // PLACEHOLDER: real names
