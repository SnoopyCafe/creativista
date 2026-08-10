import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const indexPath = path.join(root, 'index.html');
const imagesPath = path.join(root, 'images');
const html = await readFile(indexPath, 'utf8');
const results = [];

function assert(name, condition, detail) {
  results.push({ name, pass: Boolean(condition), detail });
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] ?? null;
}

function withoutCommentsAndScripts(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '');
}

const h1Count = (html.match(/<h1\b/gi) ?? []).length;
assert('exactly one <h1>', h1Count === 1, `found ${h1Count}`);

const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
const imagesWithoutAlt = imgTags.filter((tag) => !(attr(tag, 'alt') ?? '').trim());
assert('every <img> has non-empty alt', imgTags.length > 0 && imagesWithoutAlt.length === 0, `${imgTags.length} images checked; ${imagesWithoutAlt.length} missing/empty`);

const svgTags = html.match(/<svg\b[^>]*>/gi) ?? [];
const visibleSvgs = svgTags.filter((tag) => attr(tag, 'aria-hidden') !== 'true');
assert('every decorative <svg> has aria-hidden="true"', visibleSvgs.length === 0, `${svgTags.length} SVGs checked; ${visibleSvgs.length} missing aria-hidden`);

const landmarks = ['header', 'nav', 'main', 'footer'];
const missingLandmarks = landmarks.filter((tag) => !new RegExp(`<${tag}\\b`, 'i').test(html));
assert('<header>, <nav>, <main>, <footer> landmarks present', missingLandmarks.length === 0, missingLandmarks.length ? `missing ${missingLandmarks.join(', ')}` : 'all four present');

const focusableTags = html.match(/<(?:a\b[^>]*href\s*=|button\b|input\b|select\b|textarea\b)[^>]*>/gi) ?? [];
const firstFocusable = focusableTags[0] ?? '';
assert('skip link to #main is first focusable element', /^<a\b/i.test(firstFocusable) && attr(firstFocusable, 'href') === '#main', firstFocusable || 'no focusable element found');

const visibleHtml = withoutCommentsAndScripts(html);
const phoneAnchors = visibleHtml.match(/<a\b[^>]*href=["']tel:\+19548336672["'][^>]*>[\s\S]*?<\/a>/gi) ?? [];
const visiblePhoneCopies = visibleHtml.match(/954-833-6672/g) ?? [];
const linkedPhoneCopies = phoneAnchors.flatMap((anchor) => anchor.match(/954-833-6672/g) ?? []);
const strayCanonicalPhone = visibleHtml.replace(/href=["']tel:\+19548336672["']/gi, '').includes('+19548336672');
assert('phone number appears only in tel:+19548336672 links', phoneAnchors.length > 0 && visiblePhoneCopies.length === linkedPhoneCopies.length && !strayCanonicalPhone, `${phoneAnchors.length} tel links; ${visiblePhoneCopies.length - linkedPhoneCopies.length} bare display copies`);

const email = 'info@creativistalearning.org';
const emailAnchors = visibleHtml.match(/<a\b[^>]*href=["']mailto:info@creativistalearning\.org["'][^>]*>[\s\S]*?<\/a>/gi) ?? [];
const visibleEmailCopies = visibleHtml.match(/info@creativistalearning\.org/gi) ?? [];
const linkedEmailOccurrences = emailAnchors.reduce((sum, anchor) => sum + (anchor.match(/info@creativistalearning\.org/gi) ?? []).length, 0);
assert('email appears only as a mailto link', emailAnchors.length > 0 && visibleEmailCopies.length === linkedEmailOccurrences, `${emailAnchors.length} mailto links; ${visibleEmailCopies.length - linkedEmailOccurrences} unlinked occurrences`);

const forbidden = ['images.pexels.com', 'creativistalearning.org/_assets'];
const foundForbidden = forbidden.filter((value) => html.includes(value));
assert('no forbidden remote image hosts', foundForbidden.length === 0, foundForbidden.length ? `found ${foundForbidden.join(', ')}` : 'zero forbidden occurrences');

const references = [];
for (const tag of html.match(/<(?:img|script|link|a|source)\b[^>]*>/gi) ?? []) {
  for (const name of ['src', 'href']) {
    const value = attr(tag, name);
    if (value) references.push(value);
  }
  const srcset = attr(tag, 'srcset');
  if (srcset) {
    for (const item of srcset.split(',')) references.push(item.trim().split(/\s+/)[0]);
  }
}

const localReferences = [...new Set(references.filter((value) => !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(value)))];
const missingFiles = [];
for (const reference of localReferences) {
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  try {
    const file = await stat(path.resolve(root, clean));
    if (!file.isFile()) missingFiles.push(reference);
  } catch {
    missingFiles.push(reference);
  }
}
assert('every local src/href/srcset file exists', missingFiles.length === 0, missingFiles.length ? `missing ${missingFiles.join(', ')}` : `${localReferences.length} unique files checked`);

async function shippedImageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '_src') continue;
    const itemPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await shippedImageFiles(itemPath));
    if (entry.isFile()) files.push(itemPath);
  }
  return files;
}

const shippedImages = await shippedImageFiles(imagesPath);
let imageBytes = 0;
for (const file of shippedImages) imageBytes += (await stat(file)).size;
const imageLimit = 900 * 1024;
assert('total shipped images are under 900 KB', imageBytes < imageLimit, `${shippedImages.length} files; ${imageBytes} bytes (${(imageBytes / 1024).toFixed(1)} KiB), limit ${imageLimit} bytes; images/_src excluded as non-shipped source material`);

for (const [index, result] of results.entries()) {
  console.log(`${result.pass ? 'PASS' : 'FAIL'} ${index + 1}/10: ${result.name} - ${result.detail}`);
}

const failures = results.filter((result) => !result.pass);
if (failures.length) {
  console.error(`FAIL SUMMARY: ${failures.length} of ${results.length} assertions failed.`);
  process.exitCode = 1;
} else {
  console.log(`PASS SUMMARY: ${results.length}/${results.length} assertions passed.`);
}
