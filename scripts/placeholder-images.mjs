// Downloads the temporary stock photos (Pexels, free licence, no attribution required) and
// builds the same responsive WebP sizes the admin upload will produce, plus a tiny blurred
// preview. Writes public/placeholder/* and src/content/placeholder-images.json.
//
// These are stand-ins until the foundation's own photos are uploaded through the admin.
// Usage: npm run images:placeholder
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "placeholder");
const WIDTHS = [480, 960, 1600, 2400];

// slug: [Pexels photo id, alt text]
const PHOTOS = {
  "children-waving": [33959051, "Three boys smiling and waving outdoors in a Nigerian village"],
  "classroom-smiles": [12448839, "Young pupils in blue uniforms smiling at their classroom desks"],
  "health-check": [8248293, "A health worker checks the blood pressure of a smiling elderly woman"],
  "volunteer-children": [9090746, "A volunteer leads a group of children in an outdoor activity"],
  "village-group": [17844227, "A group of children waving outside their homes in a village"],
  "students-window": [36830932, "Three secondary school students smiling by a classroom window"],
  "sewing-lagos": [38525006, "A woman in a green print dress seated beside a sewing machine in Lagos"],
  "laptop-learning": [12286603, "A young man learning on a laptop in a training room"],
  "medical-outreach": [33127835, "Health workers attending to an elderly man at a community outreach"],
  "relief-supplies": [8054617, "A young girl holding bags of relief supplies"],
  "water-pump": [39261146, "A woman in red pumping clean water from a village borehole"],
  "children-portrait": [38226076, "Smiling children gathered close together"],
  "volunteer-carrying": [8042500, "A volunteer carrying a young boy at a community event"],
  "volunteer-schoolboys": [18449721, "A volunteer standing with schoolchildren in uniform"],
  "students-reading": [34162714, "Secondary school students reading together at a desk"],
  "health-gombe": [37285156, "Health workers talking with children in a community"],
  "food-women": [34262043, "Women standing with bags of donated food"],
  "kids-pump": [28101466, "Children drawing water from a hand pump"],
  "computer-class": [16007661, "A young woman using a computer in a training class"],
  "tailor-workshop": [11645428, "A young tailor working at a sewing machine in his shop"],
  "classroom-lesson": [14554004, "Pupils following a lesson at their wooden desks"],
  "pupils-studying": [6346833, "Children studying in a classroom in Igbo-Etche"],
  "boy-uniform": [32548114, "A schoolboy in a brown uniform and blue beret"],
  "computer-teacher": [17471201, "A young instructor standing among computers in a training room"],
  "lab-teacher": [32394664, "A teacher helping a student at a computer"],
  "health-rural": [37285163, "Health workers visiting families in a rural community"],
  "health-children": [34717769, "A health worker sitting with two children outdoors"],
  "clinic-check": [30688589, "A health worker checking a patient's blood pressure in a clinic"],
  "women-gathering": [36448918, "Women in matching blue gele at a community gathering"],
  "child-well": [18682366, "A child drawing water from a hand pump"],
  "hands-water": [3030281, "Hands catching clean water from a pump"],
  "smiling-children": [38226079, "Smiling children crowding together for a photo"],
};

await mkdir(OUT, { recursive: true });
const MANIFEST = path.join(ROOT, "src", "content", "placeholder-images.json");
const previous = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));
const manifest = {};
for (const [slug, [id, alt]] of Object.entries(PHOTOS)) {
  const done = previous[slug] && (await access(path.join(OUT, `${slug}-480.webp`)).then(() => true, () => false));
  if (done) {
    manifest[slug] = { ...previous[slug], alt };
    continue;
  }
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=srgb&w=2600`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const base = sharp(input).rotate();
  const { width, height } = await base.metadata();
  const sizes = [];
  for (const w of WIDTHS.filter((w) => w <= width)) {
    const file = `${slug}-${w}.webp`;
    await base.clone().resize({ width: w }).webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, file));
    sizes.push(w);
  }
  const blur = await base.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest[slug] = {
    alt,
    width,
    height,
    sizes,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    source: `https://www.pexels.com/photo/${id}/`,
  };
  console.log(slug, width, "x", height, sizes.join(","));
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
