# Setting Up for Development

We're using [hardhat](hardhat.org) as our main project management tool, with which we compile contracts, run unit tests, and perform deployments.

We're also using [Slither][] from the [Trail of Bits contract security toolkit][tob-suite] for stronger static analysis.

Maybe we'll set up [Echidna][], too...

To run the entire compilation and testing environment, you'll need to set up all of these.

[echidna]: https://github.com/crytic/echidna
[slither]: https://github.com/crytic/slither
[tob-suite]: https://blog.trailofbits.com/2018/03/23/use-our-suite-of-ethereum-security-tools/

These instructions assume you already have standard installations of `node`, `npm`, and `python3`.

## Basic Setup

Set up yarn and hardhat, so you can compile and run basic tests:

```bash
yarn install
yarn prepare
cp .env.example .env
```

Get Alchemy API keys and fill them into .env. (Team members can use the Reserve keys; ask another team member over Signal.)

All of `yarn compile`, `yarn test`, and `yarn devchain` do sensible things.

## Setup Trail of Bits Tools

**solc-select**

The [Trail of Bits tools][tob-suite] require solc-select. Check [these installation instructions](https://github.com/crytic/solc-select) to ensure you have all pre-requisites. Then install solc-select, and set the version to `0.8.4`:

```bash
pip3 install solc-select
solc-select install 0.8.4
solc-select use 0.8.4
```

**slither**

Once `solc-select` is set up, install slither with:

```bash
pip3 install -U slither-analyzer  # -U for upgrade, in case you've installed an old version.
```

At this point, `slither` will be usable in your environment.

- A reasonable slither check will happen if you run `yarn slither`.
- Use slither's [triage mode][] with `yarn slither --triage`.
- For advanced usage and warning triage, deal with slither [directly][slither usage].

[triage mode]: https://github.com/crytic/slither/wiki/Usage#triage-mode-1
[slither usage]: https://github.com/crytic/slither/wiki/Usage
