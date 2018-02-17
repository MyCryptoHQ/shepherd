import { RootState } from '@src/ducks';
import { getNodes } from '@src/ducks/nodeConfigs/selectors';

export const getCurrentNodeId = (state: RootState) => getNodes(state).currentId;
