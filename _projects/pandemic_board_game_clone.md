---
name: Pandemic Board Game Clone
title: Pandemic Board Game Clone
category: Applications
layout: default
---

Get the source and boot up your pandemic server here: [Terrademic](https://github.com/davefol/Terrademic)

In the early days of the [Covid-19 pandemic](https://en.wikipedia.org/wiki/COVID-19_pandemic), when many of us in the
US of A were blithely posting memes and we had not gotten quite
so familiar with our interiors, I sat at my desk, furiously tapping my phone,
checking, to see if any of [my favorite podcasts](https://www.vox.com/the-weeds) had done a deep dive of the topic
while my girlfriend chatted with her college roomates over Zoom. They were 
deciding what game to play next, the energy for [Dungeons and Dragons](https://dnd.wizards.com/dungeons-and-dragons/what-is-dd) waning.
My girlfriend suggested [Pandemic](https://www.zmangames.com/en/games/pandemic/), a cooperative board game where
your and your partners, each with a different set of special abilities, traipse around the globe, treating and doing 
research on 4(!) separate outbreaks. 

This wasn't just banter, the Padnemic board game is *really* good. The version my girlfriend and I own,
[Pandemic Legacy](https://www.zmangames.com/en/products/pandemic-legacy-season-1/) plays more like a table-top RPG,
with a story arc that reveals itself through multiple playing sessions, and a leveling system for both you
and the diseases. After a brief search, there didn't seem to be a straightforward way for friends
to play pandemic over the internet. The [official video game](https://store.steampowered.com/app/622440/Pandemic_The_Board_Game/)
sadly doesn't match the quality of its inspiration with game breaking bugs and a total lack of multiplayer over the internet. 

I chimed in at the nadir of their disappointment, saying I wouldn't mind hacking together a pandemic clone.
I said those eternally foolish words, "how hard could it be?". Thinking that I have the entire business logic, 
or rule set in my head, and what I can't remember I can easily refrence. Roughly two weeks and a mountain 
of hacky [svg click handling](https://css-tricks.com/using-svg/), [networking code](https://socket.io/), 
and close inspection of the [vanilla ruleset](https://images-cdn.zmangames.com/us-east-1/filer_public/25/12/251252dd-1338-4f78-b90d-afe073c72363/zm7101_pandemic_rules.pdf), 
netted me the working implementation. 

Javascript is not my lingua franca and this was my first foray into both [socket.io](https://socket.io/) and 
dynamic SVG creation so the code is, frankly, awful. But hey, its playable, and I think its a good reference for some 
of the [footguns](https://en.wiktionary.org/wiki/footgun) one might run into when implementing a non-trivial boardgame to javascript. 
Plus, the insight gleaned from this implementation informed many design decisions when making the [Sudoku With Friends](/projects/sudoku_with_friends) app
so I count it as a win.
