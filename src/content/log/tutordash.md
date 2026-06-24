---
title: "TutorDash"
subtitle: "From an auto-grader to a full SaaS platform"
summary: "An auto-grader for my own SAT worksheets that became a full SaaS platform for running a tutoring business — scheduling, digital worksheets, per-question skill tracking, AI lesson reports, and Stripe billing — now used by agencies in place of TeachWorks and TutorCruncher."
updated: "June 2026"
categories: ["Patches & UI", "Data & ML"]
sortOrder: 35
tags: ["web", "saas", "next.js", "supabase", "stripe", "ai"]
stack: ["Next.js 16 / React 19", "TypeScript", "Supabase (Postgres + RLS)", "Clerk", "Stripe Connect", "Resend", "AssemblyAI"]
demo: "https://tutordash.io"
hero: "/images/log/tutordash/landing-hero.jpg"
heroVideo: "/videos/tutordash-landing.mp4"
browserFrame: true
thumb: "/images/log/tutordash/hover-browser.png"
draft: false
---

I've tutored SAT and ACT as a side gig for a couple of years. The teaching was fun; the admin was not: (re-)scheduling lessons, sending homework, grading worksheets by hand, writing a recap email after every class, and keeping track of student progress across 10–15 students a week.

In late 2025 I built a small tool to autograde worksheets. Within a few months, that autograder became a fully fledged platform that runs the whole lifecycle of a tutoring business. It now has paying subscribers — agencies running their tutors, students, and admins on it full-time, replacing decade-old systems like TeachWorks and TutorCruncher.

## From an auto-grader to a platform

The first version took a photo of a marked-up worksheet and returned a score. I began building the platform in earnest in February. The current repo is a little under fourteen hundred commits deep across roughly four months.

This project changed the way I worked — as the surface area grew, I leaned into structured multi-agent workflows, custom skills, and cron'd audit agents sweeping the codebase for security and code reviews before I ship. Becoming truly competitive with 10- to 15-year-old legacy players as a solo developer in a matter of months reframed my perspective on these tools.

## The tutor dashboard

This is the tutor-facing side of the platform, quickly displaying upcoming lessons, outstanding homework, and monthly income. Starting a lesson opens Google Meet, pulls in lesson notes and prior context, and logs the session to the calendar automatically; you can also schedule a future lesson (which emails the student) or back-fill one you taught off-platform so it still becomes invoiceable.

<figure>
  <img src="/images/log/tutordash/dashboard-home.png" alt="The tutor dashboard: a 'Good evening, Noah' greeting, the next lesson card with a Begin lesson button, a list of assignments due with completion and correctness bars, and a week calendar." loading="lazy" decoding="async" />
  <figcaption>Next lesson, assignments due with live completion/accuracy, lessons-this-month and hours-taught counters, and the week at a glance.</figcaption>
</figure>

## Everything known about a student

Every student accumulates a record. The detail page has homework completion, average accuracy split by Math and Reading &amp; Writing, best and latest practice-test scores, vocabulary mastery, and a countdown to their registered test date. It's the CRM a tutoring business can use to see where a student is and how fast they're moving.

<div class="log-duo">
  <figure>
    <img src="/images/log/tutordash/student-detail.png" alt="A student detail page showing test date countdown, an at-a-glance row of metrics (assignments, average score, Math %, R&amp;W %, SAT best/latest, vocab streak and mastered), and collapsible Lessons, Assignments, and SAT tests sections." loading="lazy" decoding="async" />
    <figcaption>Assignments, accuracy by subject, SAT best/latest, vocab streak, and days to test, with lessons and score history underneath.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/students-list.png" alt="The students list showing one active student with next-lesson time, registered test date, days remaining, and last-seen." loading="lazy" decoding="async" />
    <figcaption>Active and inactive roster, each row carrying the next lesson, the test date, and when the student was last working.</figcaption>
  </figure>
</div>

## Worksheets and autograding

Tutors can bring their own materials — PDFs, worksheets, whatever — and a Python extraction pipeline turns them into structured, digital worksheets. Math is rendered properly with KaTeX, and each question is tagged to a skill in the SAT/ACT taxonomy. Students answer on the platform with a UI that mimics Bluebook, the platform grades everything instantly, and every question carries a written explanation. The library now spans dozens of worksheets, skill drills, and Bluebook-style practice tests across English and Math, alongside teaching study guides for the concepts behind them.

<figure>
  <img src="/images/log/tutordash/materials-list.png" alt="The materials catalog: a table of numbered worksheets with subject, question count, and skills covered, plus tabs for Worksheets, Skill Drills, and Practice Tests." loading="lazy" decoding="async" />
  <figcaption>Worksheets, skill drills, and practice tests, each numbered, subject-tagged, and labelled with the skills it covers.</figcaption>
</figure>

<div class="log-gallery">
  <figure>
    <img src="/images/log/tutordash/worksheet-functions.png" alt="A Math worksheet question rendering f(x) = (2x-1)/3 with multiple-choice options, the correct answer highlighted green, and an expandable explanation." loading="lazy" decoding="async" />
    <figcaption>A Math question with proper function notation.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/worksheet-functions-graph.png" alt="A graph-based Math question showing a downward parabola on a coordinate grid, asking for the greatest x where f(x)=0, with a worked explanation." loading="lazy" decoding="async" />
    <figcaption>Diagrams supported.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/worksheet-grammar.png" alt="An English 'Grammar Challenge: Boundaries' worksheet with passage-based punctuation questions and the correct option highlighted." loading="lazy" decoding="async" />
    <figcaption>Reading &amp; Writing items tagged to Standard English Conventions.</figcaption>
  </figure>
