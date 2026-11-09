---
title: "Building HP Quiz with React and Cloudflare D1"
description: "How HP Quiz keeps progress in the browser, validates shared scores on Cloudflare and publishes results only after moderation. An engineering note by Canberk Efe."
pubDate: 2026-11-08
updatedDate: 2026-11-09
tags: [react, typescript, cloudflare, application-security]
---

[HP Quiz](https://hpquiz.canberkefe.dev/) is a Harry Potter film quiz and Sorting Hat fan project. It has 60 questions for each of the eight films, quick and detailed rounds, and a 28-scenario house sorting experience. This note explains the engineering decisions behind saved progress, shared results and moderation.

The app is available through my [project catalogue](/aislop/). It is an independent fan experience, rather than an official Harry Potter test.

## Two kinds of state

A quiz needs to remember where someone stopped. That does not mean every unfinished answer needs to be sent to a server.

HP Quiz keeps the current attempt in browser storage: its stable identifier, selected questions, shuffled option order, answers and checked questions. Reloading restores the same round. A retry of missed questions is a separate attempt, so practising a difficult scene does not replace the last score from a normal round.

Shared results follow a different path. On a first Sorting Hat visit, participation is enabled with a visible opt-out before the test. The choice is remembered locally when possible. Participants can enter a display name, choose an anonymous entry, or keep their result private without entering a name. A new Hat result with participation enabled is sent for moderation automatically after security verification. Adding a film score or retrying a failed send requires the send button. Older completed Hat sessions are not enrolled automatically. Local progress remains useful even when the result service is temporarily unavailable.

There is a boundary between finishing a quiz, sending it to the server and seeing it on the public board. Those are three separate events.

## Stable IDs across the interface and the server

Every film, question, option and matching item has a stable identifier. The visible wording is separate from those identifiers. This keeps a saved answer meaningful when a sentence is edited or the interface language changes.

The browser does not submit a trusted final score. It sends the chosen question IDs and answers. A Cloudflare Pages Function compares them with the canonical question bank and calculates the score again. The Sorting Hat result is also calculated from the submitted scenario choices, rather than accepting a house name supplied by the browser.

One question is worth one point. A matching or ordering question must be completely correct to earn that point. Keeping this rule the same in the client and on the server prevents a result card and the public board from disagreeing about the same attempt.

Server calculation has limits. It validates an answer set; it cannot prove that a person solved the quiz unaided. This is a casual fan experience, not an exam or an identity-verification system.

## A submission can arrive twice

A connection can fail after the server saves a result but before the browser receives the response. A participant should be able to try again without creating a second entry.

The browser therefore saves a submission identifier before sending. Retrying uses the same identifier and payload. The server checks that the retry belongs to the same participant identity and returns the existing acceptance instead of inserting a duplicate.

Cloudflare Turnstile and bounded request limits reduce automated submission noise. They complement validation and moderation; they do not turn a browser-generated identity into proof of a unique person.

## Moderation before publication

Results are stored in Cloudflare D1 with a pending, approved or rejected status. Only approved records are returned by the public Hogwarts endpoint. A successful submission response means the server received the entry; it does not mean a moderator approved it.

The administration page uses a server-side administrator key. The key is entered into that page and kept in its running memory. It is not included in the application bundle, written into a public file, placed in a URL or saved as a browser preference.

The public list groups approved participants by house. Within each house, it compares the latest approved result for the selected film and round length. Equal numbers of correct answers share a rank. A 15-question round is not ranked against a 60-question round, and a participant with no score for that selection remains unranked.

## Usage totals are not a list of people

The app records a small set of anonymous activity totals: quiz start, quiz completion, sorting start, sorting completion and opening the share dialog. These are daily aggregates, not an event log containing names, answers or attempt identifiers. The activity window is limited to 90 days.

These totals answer a practical product question: which films and round lengths are being used? They do not answer how many distinct humans visited. Browser blocking, retries and the same person using different devices make that distinction important.

Cloudflare Web Analytics provides a separate view of visits and page views. Moderated result counts, anonymous activity counts and web traffic should be read as different measurements.

Separate records, accessible only to the administrator, track a browser tab session’s last reported page and quiz question. The browser sends a random session identifier and limited progress fields, without names, answers or private attempt URLs. The server stores an HMAC of that identifier alongside the request’s IP address and the approximate city, region and country supplied by Cloudflare. Visits remain visible for 90 days after their last report; request-triggered cleanup removes expired rows in bounded batches. The last question is the last received display state, not evidence of why someone stopped.

Newly accepted result submissions also have a separate private network record. Retrying the same submission does not overwrite its original details. Older submissions remain without that metadata because it was not collected at the time. These private fields are excluded from the public board and its JSON export.

## Audio and saved progress need visible recovery

An opening cue cannot assume that a browser permits audio immediately. Playback needs a visible way to start it when autoplay is blocked, a way to continue silently and an explicit replay control. A failed audio request must never prevent someone from answering a question.

The same principle applies to browser storage. A malformed record should not leave the application stuck on an error page. The quiz validates its saved shape and can continue with an in-memory fallback when persistent storage is unavailable.

For local testing, the user-facing preview serves an immutable production snapshot. Editing a question bank in the development server therefore does not refresh a quiz someone is currently taking.

## What I verified

The checks cover question and answer identifiers, score calculation, house ties, saved question order, refreshing an unfinished attempt, storage failures, repeated submissions and public visibility after moderation. The layout is also checked at narrow mobile widths and with reduced motion enabled.

The production submission path was tested through a normal browser: a deliberately created test result passed Turnstile, entered the pending queue, appeared publicly after approval and was then excluded from the public list. Existing participant results were not used as test fixtures.

You can [try HP Quiz](https://hpquiz.canberkefe.dev/), read [about my work](/about/), or explore [Laşatemikantare and the project catalogue](/aislop/).
