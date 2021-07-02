#!/usr/bin/env bash

title=$1
extension=$2
today=`date +"%Y-%m-%d"`
slug=$(echo "$title" | iconv -t ascii//TRANSLIT | sed -E s/[^a-zA-Z0-9]+/-/g | sed -E s/^-+\|-+$//g | tr A-Z a-z)
post_name="$today"-"$slug".$extension
post_path=$HOME/git/davefol.github.io/_posts/$post_name

cat << EOF > $post_path 
---
layout: post
title: $title
date: $today
---
EOF

echo $post_path
