import { ChainInfo } from "./keplr";

export const addressPrefix = "nois";

export const noisTestnet: ChainInfo = {
  chainId: "nois-testnet-005",
  chainName: "Nois Testnet",
  rpc: "https://nois-testnet-rpc.polkachu.com:443",
  rest: "https://nois-testnet-api.polkachu.com:443",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "nois",
    bech32PrefixAccPub: "noispub",
    bech32PrefixValAddr: "noisvaloper",
    bech32PrefixValPub: "noisvaloperpub",
    bech32PrefixConsAddr: "noisvalcons",
    bech32PrefixConsPub: "noisvalconspub",
  },
  currencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
      coinGeckoId: "unknown",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
      coinGeckoId: "unknown",
      gasPriceStep: {
        low: 0.05,
        average: 0.05,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "NOIS",
    coinMinimalDenom: "unois",
    coinDecimals: 6,
    coinGeckoId: "unknown",
  },
  features: [],
};

export const noisMainnet: ChainInfo = {
  ...noisTestnet,
  chainId: "nois-1",
  chainName: "Nois",
  rpc: "https://rpc.cosmos.directory/nois/",
  rest: "https://rest.cosmos.directory/nois/",
};
