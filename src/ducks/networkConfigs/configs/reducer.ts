import {
  ethPlorer,
  ETHTokenExplorer,
  SecureWalletName,
  InsecureWalletName,
  makeExplorer,
} from '@src/config';
import {
  ETH_DEFAULT,
  ETH_TREZOR,
  ETH_LEDGER,
  ETC_LEDGER,
  ETC_TREZOR,
  ETH_TESTNET,
  EXP_DEFAULT,
  UBQ_DEFAULT,
} from '@src/config';
import {
  NetworkConfigState,
  NetworkConfigAction,
  NETWORK_CONFIG,
} from './types';
import { StaticNetworkIds } from '@src/types/networks';

const INITIAL_STATE: NetworkConfigState = {
  [StaticNetworkIds.ETH]: {
    name: StaticNetworkIds.ETH,
    unit: 'ETH',
    chainId: 1,
    isCustom: false,
    color: '#0e97c0',
    blockExplorer: makeExplorer('https://etherscan.io'),
    tokenExplorer: {
      name: ethPlorer,
      address: ETHTokenExplorer,
    },
    tokens: require('@src/config/tokens/eth.json'),
    contracts: require('@src/config/contracts/eth.json'),
    dPathFormats: {
      [SecureWalletName.TREZOR]: ETH_TREZOR,
      [SecureWalletName.LEDGER_NANO_S]: ETH_LEDGER,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETH_DEFAULT,
    },
  },

  [StaticNetworkIds.Ropsten]: {
    name: StaticNetworkIds.Ropsten,
    unit: 'ETH',
    chainId: 3,
    isCustom: false,
    color: '#adc101',
    blockExplorer: makeExplorer('https://ropsten.etherscan.io'),
    tokens: require('@src/config/tokens/ropsten.json'),
    contracts: require('@src/config/contracts/ropsten.json'),
    isTestnet: true,
    dPathFormats: {
      [SecureWalletName.TREZOR]: ETH_TESTNET,
      [SecureWalletName.LEDGER_NANO_S]: ETH_TESTNET,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETH_TESTNET,
    },
  },
  [StaticNetworkIds.Kovan]: {
    name: StaticNetworkIds.Kovan,
    unit: 'ETH',
    chainId: 42,
    isCustom: false,
    color: '#adc101',
    blockExplorer: makeExplorer('https://kovan.etherscan.io'),
    tokens: require('@src/config/tokens/ropsten.json'),
    contracts: require('@src/config/contracts/ropsten.json'),
    isTestnet: true,
    dPathFormats: {
      [SecureWalletName.TREZOR]: ETH_TESTNET,
      [SecureWalletName.LEDGER_NANO_S]: ETH_TESTNET,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETH_TESTNET,
    },
  },
  [StaticNetworkIds.Rinkeby]: {
    name: StaticNetworkIds.Rinkeby,
    unit: 'ETH',
    chainId: 4,
    isCustom: false,
    color: '#adc101',
    blockExplorer: makeExplorer('https://rinkeby.etherscan.io'),
    tokens: require('@src/config/tokens/rinkeby.json'),
    contracts: require('@src/config/contracts/rinkeby.json'),
    isTestnet: true,
    dPathFormats: {
      [SecureWalletName.TREZOR]: ETH_TESTNET,
      [SecureWalletName.LEDGER_NANO_S]: ETH_TESTNET,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETH_TESTNET,
    },
  },
  [StaticNetworkIds.ETC]: {
    name: StaticNetworkIds.ETC,
    unit: 'ETC',
    chainId: 61,
    isCustom: false,
    color: '#669073',
    blockExplorer: makeExplorer('https://gastracker.io'),
    tokens: require('@src/config/tokens/etc.json'),
    contracts: require('@src/config/contracts/etc.json'),
    dPathFormats: {
      [SecureWalletName.TREZOR]: ETC_TREZOR,
      [SecureWalletName.LEDGER_NANO_S]: ETC_LEDGER,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETC_TREZOR,
    },
  },
  [StaticNetworkIds.UBQ]: {
    name: StaticNetworkIds.UBQ,
    unit: 'UBQ',
    chainId: 8,
    isCustom: false,
    color: '#b37aff',
    blockExplorer: makeExplorer('https://ubiqscan.io/en'),
    tokens: require('@src/config/tokens/ubq.json'),
    contracts: require('@src/config/contracts/ubq.json'),
    dPathFormats: {
      [SecureWalletName.TREZOR]: UBQ_DEFAULT,
      [SecureWalletName.LEDGER_NANO_S]: UBQ_DEFAULT,
      [InsecureWalletName.MNEMONIC_PHRASE]: UBQ_DEFAULT,
    },
  },
  [StaticNetworkIds.EXP]: {
    name: StaticNetworkIds.EXP,
    unit: 'EXP',
    chainId: 2,
    isCustom: false,
    color: '#673ab7',
    blockExplorer: makeExplorer('https://www.gander.tech'),
    tokens: require('@src/config/tokens/exp.json'),
    contracts: require('@src/config/contracts/exp.json'),
    dPathFormats: {
      [SecureWalletName.TREZOR]: EXP_DEFAULT,
      [SecureWalletName.LEDGER_NANO_S]: EXP_DEFAULT,
      [InsecureWalletName.MNEMONIC_PHRASE]: EXP_DEFAULT,
    },
  },
};

const networkConfigReducer = (
  state: NetworkConfigState = INITIAL_STATE,
  action: NetworkConfigAction,
) => {
  switch (action.type) {
    case NETWORK_CONFIG.ADD:
      return { ...state, [action.payload.id]: action.payload.config };

    case NETWORK_CONFIG.REMOVE:
      const stateCopy = { ...state };
      Reflect.deleteProperty(stateCopy, action.payload.id);
      return stateCopy;

    default:
      return state;
  }
};

export default networkConfigReducer;
