
export const CHAIN_NODE = process.env.CHAIN_NODE ||  "wss://wss.api.moonriver.moonbeam.network";
// export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0x649378326bE1b7F7a92849DE5545A05Dee506BaB".toLowerCase();
export const MOONSAMA_ADDRESS = process.env.MOONSAMA_ADDRESS || "0xb654611f84a8dc429ba3cb4fda9fad236c505a1a".toLowerCase();
export const PONDSAMA_ADDRESS = process.env.PONDSAMA_ADDRESS || "0xe4edcaaea73684b310fc206405ee80abcec73ee0".toLowerCase();
export const PLOT_ADDRESS = process.env.PLOT_ADDRESS || "0xa17a550871e5f5f692a69a3abe26e8dbd5991b75".toLowerCase();
export const MOONX_ADDRESS = process.env.MOONX_ADDRESS || "0x1974eeaf317ecf792ff307f25a3521c35eecde86".toLowerCase();
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0x1b30a3b5744e733d8d2f19f0812e3f79152a8777".toLowerCase();
export const ART_ADDRESS = process.env.BLVCK_ADDRESS || "0xdea45e7c6944cb86a268661349e9c013836c79a2".toLowerCase();
export const BOX_ADDRESS = process.env.BOX_ADDRESS   || "0xd335417999ff2b9b59737244e554370264b3f877".toLowerCase();
export const EMBASSY_ADDRESS = process.env.EMBASSY_ADDRESS || "0x0a54845ac3743c96e582e03f26c3636ea9c00c8a".toLowerCase();

export const MOONSAMA_HEIGHT = 568970;
export const PONDSAMA_HEIGHT = 1992976;
export const PLOT_HEIGHT = 1241477;
export const MOONX_HEIGHT = 664200;
export const FACTORY_HEIGHT = 827439;
export const ART_HEIGHT = 1027541;
export const BOX_HEIGHT = 1402610;
export const EMBASSY_HEIGHT = 1527496;

// export const MOONSAMA_HEIGHT = process.env.MOONSAMA_HEIGHT || 568970;
// export const PONDSAMA_HEIGHT = process.env.PONDSAMA_HEIGHT || 1992976;
// export const PLOT_HEIGHT = process.env.PLOT_HEIGHT || 1241477;
// export const MOONX_HEIGHT = process.env.MOONX_HEIGHT || 664200;
// export const FACTORY_HEIGHT = process.env.FACTORY_HEIGHT || 827439;
// export const ART_HEIGHT = process.env.ART_HEIGHT || 1027541;
// export const BOX_HEIGHT = process.env.BOX_HEIGHT || 1402610;
// export const EMBASSY_HEIGHT = process.env.EMBASSY_HEIGHT || 1527496;


export const UPDATE_RATE = BigInt(process.env.UPDATE_RATE || 6*60*60*1000); // 6 hours
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const TOKEN_RELATIONS = {
    metadata: true,
    contract: true,
    owner: true
  }