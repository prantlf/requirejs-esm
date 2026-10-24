# Benchmark Results

## Module Name Lookup

If a module name prefix is used to check the module names, an array lookup is faster. If a list of module names is used to check the module names, a set lookup is faster, although looking up an unknown module name not so much.

    ❯ node array-or-set.js
    Looking up module names...
      known using an array of few x 14,605,353 ops/sec ±1.30% (84 runs sampled)
      known using a set of few x 216,092,807 ops/sec ±2.42% (89 runs sampled)
      unknown using an array of few x 93,639,092 ops/sec ±1.39% (78 runs sampled)
      unknown using a set of few x 78,218,911 ops/sec ±1.05% (95 runs sampled)
      known using an array of many x 20,390,033 ops/sec ±0.97% (90 runs sampled)
      known using a set of many x 196,539,991 ops/sec ±2.42% (87 runs sampled)
      unknown using an array of many x 8,325,398 ops/sec ±1.18% (86 runs sampled)
      unknown using a set of many x 18,873,059 ops/sec ±0.50% (98 runs sampled)
      known using an array with a prefix x 62,486,605 ops/sec ±0.96% (90 runs sampled)
      known using a set with a prefix x 8,665,051 ops/sec ±0.38% (95 runs sampled)
      unknown using an array with a prefix x 26,626,853 ops/sec ±0.91% (90 runs sampled)
      unknown using a set with a prefix x 20,796,922 ops/sec ±0.34% (96 runs sampled)

Using a hand-written transformer, which does not traverse the full AST and does not offer the full language transpilation runs 20-50x faster than using a plugin for Babel.

    ❯ node transpile.js
    Transpile osparser sources...
      ast: 220 lines, 5.49 kB
      default-options: 40 lines, 1.63 kB
      detection: 173 lines, 5.87 kB
      format-message: 11 lines, 377 B
      interpreter: 448 lines, 14.07 kB
      library/assoc: 55 lines, 1.02 kB
      library/checks: 46 lines, 1.38 kB
      library/index: 88 lines, 1.89 kB
      library/list: 76 lines, 1.82 kB
      library/str: 274 lines, 7.3 kB
      library/web: 87 lines, 2.23 kB
      messages: 80 lines, 1.97 kB
      parser: 2245 lines, 71.32 kB
      tokens: 47 lines, 1.06 kB
      walker: 223 lines, 7 kB
      walkers: 225 lines, 6.2 kB
      total: 4338 lines, 130.63 kB
      esm: ast x 6,186 ops/sec ±0.48% (89 runs sampled)
      es6: ast x 1,352 ops/sec ±1.17% (91 runs sampled)
      esm: default-options x 153,282 ops/sec ±0.69% (85 runs sampled)
      es6: default-options x 7,190 ops/sec ±1.18% (91 runs sampled)
      esm: detection x 12,344 ops/sec ±0.24% (91 runs sampled)
      es6: detection x 1,416 ops/sec ±0.87% (93 runs sampled)
      esm: format-message x 349,912 ops/sec ±0.37% (86 runs sampled)
      es6: format-message x 7,915 ops/sec ±1.02% (92 runs sampled)
      esm: interpreter x 4,760 ops/sec ±0.48% (88 runs sampled)
      es6: interpreter x 396 ops/sec ±1.60% (82 runs sampled)
      esm: library/assoc x 57,693 ops/sec ±0.78% (82 runs sampled)
      es6: library/assoc x 2,861 ops/sec ±0.86% (91 runs sampled)
      esm: library/checks x 59,750 ops/sec ±0.45% (92 runs sampled)
      es6: library/checks x 2,742 ops/sec ±1.27% (91 runs sampled)
      esm: library/index x 25,144 ops/sec ±0.49% (81 runs sampled)
      es6: library/index x 1,907 ops/sec ±1.34% (92 runs sampled)
      esm: library/list x 34,616 ops/sec ±0.22% (88 runs sampled)
      es6: library/list x 1,867 ops/sec ±1.09% (92 runs sampled)
      esm: library/str x 9,369 ops/sec ±0.30% (87 runs sampled)
      es6: library/str x 611 ops/sec ±1.06% (90 runs sampled)
      esm: library/web x 32,669 ops/sec ±1.12% (87 runs sampled)
      es6: library/web x 1,934 ops/sec ±1.15% (91 runs sampled)
      esm: messages x 66,455 ops/sec ±0.32% (88 runs sampled)
      es6: messages x 4,850 ops/sec ±1.07% (89 runs sampled)
      esm: parser x 1,482 ops/sec ±0.68% (91 runs sampled)
      es6: parser x 127 ops/sec ±1.54% (74 runs sampled)
      esm: tokens x 28,999 ops/sec ±0.37% (83 runs sampled)
      es6: tokens x 3,851 ops/sec ±0.76% (94 runs sampled)
      esm: walker x 9,482 ops/sec ±0.30% (90 runs sampled)
      es6: walker x 869 ops/sec ±0.87% (90 runs sampled)
      esm: walkers x 12,098 ops/sec ±0.35% (89 runs sampled)
      es6: walkers x 915 ops/sec ±0.97% (92 runs sampled)
      esm: total x 545 ops/sec ±3.65% (85 runs sampled)
      es6: total x 54.00 ops/sec ±1.42% (72 runs sampled)
