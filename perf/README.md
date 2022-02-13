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
