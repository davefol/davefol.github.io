---
name: Poker Range Trainer
title: Poker Range Trainer
layout: default
category: Applications
---

Get the source and build it here: [Poker Range Trainer](https://github.com/davefol/Poker-Range-Trainer)

I started playing [No Limit Hold'em](https://en.wikipedia.org/wiki/Texas_hold_%27em) for the first time since college. 

Boy do I suck. I don't remember the game being this difficult when I was a college sophomore. 
Back then I picked up poker has an alternative to chess. I got bored drilling tactics for months only to have
my father, who played high ranked collegiate chess in Nigeria, absolutely evicerate me when I visited home. 
Poker felt close enough to the same headspace as chess to make it feel natural, but subersive enough
that I got to feel a little like a rebel at a time when I was still enrolling in classes soley at my parents direction. 

One of the first things you learn when you're tired of losing money playing hold'em is how to select starting hands. 
This is the first decision you make and has huge ramifications for your [EV](https://www.cardschat.com/poker-odds-expected-value.php).
While selecting which hands to open (make the first bet), call (match the current bet), limp (match the big blind when no one has bet yet), 
re-raise, 3-bet, 4-bet, limp behind (there are a surprisingly large number of actions you can take before any community cards are shown), 
is complicated and depends on many dynamic factors, a rough set of hands, or range, can be usefull when getting your bearings. 

The Range Trainer app is meant to ease the process. I started it as an alternative to filling up an anki deck with tons of 
notes. It employs spaced repetition and a custon range editor. I've started to add more questions, primarily based
on odds calculation into the mix. I hope to eventually build out an entire virtual table, where different 
poker sitations are rapidly presented as a way to train seriously away from the table. 

The whole thing is built using [Rust](https://www.rust-lang.org/) a language that I've been falling in love with for
the past year, and the [iced gui framework](https://github.com/hecrj/iced). I think I'll be contributing to iced
sooner rather than later as its a great but young framework. 

Give the app a try. If you need some ranges, I recommend [The Grinder's Manual](https://www.amazon.com/Grinders-Manual-Complete-Course-Online-ebook/dp/B01GBFF890).
