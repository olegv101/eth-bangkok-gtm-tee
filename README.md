## Getting Started
First install and run docker desktop, make sure it is the most up to date version 4.35+ (it may error if not)

Create the .env with the private key albert gives you
`cp .env.example .env`

Run the TEE Attestation Simulator:

```bash
docker run --rm -p 8090:8090 phalanetwork/tappd-simulator:latest
```

Next, download the dependencies with `yarn`

```shell
yarn
```

Build the docker image
```shell
docker build -t your-dapp:latest .
```

After the build is successful, run your docker image to connect to the TEE Attestation Simulator
> NOTE: Your docker image hash will be different than the one listed below.
```shell
docker run --rm -p 3000:3000 your-dapp:latest
```

To make sure everything works
- Go to http://localhost:3000/
- Grab a tweet id from twitter, ie `1582121408548651009` from https://x.com/ParadigmEng420/status/1582121408548651009
- Enter it hit sign transaction
- check the logs of docker, it should give some accurate tweet view count, ignore the rest
- it should look something like this:
https://app.warp.dev/block/pPDCeaUu2Efx454vIOxYSq

--------------------------------
## Related Necessary Repositories

This repo works in conjuction with the frontend repo linked below. The smart contracts are also deployed and stored in a repo linked below.

- Frontend UI: [dstack-sim-explorer](https://github.com/dstack-js/dstack-sim-explorer) - npm i && npm run dev
- Smart Contracts: [dstack-contracts](https://github.com/dstack-js/dstack-contracts) - solidity smart contracts

To run the complete system:

1. First set up and run this backend service following the instructions above
2. Clone and set up the frontend repo following its README instructions

The components work together to make.
