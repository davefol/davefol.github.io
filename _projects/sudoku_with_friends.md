---
name: Sudoku With Friends
title: Sudoku With Friends
category: Applications
layout: default
---

Play it here: [Sudoku With Friends](http://sudoku-with-friends.com/).

My partner and I like to collaborate on the New York Times sudoku puzzles everyday.
Recently, I had to visit my mother in Louisiana and we had no good way to do the puzzle.
I decided to build [this little app](http://sudoku-with-friends.com/) so that anyone can collaborate on a classical sudoku puzzle with their friends. 
I also built a [sister chrome extension that converts the NYT sudoku puzzles into .sdk format](https://chrome.google.com/webstore/detail/new-york-times-sudoku-imp/ekhmjkmibekgoiodgnpbecpchpppjkhn).
The UI is basically identical to the NYT sudoku page.

Initially I thought about using [WebRTC](https://webrtc.org/) because I had some false notion that I wouldn't need a server but after a little research
that said otherwise I stuck to websockets, using the [socket.io](https://socket.io/) library. I've used socket.io once before to build
my [pandemic board game clone](/projects/pandemic_clone), so I was confident that I'd avoid the usual attendent footguns when using an unfamiliar library.
As it turned out, the most difficult thing was writing the markup and css to replicate the [NYT Sudoku UI](https://www.nytimes.com/puzzles/sudoku/easy).
I ended up implementing the entire thing with css [vmin units](https://css-tricks.com/fun-viewport-units/) to avoid alot of tricky layout math. 
The networking was relatively straight forward, simply sending board state on connection and sending number and candidate placement as needed.

For my usecase, its feature complete, including showing what cell your friends have connected to aid communication, behaving nicely on mobile, and highlighting conflicts.

Hope y'all enjoy, if you want to boot it up locally or help me add features the source code is available here:

[Github: Sudoku With Friends](https://github.com/davefol/sudoku-with-friends)

[Github: New York Times Sudoku Importer](https://github.com/davefol/newyork-times-sudoku-importer)
