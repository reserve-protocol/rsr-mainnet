Weights and Balance Crossings
=============================

First of all, we want the balances from oldRSR to simply *be* the balances for this
RSR. You could imagine doing that by using a straightforward copy-on-write system, as
described at https://w.wiki/4ZBL .

----

But it's not that simple; for a handful of addresses, we also need to change the
owning address, and we sometimes need to divvy the balance at an old address among
several new addresses.  To accommodate this, we set up a matrix of weights to be
consulted during the "copy" step of that copy-on-write, which we configure after we
deploy this RSR contract and before we pause-and-transition balances from the old RSR
contract.

Instead, imagine for a moment that we have a matrix totalWeights, of type
mapping(address => mapping(address => uint16)). By default, we start with

    totalWeights[old][new] == (old == new) ? WEIGHT_ONE : 0

Before transitions, every time the admin calls siphon(old, prev, to, weight), we do

    totalWeights[old][prev] -= weight;
    totalWeights[old][to]   += weight;

When we read new balances, then, for any address A, the inherited balanceOf(A) is:

    sum_{all addresses B} ( totalWeights[B][A] * oldRSR.balanceOf(B) / WEIGHT_ONE; )

----

But it's not quite that simple, either. Because gas, we don't want to initialize a
matrix with at least one nonzero values for each address that holds some RSR, so we
don't directly represent totalWeights. Instead, we actually store `weights` and
`hasWeights`. The effective `totalWeights` value can be computed as follows:

   totalWeights(A,B) == (hasWeights[A] ? weights[A][B] : ( (A == B) ? WEIGHT_ONE : 0 )

----

Allowance crossings don't need weighted many-to-many distributions, and are thus much
simpler.

