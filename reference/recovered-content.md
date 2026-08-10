# Recovered content — from the Creativista Pods WordPress backup

Source: `qjfjxcmy_27347.tar.gz` (Bluehost cPanel backup) and `localhost.sql` (phpMyAdmin dump,
table prefix `YYQ_`). Both are gitignored and must stay that way: the tarball contains
`wp-config.php` with live DB credentials, and the SQL contains `YYQ_users` (emails, password
hashes) and `YYQ_wpforms_entries` (real parent inquiry submissions). **Nothing from those two
tables is used here or may be published.**

The old site was WordPress + Elementor for **Creativista Pods** (creativistacharm.com).
Per the owner: Creativista is the parent company, and "learning pods" is a tutoring class
structure, not a separate brand.

---

## Brand assets (extracted to `images/brand/`)

| File | What |
|---|---|
| `creativista-lockup.png` | Full logo: house + sprout + sun over "CREATIVISTA PODS / WE BRING THE TEACHER TO YOU" |
| `creativista-icon.png` | Icon only, wordmark cropped off, transparent background |
| `creativista-icon-512.png` | Square padded 512×512, for favicon and OG use |

The wordmark reads "CREATIVISTA PODS" while the site brand is "Creativista Learning", so the
**icon** is the safe asset for the header; the header already renders the name as live text.

**Real tagline:** *"We bring the teacher to you."* (Supersedes the invented "Small pods. Real attention.")

### Exact brand colours, sampled from the logo

| Role | Hex | Note |
|---|---|---|
| Brand teal | `#0B3A3F` | Identical to the teal on the current Canva site. Authoritative. |
| Brand magenta | `#EA038C` | Not currently used on the built site. |
| Brand yellow | `#FFC000` | The built site's amber is already close to this. |

---

## Teacher credentials — fills the `TODO(owner)` credential placeholder

> Experience in the field of Education; degrees in Early Childhood, Elementary, ESE, etc.
> All teachers are Insured, Fingerprinted & Background checked.

Also on the old site: **Step-Up for Students Approved Provider** (Florida scholarship program).

---

## Booking

Live booking ran on **Calendly**, not Square:

```
https://calendly.com/creativistacharm
```

Framed on the old site as a "15-minute consultation with one of our Program Coordinators".

---

## Service area

Old site listed: Davie, Cooper City, Plantation, Sunrise, Weston, Southwest Ranches, Hollywood,
Pembroke Pines, Miramar, Fort Lauderdale, Coral Springs, Parkland "and surrounding cities",
with teachers also arrangeable in Palm Beach and Miami-Dade counties.

Per the owner, the built site should say **South Florida** rather than naming one town.

---

## Pricing model (no figures were published)

- One set price per learning pod, depending on the number of hours.
- The more students in a pod, the less each family pays per week.
- Sessions ran 17 weeks (e.g. Session 1: 19 Aug – 20 Dec; Session 2: 6 Jan – 9 May).

---

## FAQ — nine real questions from the old site

Lightly edited for the current offer. The built site has no FAQ at all, which is why it scored
1/40 on "Help and Documentation" in the critique.

**What is a learning pod?**
A small group of children working together to learn, explore, socialise and have fun, supervised
by a teacher or tutor. Families gather their child's friends, neighbours or classmates, and we
provide the teacher.

**How many students are in a learning pod?**
We suggest up to six children. A pod can be as small as three. We can help you form your own pod,
or your child can join an existing one.

**What is required of the host family?**
A space in your home: a play area, den, Florida room, living room, dining room, garage or
backyard. Essentially a table and five chairs. We visit first to agree the space. We supply all
the materials, art supplies and games.

**What are the qualifications of the teachers?**
Experience in the field of Education, with degrees in Early Childhood, Elementary or ESE.
All teachers are insured, fingerprinted and background checked.

**What curriculum is used?**
For the youngest pods it is play-based: books, games, arts and crafts, with pre-reading,
pre-math and STEM skills built in, alongside gross and fine motor skills and cognitive development.

**What is the cost?**
One set price per pod, depending on the number of hours. The more students in a pod, the less
each family pays per week.

**How long does each pod last?**
Pod sessions run 17 weeks.

**Where do families live?**
Across South Florida. We can also arrange a pod teacher in Palm Beach or Miami-Dade County.

**Do you provide pods for homeschooled children?**
Yes, for grades K–5. A teacher can help with core subjects or enrichment. Maintaining the
homeschool programme remains the parent's responsibility; we do not conduct annual evaluations,
but we track attendance and completed work.

---

## Conflicts left unresolved

- **Ages.** The old site said 3–10 (and Pre-K–8 on its newest page). The built site says 5–12.
  The owner did not change this, so **5–12 stands**. Worth confirming before launch.
- **Email.** Old: `info@creativistacharm.com`. Built site: `info@creativistalearning.org`.
  Still an open `TODO(owner)`.
