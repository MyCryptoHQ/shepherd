import { EtherscanNode, InfuraNode, RPCNode } from '@src/nodes';
import PRPCNode from '@src/nodes/rpc';
import PEtherscanNode from '@src/nodes/etherscan';
import PInfuraNode from '@src/nodes/infura';
import { NodeConfigState, NODE_CONFIG, NodeConfigAction } from './types';
import { StaticNetworkIds } from '@src/types/networks';

export const INITIAL_STATE: NodeConfigState = {
  eth_mycrypto: {
    network: StaticNetworkIds.ETH,
    isCustom: false,
    lib: RPCNode('https://api.mycryptoapi.com/eth'),
    pLib: new PRPCNode('https://api.mycryptoapi.com/eth'),
    service: 'MyCrypto',
  },
  eth_ethscan: {
    network: StaticNetworkIds.ETH,
    isCustom: false,
    service: 'Etherscan.io',
    lib: EtherscanNode('https://api.etherscan.io/api'),
    pLib: new PEtherscanNode('https://api.etherscan.io/api'),
  },
  eth_infura: {
    network: StaticNetworkIds.ETH,
    isCustom: false,
    service: 'infura.io',
    lib: InfuraNode('https://mainnet.infura.io/mew'),
    pLib: new PInfuraNode('https://mainnet.infura.io/mew'),
  },

  rop_infura: {
    network: StaticNetworkIds.Ropsten,
    isCustom: false,
    service: 'infura.io',
    lib: InfuraNode('https://ropsten.infura.io/mew'),
    pLib: new PInfuraNode('https://ropsten.infura.io/mew'),
  },
  kov_ethscan: {
    network: StaticNetworkIds.Kovan,
    isCustom: false,
    service: 'Etherscan.io',
    pLib: new PEtherscanNode('https://kovan.etherscan.io/api'),
    lib: EtherscanNode('https://kovan.etherscan.io/api'),
  },
  rin_ethscan: {
    network: StaticNetworkIds.Rinkeby,
    isCustom: false,
    service: 'Etherscan.io',
    lib: EtherscanNode('https://rinkeby.etherscan.io/api'),
    pLib: new PEtherscanNode('https://rinkeby.etherscan.io/api'),
  },
  rin_infura: {
    network: StaticNetworkIds.Rinkeby,
    isCustom: false,
    service: 'infura.io',
    lib: InfuraNode('https://rinkeby.infura.io/mew'),
    pLib: new PInfuraNode('https://rinkeby.infura.io/mew'),
  },
  etc_epool: {
    network: StaticNetworkIds.ETC,
    isCustom: false,
    service: 'Epool.io',
    lib: RPCNode('https://mewapi.epool.io'),
    pLib: new PRPCNode('https://mewapi.epool.io'),
  },
  ubq: {
    network: StaticNetworkIds.UBQ,
    isCustom: false,
    service: 'ubiqscan.io',
    lib: RPCNode('https://pyrus2.ubiqscan.io'),
    pLib: new PRPCNode('https://pyrus2.ubiqscan.io'),
  },
  exp_tech: {
    network: StaticNetworkIds.EXP,
    isCustom: false,
    service: 'Expanse.tech',
    lib: RPCNode('https://node.expanse.tech/'),
    pLib: new PRPCNode('https://node.expanse.tech/'),
  },
};

const nodeConfigs = (
  state: NodeConfigState = INITIAL_STATE,
  action: NodeConfigAction,
) => {
  switch (action.type) {
    case NODE_CONFIG.ADD:
      return { ...state, [action.payload.id]: action.payload.config };

    case NODE_CONFIG.REMOVE:
      const stateCopy = { ...state };
      Reflect.deleteProperty(stateCopy, action.payload.id);
      return stateCopy;

    default:
      return state;
  }
};

export default nodeConfigs;
