import { ChainInfo } from "./keplr";

export const chainId = "nois-testnet-003";

export const noisConfig: ChainInfo = {
  chainId: chainId,
  chainName: "Nois Testnet",
  rpc: "https://rpc.nois.mcbnode.online",
  rest: "https://api.nois.mcbnode.online",
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