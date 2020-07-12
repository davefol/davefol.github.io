---
layout: post
title: Writing a script that makes one commit a day
date: 2020-07-11 20:13 -0400
---

I have this script that runs a command that changes
one file in a git repo and commits it. 

```bash
#!/usr/bin/env bash

git stash
/Users/davefol/Projects/davefol.github.io/scripts/update_diary.py
git add $DIARY_FILE
git commit -m "updated diary"
git push
git stash apply
git add $DIARY_FILE
```

All it does is shove everything that I'm working on 
to the side (`git stash`), run the `update_diary.py`
script (reads emails from and inbox), then commits the changes,
pushes, and pulls back my workspace. 

The only thing tricky is that you have to
re add the changed file to the workspace after, since it 
creates a merge conflict. 

`cron` runs this script once a day at 5am. 

The net result is, I can text my self diary entries
and have them automatically appear [on the site](/diary).
