---
layout: default
title: Rust Genomics
name: Rust Genomics
category: Libraries
---

rust-genomics is a general purpose genetics and genomics library
aimed at researchers who want to leverage the powerful Rust language
to do research and build tools for other researchers. 

This is not necessarily a toolset for exploratory analysis,
I believe that there are better packages for that. This library is
for when you want to build a rock solid and fast pipeline
or tool. 

To cite rust-genomics please use:

```
  David Folarin (2020). rust-genomics: A Genomics Library for the Rust Language
  https://davefol.com/projects/rust-genomics

  Bibitext: 
  @Manual{
    title = {rust-genomics: A Genomics Library for the Rust Language}
    author = {David Folarin},
    year = {2020},
    url = {https://davefol.com/projects/rust-genomics},
  }
```

rust-genomics is listed in [crates.io](https://crates.io/crates/genomics) as "genomics".
The library is still young, and open to contributions. Once there are more contributors than
me, I'll either change the citation to list all contributors or change the author
to the "rust-genomics core team". 

This package is insipired by the [adgenet](https://cran.r-project.org/web/packages/adegenet/index.html)
and [poppr](https://grunwaldlab.github.io/poppr/) R libraries and many discussions with
my girlfriend, a PhD candidate in plant genomics. 

The core of the library is a set of common data structures, ways to input, transform, and output
those data structures, and tried and true computations, and algorithms on those data structures. 

I plan to support a laundry list of features, including but not limited to:
- Genetic distances
- SNPs from genomic alignments
- Discriminant Analysis of Principal Components
- Index of Association
- Support for SAM format
- Global alignment like BWA
- Local alignment 
- Assembly pipeline
- BLAST pipeline

Feel free to make a [feature request](https://github.com/davefol/rust-genomics/issues).
