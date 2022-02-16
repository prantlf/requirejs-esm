# Benchmark Results

## Module Name Lookup

If a module name prefix is used to check the module names, an array lookup is faster. If a list of module names is used to check the module names, a set lookup is faster, although looking up an unknown module name not so much.

    ❯ node array-or-set.js
    Looking up module names...
      known using an array of few x 6,858,071 ops/sec ±0.34% (93 runs sampled)
      known using a set of few x 89,102,943 ops/sec ±0.25% (98 runs sampled)
      unknown using an array of few x 13,362,327 ops/sec ±0.73% (93 runs sampled)
      unknown using a set of few x 26,976,769 ops/sec ±0.79% (92 runs sampled)
      known using an array of many x 11,674,238 ops/sec ±0.78% (91 runs sampled)
      known using a set of many x 83,564,167 ops/sec ±0.63% (89 runs sampled)
      unknown using an array of many x 2,290,948 ops/sec ±0.73% (91 runs sampled)
      unknown using a set of many x 5,629,673 ops/sec ±0.62% (92 runs sampled)
      known using an array with a prefix x 33,446,324 ops/sec ±0.93% (90 runs sampled)
      known using a set with a prefix x 3,211,451 ops/sec ±0.50% (92 runs sampled)
      unknown using an array with a prefix x 3,402,690 ops/sec ±0.64% (92 runs sampled)
      unknown using a set with a prefix x 5,784,159 ops/sec ±1.00% (92 runs sampled)

Using a hand-written transformer, which does not traverse the full AST and does not offer the full language transpilation runs 20-50x faster than using a plugin for Babel.

    ❯ node transpile.js
    Transpile osparser sources...
      ast: 220 lines, 5.48 kB
      default-options: 40 lines, 1.63 kB
      detection: 173 lines, 5.87 kB
      format-message: 11 lines, 377 B
      interpreter: 448 lines, 14.06 kB
      library/assoc: 55 lines, 1.01 kB
      library/checks: 46 lines, 1.38 kB
      library/index: 88 lines, 1.88 kB
      library/list: 76 lines, 1.82 kB
      library/str: 274 lines, 7.3 kB
      library/web: 87 lines, 2.23 kB
      messages: 80 lines, 1.97 kB
      parser: 2245 lines, 71.3 kB
      tokens: 47 lines, 1.06 kB
      walker: 223 lines, 7 kB
      walkers: 225 lines, 6.2 kB
      total: 4338 lines, 130.56 kB
      esm: ast x 5,702 ops/sec ±1.77% (78 runs sampled)
      es6: ast x 154 ops/sec ±4.05% (72 runs sampled)
      esm: default-options x 55,027 ops/sec ±1.02% (83 runs sampled)
      es6: default-options x 1,062 ops/sec ±3.38% (79 runs sampled)
      esm: detection x 4,214 ops/sec ±1.44% (80 runs sampled)
      es6: detection x 158 ops/sec ±3.51% (75 runs sampled)
      esm: format-message x 103,300 ops/sec ±1.17% (84 runs sampled)
      es6: format-message x 1,099 ops/sec ±3.95% (80 runs sampled)
      esm: interpreter x 1,347 ops/sec ±1.61% (79 runs sampled)
      es6: interpreter x 54.77 ops/sec ±5.09% (60 runs sampled)
      esm: library/assoc x 19,978 ops/sec ±1.05% (87 runs sampled)
      es6: library/assoc x 387 ops/sec ±3.66% (80 runs sampled)
      esm: library/checks x 18,085 ops/sec ±0.47% (86 runs sampled)
      es6: library/checks x 367 ops/sec ±3.70% (80 runs sampled)
      esm: library/index x 9,410 ops/sec ±2.28% (78 runs sampled)
      es6: library/index x 238 ops/sec ±3.88% (75 runs sampled)
      esm: library/list x 10,739 ops/sec ±1.08% (85 runs sampled)
      es6: library/list x 240 ops/sec ±3.21% (82 runs sampled)
      esm: library/str x 2,660 ops/sec ±1.27% (83 runs sampled)
      es6: library/str x 81.06 ops/sec ±3.99% (70 runs sampled)
      esm: library/web x 9,983 ops/sec ±0.97% (87 runs sampled)
      es6: library/web x 247 ops/sec ±3.33% (78 runs sampled)
      esm: messages x 19,765 ops/sec ±1.06% (84 runs sampled)
      es6: messages x 634 ops/sec ±3.61% (83 runs sampled)
      esm: parser x 345 ops/sec ±0.91% (77 runs sampled)
      es6: parser x 17.66 ops/sec ±5.23% (35 runs sampled)
      esm: tokens x 24,145 ops/sec ±1.52% (85 runs sampled)
      es6: tokens x 473 ops/sec ±5.65% (80 runs sampled)
      esm: walker x 3,991 ops/sec ±1.30% (81 runs sampled)
      es6: walker x 110 ops/sec ±3.83% (74 runs sampled)
      esm: walkers x 3,544 ops/sec ±1.78% (82 runs sampled)
      es6: walkers x 115 ops/sec ±3.94% (66 runs sampled)
      esm: total x 166 ops/sec ±2.71% (79 runs sampled)
      es6: total x 7.23 ops/sec ±5.11% (23 runs sampled)
