import { createBaseAccountSDK, base } from "@base-org/account";

export type BaseCapabilities = Record<string, unknown> | null;

export async function getBaseAccountCapabilities(address: string) {
  try {
    const sdk = createBaseAccountSDK({
      appName: "Base Pot",
      appChainIds: [base.constants.CHAIN_IDS.base],
    });

    const provider = sdk.getProvider();

    const capabilities = (await provider.request({
      method: "wallet_getCapabilities",
      params: [address],
    })) as BaseCapabilities;

    return capabilities;
  } catch {
    return null;
  }
}