</div>

<figure>
  <img src="/images/log/tutordash/study-guide.png" alt="A study guide page for sentence structure explaining independent and dependent clauses, coordinating conjunctions (FANBOYS), and comma splices, with worked examples and an on-this-page outline." loading="lazy" decoding="async" />
  <figcaption>Study guides.</figcaption>
</figure>

## Skill tracking

Every question is tagged to a skill, so all work on the platform becomes a data point. The platform rolls thousands of those points into a per-student skill profile: a radar across the SAT domains, a mastery breakdown, and a confidence-weighted view of which specific skills are weakest and worth a lesson.

<div class="log-duo">
  <figure>
    <img src="/images/log/tutordash/skills-radar.png" alt="A skill analysis view: a radar chart across SAT domains alongside labelled mastery bars (Info &amp; Ideas 100%, Adv. Math 51% 'Needs Focus', etc.) and a list of weakest skills with accuracy and confidence." loading="lazy" decoding="async" />
    <figcaption>Twenty-five skills tracked.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/vocab-practice.png" alt="A vocabulary practice view showing 227 words mastered, a 4-day streak, last-7-days minutes, and a table of mastered words with definitions and attempt counts." loading="lazy" decoding="async" />
    <figcaption>Vocabulary as spaced practice.</figcaption>
  </figure>
</div>

## Automatic reports

After a lesson, the platform drafts the report. It reads the session's submissions and turns them into a parent-facing recap: what we worked on, what improved, what to practise. Every recap, reminder, and registration nudge is delivered through Resend. Lesson audio is transcribed through AssemblyAI to ground the write-up.

<div class="log-duo">
  <figure>
    <img src="/images/log/tutordash/report-detail.png" alt="A lesson report showing progress notes, a 'Skill movement' panel comparing this window to lifetime accuracy, a 'Misses by difficulty' breakdown, a pacing gauge, and a drafted parent email recap." loading="lazy" decoding="async" />
    <figcaption>The report a tutor reviews.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/reports-list.png" alt="A 'Lesson Reports' list with rows per student and lesson number, each marked Sent or Draft." loading="lazy" decoding="async" />
    <figcaption>Lesson reports.</figcaption>
  </figure>
</div>

<div class="log-duo">
  <figure>
    <img src="/images/log/tutordash/student-recap-email.png" alt="A 'Your Lesson Recap' email preview, TutorDash-branded, with things to remember from the lesson and a homework assignment." loading="lazy" decoding="async" />
    <figcaption>A branded recap with the takeaways and the homework, generated from the session and sent on approval.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/student-emails.png" alt="A 'Sent emails' log on a student page listing lesson recaps, lesson reminders, and a registration-open notice with dates." loading="lazy" decoding="async" />
    <figcaption>Recaps, reminders, and registration nudges.</figcaption>
  </figure>
</div>

## Billing &amp; payouts

Parents pay by card through Stripe Connect, landing directly in the tutor's own account. The billing surface separates *money in* (what parents owe and have paid, period by period) from *money out* (the TutorDash subscription and Stripe fees), so a tutor can see both sides of their business in one place.

<div class="log-duo">
  <figure>
    <img src="/images/log/tutordash/billing-money-in.png" alt="The billing 'Money in' view: last period settling at £1,370 paid, this period building at £840 accruing, and a list of invoices per family with period, amount, and paid status." loading="lazy" decoding="async" />
    <figcaption>Money in.</figcaption>
  </figure>
  <figure>
    <img src="/images/log/tutordash/billing-money-out.png" alt="The billing 'Money out' view: Stripe connected and active, next bill with the Pro plan line and itemised offline-payment fees." loading="lazy" decoding="async" />
    <figcaption>Money out.</figcaption>
  </figure>
</div>

## One platform, many tenants

The product is a fully fledged, multi-tenant B2B platform. A super-admin *mission control* sits across every organisation, tutor, and student on the system: projected ARR and MRR, net revenue retention, churn, active students, failed payments, and pending payouts, with auto-detected signals flagging the feedback and bug reports that need attention. Organisations have their own tutors and admins; tutors have their own students; the data boundaries are enforced in Postgres with row-level security. This turns a tool I built for myself into software other businesses can run on.

<figure>
  <img src="/images/log/tutordash/admin-mission-control.png" alt="A dark-mode super-admin 'Mission control' dashboard: ARR, MRR, net new MRR, NRR, churn, active students, failed payments and pending payouts across the top; daily revenue and net-new-MRR charts; a signals panel with feedback and bug counts; and engagement metrics." loading="lazy" decoding="async" />
  <figcaption>The multi-tenant view across every org, tutor, and student: revenue, retention, churn, and auto-detected feedback/bug signals in one place.</figcaption>
</figure>

## State of affairs

TutorDash is, for now, a side hustle rather than a full-time project — but it is a real tool out in the world, a platform with paying monthly subscribers and tutors working full-time on it. It fills a niche: the legacy platforms handle scheduling and invoicing but not skill or assignment tracking. They're pitched from the perspective of an agency admin rather than a tutor or student. I'm still expanding it as I gather feedback from the first round of users.
