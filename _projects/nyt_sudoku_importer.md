---
name: New York Times Sudoku Importer
title: New York Times Sudoku Importer
layout: default
category: Applications
---

Get the chome extenstion here: [New York Times Sudoku Importer](https://chrome.google.com/webstore/detail/new-york-times-sudoku-imp/ekhmjkmibekgoiodgnpbecpchpppjkhn).

While building my [sudoku with friends app](http://sudoku-with-friends.com/), I ran into the issue of actually
loading sudoku puzzles into the app. At first I thought I would add a function to the backend that scrapes the 
three [daily New York Times Sudoku puzzles](https://www.nytimes.com/puzzles/sudoku/easy) and offer them as options to users,
since thats the puzzle I usually do. This meant bringing in extra dependencies like [axios](https://www.npmjs.com/package/axios), for
making page requests. In fact, the NYT sudoku puzzle seems to make some Ajax requests to set everything up, so a plain get
request from axios won't cut it. I'd need to use a more complex solution like [pupeteer](https://github.com/puppeteer/puppeteer), which
would pull along an entire chrome binary into the mix. Yuck. 

Instead I opted for a more modular solution. An entirely separate
standalone program, in this case, a chrome extension, that would convert the puzzles into an amenable format. After a short 
google search, I found the [.sdk](https://www.sudocue.net/fileformats.php) format. Essentially, write out a sudoku puzzle, using 
period of blanks, line by line. This felt like a one-liner and had the added benefit that my app gets all the 
.sdk's out there for free. 

To use it, simply navigate to the NYT sudoku page and click the extension in the toolbar. That creates a popup with the .sdk text.
