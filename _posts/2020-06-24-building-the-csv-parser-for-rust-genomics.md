---
layout: post
title: Building the CSV Parser for Rust Genomics
date: 2020-06-24 22:46 -0400
---
I've drank the kool-aid on [Rust](https://www.rust-lang.org/). One of the exciting things
of getting in on something at the ground level[^1] is that
you can build the tools you use use in other languages. For example
there is a great array manipulation library, [ndarray](https://github.com/rust-ndarray/ndarray)
that acts as an analog to numpy. 

Lately, I've been hacking on
the fantastic [poppr](https://grunwaldlab.github.io/poppr/) library[^2].
The authors describe it as a toolkit for doing genetics on organisms with 
"mixed modes of sexual and clonal reproduction". It dovetails nicely with the 
R genentics/genomics ecosystem, reusing many core data structures.

I think that Rust needs libraries like poppr and ecosystems like R. 
I dont *love* R as a language[^3] but I also can't remember the last time
I reached for a tool and it wasn't there. R is what I like to call, 
an "at hand"[^4] langauge. Some languages are "at hand" by having
a bloated standard library, some, like Rust, have an [awesome package 
manager](https://crates.io/). Well that last statement isn't exactly true. While Rust
*does* have an awesome package handler, it's not full to the brim like
[CRAN](https://cran.r-project.org/) is. 

Anyway, this is all a long way of saying that I'm writing a genomics library
for rust. It's on [Crates.io](https://crates.io/) allready, but It will
be at a 0.X verstion for a time while I fill it up with usefull tools.

I just finished what I hope is a half-decent[^5] API for ingesting data
into the library. It works like this: 

The `Sample` object is the core datatype of the library. It holds
all the info about your dataset and it's what you call methods on
to do work. It owns an `ndarray::Array2` to do that work[^6].

`Sample` has a function, `observe()` that takes an `Iterator` with
`type Item = Result<Observation>` and exhausts it.

`Observation` is an enum that represents information about your data,
say that an individual has an allele or belongs to some group. 

I wen't ahead and wrote a `observable::Csv` struct that implements
`Iterator` since that's a pretty common format. 

So, to actually get a usable `Sample` you can do something like. 

```{Rust}
let mut sample = Sample::new();
        sample.observe(
            CsvBuilder::new()
            .from_reader(
                Box::new("test\n0/0".as_bytes())
            )?
        );
```

`Csv` leaves the actual csv parsing to [rust-csv](https://github.com/BurntSushi/rust-csv).
What it's responsible for is taking the `StringRecord`s that rust-csv generates
and assigning them meaning. Some columns of your csv may have loci, while others
may be the name, group membership, or other meta data. `Csv` will handle
turning all of that into well-behaved `Observation`s. 

In practice, it looks like this:
```
match &fields[i] {
	Field::Name => {
	    individual = field.to_string();
	}
	Field::Locus(s) => {
	    for x in field.split(&self.separator) {
		partials
		    .push(ObservationPartial::Allele(s.into(), x.into()));
	    }
	}
	Field::Group => {
	    partials.push(ObservationPartial::Group(field.into()));
	}
...
```

Nothing too exciting. The need for an ObservationPartial enum stems from the fact
that you often don't know which individual you are observing until you observe their
name or start on the next individual. A hieararchical data format would't have this problem
but reading in a csv field by field does. 

I like this atomic, observation based architecture because it minimizes the work
that a new "Observable" type needs to do. The Sample itself has to handle what to do
when you observe an allele for the first time, and since lots of calculations are done
on the relative frequency of alleles and data may be added incrementally, it sidesteps
issues one would have with adding data that doesn't fit nicely into a "these are my loci, 
and these are my alleles" model. You can, for example, observe a group that doesn't exists in your dataset,
or write a dataformat that is upfront about all of the alleles an organism may have, not justs whats in 
this particular sample. 

It also decouples the ingestion of data from the creation of `Sample`s. I can imagine
an ecosystem with multiple datatypes for representing genomic data but that uses a common
API for ingesting that data so that we're not constantly rewriting parsers. 

That's all for this post. It's time to start implementing some actual algos. 

[^1]: If you can call 9 years after the fact "ground level".
[^2]: My girlfriend is a PhD candidate in plant genomics so I get to hear about neat genetics algos all day.
[^3]: I don't hate it either, it kept me fed through college.
[^4]: [Less vague, better writing](https://wiki.c2.com/?LargeAndSmallLanguages)
[^5]: Please ignore all the Arc<Mutex<OhGod<Why<T>>>> types lurking about.
[^6]: Yay [OpenBlas](https://www.openblas.net/)!
