import 'isomorphic-fetch';
import btoa from 'btoa';
import BN from 'bn.js';
import { Validator } from 'jsonschema';
import { randomBytes } from 'crypto';
import URLSearchParams from 'url-search-params';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import createSagaMiddleware, { buffers, channel, delay } from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';
import { takeEvery, take, put, apply, flush, actionChannel, call, cancelled, select, race, spawn, cancel, fork, all } from 'redux-saga/effects';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const idGeneratorFactory = () => {
    let callId = 0;
    return () => {
        const currValue = callId;
        callId += 1;
        return currValue;
    };
};

var BALANCER;
(function (BALANCER) {
    BALANCER["NETWORK_SWTICH_REQUESTED"] = "BALANCER_NETWORK_SWTICH_REQUESTED";
    BALANCER["NETWORK_SWITCH_SUCCEEDED"] = "BALANCER_NETWORK_SWITCH_SUCCEEDED";
    BALANCER["SET_PROVIDER_CALL_RETRY_THRESHOLD"] = "BALANCER_SET_PROVIDER_CALL_RETRY_THRESHOLD";
    BALANCER["INIT"] = "BALANCER_INIT";
    BALANCER["FLUSH"] = "BALANCER_FLUSH";
    BALANCER["AUTO"] = "BALANCER_AUTO";
    BALANCER["MANUAL_REQUESTED"] = "BALANCER_MANUAL_REQUESTED";
    BALANCER["MANUAL_SUCCEEDED"] = "BALANCER_MANUAL_SUCCEEDED";
    BALANCER["MANUAL_FAILED"] = "BALANCER_MANUAL_FAILED";
    BALANCER["OFFLINE"] = "BALANCER_OFFLINE";
    BALANCER["ONLINE"] = "BALANCER_ONLINE";
    BALANCER["QUEUE_TIMEOUT"] = "QUEUE_TIMEOUT";
})(BALANCER || (BALANCER = {}));

const balancerFlush = () => ({
    type: BALANCER.FLUSH,
});
const networkIdGenerator = idGeneratorFactory();
const balancerNetworkSwitchRequested = (payload) => ({
    payload,
    type: BALANCER.NETWORK_SWTICH_REQUESTED,
    meta: { id: networkIdGenerator() },
});
const balancerNetworkSwitchSucceeded = (payload, id) => ({
    type: BALANCER.NETWORK_SWITCH_SUCCEEDED,
    payload,
    meta: { id },
});
const balancerInit = (payload) => ({
    type: BALANCER.INIT,
    payload,
    meta: { id: networkIdGenerator() },
});
const setOffline = () => ({
    type: BALANCER.OFFLINE,
});
const setOnline = () => ({
    type: BALANCER.ONLINE,
});
const setAuto = () => ({ type: BALANCER.AUTO });
const setManualRequested = (payload) => ({
    type: BALANCER.MANUAL_REQUESTED,
    payload,
});
const setManualSucceeded = (payload) => ({
    type: BALANCER.MANUAL_SUCCEEDED,
    payload,
});
const setManualFailed = (payload) => ({
    type: BALANCER.MANUAL_FAILED,
    payload,
});
const balancerQueueTimeout = () => ({
    type: BALANCER.QUEUE_TIMEOUT,
});

const INITIAL_STATE = {
    manual: false,
    offline: true,
    network: 'ETH',
    providerCallRetryThreshold: 3,
    networkSwitchPending: false,
    queueTimeout: 5000,
};
const handleBalancerAuto = (state, _) => (Object.assign(Object.assign({}, state), { manual: false }));
const handleBalancerManual = (state, { payload }) => (Object.assign(Object.assign({}, state), { manual: payload.providerId }));
const balancerConfigReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case BALANCER.INIT:
            return Object.assign(Object.assign({}, state), action.payload);
        case BALANCER.AUTO:
            return handleBalancerAuto(state);
        case BALANCER.MANUAL_SUCCEEDED:
            return handleBalancerManual(state, action);
        case BALANCER.OFFLINE:
            return Object.assign(Object.assign({}, state), { offline: true });
        case BALANCER.ONLINE:
            return Object.assign(Object.assign({}, state), { offline: false });
        case BALANCER.NETWORK_SWITCH_SUCCEEDED:
            return Object.assign(Object.assign({}, state), { network: action.payload.network, networkSwitchPending: false });
        case BALANCER.NETWORK_SWTICH_REQUESTED:
            return Object.assign(Object.assign({}, state), { networkSwitchPending: true });
        case BALANCER.SET_PROVIDER_CALL_RETRY_THRESHOLD:
            return Object.assign(Object.assign({}, state), { providerCallRetryThreshold: action.payload.threshold });
        default:
            return state;
    }
};

class Logger {
    constructor() {
        this.shouldLog = false;
    }
    enableLogging() {
        this.shouldLog = true;
    }
    log(...args) {
        if (!this.shouldLog) {
            return;
        }
        console.log(...args);
    }
}
const logger = new Logger();

class StoreManager {
    setRoot(r) {
        logger.log(`Setting root to: ${r}`);
        this.root = r;
    }
    getRoot() {
        return this.root;
    }
    setStore(s) {
        this.store = s;
    }
    getStore() {
        if (!this.store) {
            throw Error('no store');
        }
        return this.store;
    }
}
const storeManager = new StoreManager();

const getRootState = (s) => {
    const customRoot = storeManager.getRoot();
    return customRoot ? s[customRoot] : s;
};

const getProviderBalancer = (state) => getRootState(state).providerBalancer;

const getBalancerConfig = (state) => getProviderBalancer(state).balancerConfig;
const getQueueTimeout = (state) => getBalancerConfig(state).queueTimeout;
const getManualMode = (state) => getBalancerConfig(state).manual;
const isOffline = (state) => getBalancerConfig(state).offline;
const getNetwork = (state) => getBalancerConfig(state).network;
const getProviderCallRetryThreshold = (state) => getBalancerConfig(state).providerCallRetryThreshold;
const isSwitchingNetworks = (state) => getBalancerConfig(state).networkSwitchPending;
const callMeetsBalancerRetryThreshold = (state, { payload: { providerCall } }) => {
    const providerCallRetryThreshold = getProviderCallRetryThreshold(state);
    // checks the current call to see if it has failed more than the configured number
    return providerCall.numOfRetries >= providerCallRetryThreshold;
};

var balancerConfigSelectors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getBalancerConfig: getBalancerConfig,
    getQueueTimeout: getQueueTimeout,
    getManualMode: getManualMode,
    isOffline: isOffline,
    getNetwork: getNetwork,
    getProviderCallRetryThreshold: getProviderCallRetryThreshold,
    isSwitchingNetworks: isSwitchingNetworks,
    callMeetsBalancerRetryThreshold: callMeetsBalancerRetryThreshold
});

var PROVIDER_CALL;
(function (PROVIDER_CALL) {
    PROVIDER_CALL["REQUESTED"] = "PROVIDER_CALL_REQUESTED";
    PROVIDER_CALL["TIMEOUT"] = "PROVIDER_CALL_TIMEOUT";
    PROVIDER_CALL["SUCCEEDED"] = "PROVIDER_CALL_SUCCEEDED";
    PROVIDER_CALL["FAILED"] = "PROVIDER_CALL_FAILED";
    PROVIDER_CALL["FLUSHED"] = "PROVIDER_CALL_FLUSHED";
})(PROVIDER_CALL || (PROVIDER_CALL = {}));

const providerCallRequested = (payload) => ({
    type: PROVIDER_CALL.REQUESTED,
    payload,
});
const providerCallTimeout = (payload) => ({
    type: PROVIDER_CALL.TIMEOUT,
    payload,
});
const providerCallFailed = (payload) => ({
    type: PROVIDER_CALL.FAILED,
    payload,
});
const providerCallFlushed = (payload) => ({ type: PROVIDER_CALL.FLUSHED, payload });
const providerCallSucceeded = (payload) => ({
    type: PROVIDER_CALL.SUCCEEDED,
    payload,
});

const getProviderCalls = (state) => getProviderBalancer(state).providerCalls;
const getProviderCallById = (state, id) => getProviderCalls(state)[id];
const isStaleCall = (state, callId) => {
    const call = getProviderCallById(state, callId);
    return !call || !call.pending;
};
const getPendingProviderCallsByProviderId = (state, providerId) => {
    const pendingCalls = getAllPendingCalls(state);
    const pendingCallsByProviderId = pendingCalls.filter(providerCall => providerCall.providerId && providerCall.providerId === providerId);
    return pendingCallsByProviderId.length;
};
const getAllPendingCalls = (state) => {
    const providerCalls = getProviderCalls(state);
    const providerCallsArr = Object.values(providerCalls);
    const pendingCalls = providerCallsArr.filter((providerCall) => {
        if (providerCall.pending) {
            return true;
        }
        else {
            return false;
        }
    });
    return pendingCalls;
};

var providerCallsSelectors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getProviderCalls: getProviderCalls,
    getProviderCallById: getProviderCallById,
    isStaleCall: isStaleCall,
    getPendingProviderCallsByProviderId: getPendingProviderCallsByProviderId,
    getAllPendingCalls: getAllPendingCalls
});

var WORKER;
(function (WORKER) {
    WORKER["PROCESSING"] = "WORKER_PROCESSING";
    WORKER["SPAWNED"] = "WORKER_SPAWNED";
    WORKER["KILLED"] = "WORKER_KILLED";
})(WORKER || (WORKER = {}));

const workerProcessing = (payload) => ({
    type: WORKER.PROCESSING,
    payload,
});

const getWorkers = (state) => getProviderBalancer(state).workers;
const getWorkerById = (state, id) => getWorkers(state)[id];

var workersSelectors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getWorkers: getWorkers,
    getWorkerById: getWorkerById
});

var PROVIDER_STATS;
(function (PROVIDER_STATS) {
    PROVIDER_STATS["ONLINE"] = "PROVIDER_STATS_ONLINE";
    PROVIDER_STATS["OFFLINE"] = "PROVIDER_STATS_OFFLINE";
    PROVIDER_STATS["ADDED"] = "PROVIDER_STATS_ADDED";
    PROVIDER_STATS["REMOVED"] = "PROVIDER_STATS_REMOVED";
})(PROVIDER_STATS || (PROVIDER_STATS = {}));

const providerOnline = (payload) => ({
    type: PROVIDER_STATS.ONLINE,
    payload,
});
const providerOffline = (payload) => ({
    type: PROVIDER_STATS.OFFLINE,
    payload,
});
const providerAdded = (payload) => ({
    type: PROVIDER_STATS.ADDED,
    payload,
});

const getProviderStats = (state) => getProviderBalancer(state).providerStats;
const getProviderStatsById = (state, id) => getProviderStats(state)[id];
/**
 * @description an available provider === it being online
 * @param state
 */
const getOnlineProviders = (state) => {
    const providers = getProviderStats(state);
    const initialState = {};
    const isOnline = (provider) => !provider.isOffline;
    return Object.entries(providers).reduce((accu, [curProviderId, curProvider]) => {
        if (isOnline(curProvider)) {
            return Object.assign(Object.assign({}, accu), { [curProviderId]: curProvider });
        }
        return accu;
    }, initialState);
};

var providerStatsSelectors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getProviderStats: getProviderStats,
    getProviderStatsById: getProviderStatsById,
    getOnlineProviders: getOnlineProviders
});

const INITIAL_STATE$1 = {};
const handleNetworkSwitch = (_, { payload: { providerStats } }) => {
    for (const [providerId, provider] of Object.entries(providerStats)) {
        if (provider.avgResponseTime < 0) {
            throw Error(`Provider ${providerId} has a response time of below 0`);
        }
        if (provider.requestFailures !== 0) {
            throw Error(`Provider ${providerId} has non-zero request failures`);
        }
    }
    return providerStats;
};
const handleWorkerKilled = (state, { payload: { providerId, workerId } }) => {
    const providerToChange = state[providerId];
    if (!providerToChange) {
        throw Error(`Provider ${providerId} does not exist`);
    }
    if (!providerToChange.currWorkersById.includes(workerId)) {
        throw Error(`Worker ${workerId} does not exist`);
    }
    const nextProviderProviderStatsState = Object.assign(Object.assign({}, providerToChange), { currWorkersById: providerToChange.currWorkersById.filter(id => id !== workerId) });
    return Object.assign(Object.assign({}, state), { [providerId]: nextProviderProviderStatsState });
};
const handleWorkerSpawned = (state, { payload: { providerId, workerId } }) => {
    // check for existence of provider
    const providerToChange = state[providerId];
    if (!providerToChange) {
        throw Error(`Provider ${providerId} does not exist`);
    }
    // check for duplicates
    if (providerToChange.currWorkersById.includes(workerId)) {
        throw Error(`Worker ${workerId} already exists`);
    }
    const nextProviderProviderStatsState = Object.assign(Object.assign({}, providerToChange), { currWorkersById: [...providerToChange.currWorkersById, workerId] });
    return Object.assign(Object.assign({}, state), { [providerId]: nextProviderProviderStatsState });
};
const handleProviderOnline = (state, { payload: { providerId } }) => {
    // check for existence of provider
    const providerToChange = state[providerId];
    if (!providerToChange) {
        throw Error(`Provider ${providerId} does not exist`);
    }
    return Object.assign(Object.assign({}, state), { [providerId]: Object.assign(Object.assign({}, providerToChange), { isOffline: false }) });
};
const handleProviderOffline = (state, { payload: { providerId } }) => {
    // check for existence of provider
    const providerToChange = state[providerId];
    if (!providerToChange) {
        // done for initialization phase
        return state;
    }
    return Object.assign(Object.assign({}, state), { [providerId]: Object.assign(Object.assign({}, providerToChange), { isOffline: true, requestFailures: 0 }) });
};
const handleProviderAdded = (state, { payload: { providerId, stats } }) => {
    if (state[providerId]) {
        throw Error(`Provider ${providerId} already exists`);
    }
    return Object.assign(Object.assign({}, state), { [providerId]: stats });
};
const handleProviderRemoved = (state, { payload }) => {
    if (!state[payload.providerId]) {
        throw Error(`Provider ${payload.providerId} does not exist`);
    }
    const stateCopy = Object.assign({}, state);
    Reflect.deleteProperty(stateCopy, payload.providerId);
    return stateCopy;
};
const handleProviderCallTimeout = (state, { payload: { providerCall: { providerId } } }) => {
    // check for existence of provider
    const providerToChange = state[providerId];
    if (!providerToChange) {
        throw Error(`Provider ${providerId} does not exist`);
    }
    return Object.assign(Object.assign({}, state), { [providerId]: Object.assign(Object.assign({}, providerToChange), { requestFailures: providerToChange.requestFailures + 1 }) });
};
const handleBalancerFlush = state => Object.entries(state).reduce((obj, [providerId, stats]) => (Object.assign(Object.assign({}, obj), { [providerId]: Object.assign(Object.assign({}, stats), { requestFailures: 0 }) })), {});
const providerStatsReducer = (state = INITIAL_STATE$1, action) => {
    switch (action.type) {
        case WORKER.KILLED:
            return handleWorkerKilled(state, action);
        case WORKER.SPAWNED:
            return handleWorkerSpawned(state, action);
        case PROVIDER_STATS.ONLINE:
            return handleProviderOnline(state, action);
        case PROVIDER_STATS.OFFLINE:
            return handleProviderOffline(state, action);
        case PROVIDER_STATS.ADDED:
            return handleProviderAdded(state, action);
        case PROVIDER_STATS.REMOVED:
            return handleProviderRemoved(state, action);
        case PROVIDER_CALL.TIMEOUT:
            return handleProviderCallTimeout(state, action);
        case BALANCER.FLUSH:
            return handleBalancerFlush(state);
        case BALANCER.NETWORK_SWITCH_SUCCEEDED:
            return handleNetworkSwitch(state, action);
        default:
            return state;
    }
};

const INITIAL_STATE$2 = {};
const handleNetworkSwitch$1 = (_, { payload }) => {
    // validation
    for (const [workerId, worker] of Object.entries(payload.workers)) {
        if (!worker.task) {
            throw Error(`Worker ${workerId} has no saga task assigned`);
        }
        if (worker.currentPayload) {
            throw Error(`Worker ${workerId} should not have an existing payload`);
        }
    }
    return payload.workers;
};
const handleWorkerKilled$1 = (state, { payload }) => {
    if (!state[payload.workerId]) {
        throw Error(`Worker ${payload.workerId} does not exist`);
    }
    const stateCopy = Object.assign({}, state);
    Reflect.deleteProperty(stateCopy, payload.workerId);
    return stateCopy;
};
const handleWorkerProcessing = (state, { payload: { currentPayload, workerId } }) => {
    if (!state[workerId]) {
        throw Error(`Worker ${workerId} does not exist`);
    }
    if (state[workerId].currentPayload) {
        throw Error(`Worker ${workerId} is already processing a payload`);
    }
    return Object.assign(Object.assign({}, state), { [workerId]: Object.assign(Object.assign({}, state[workerId]), { currentPayload }) });
};
const handleWorkerSpawned$1 = (state, { payload }) => {
    if (state[payload.workerId]) {
        throw Error(`Worker ${payload.workerId} already exists`);
    }
    return Object.assign(Object.assign({}, state), { [payload.workerId]: {
            assignedProvider: payload.providerId,
            task: payload.task,
            currentPayload: null,
        } });
};
const handleProviderAdded$1 = (state, { payload }) => {
    const stateCopy = Object.assign({}, state);
    for (const [workerId, worker] of Object.entries(payload.workers)) {
        if (stateCopy[workerId]) {
            throw Error(`Worker ${workerId} already exists`);
        }
        stateCopy[workerId] = {
            assignedProvider: worker.assignedProvider,
            task: worker.task,
            currentPayload: null,
        };
    }
    return stateCopy;
};
const handleProviderCallSucceeded = (state, { payload }) => {
    const { providerCall: { callId } } = payload;
    const worker = Object.entries(state).find(([_, { currentPayload }]) => !!(currentPayload && currentPayload.callId === callId));
    if (!worker) {
        throw Error(`Worker not found for a successful request`);
    }
    const [workerId, workerInst] = worker;
    return Object.assign(Object.assign({}, state), { [workerId]: Object.assign(Object.assign({}, workerInst), { currentPayload: null }) });
};
const handleProviderCallTimeout$1 = (state, { payload }) => {
    const { providerCall } = payload;
    const worker = Object.entries(state).find(([_, { currentPayload }]) => !!(currentPayload && currentPayload.callId === providerCall.callId));
    if (!worker) {
        throw Error(`Worker not found for a timed out request`);
    }
    const [workerId, workerInst] = worker;
    return Object.assign(Object.assign({}, state), { [workerId]: Object.assign(Object.assign({}, workerInst), { currentPayload: null }) });
};
const workerReducer = (state = INITIAL_STATE$2, action) => {
    switch (action.type) {
        case WORKER.SPAWNED:
            return handleWorkerSpawned$1(state, action);
        case WORKER.PROCESSING:
            return handleWorkerProcessing(state, action);
        case WORKER.KILLED:
            return handleWorkerKilled$1(state, action);
        case BALANCER.NETWORK_SWITCH_SUCCEEDED:
            return handleNetworkSwitch$1(state, action);
        case PROVIDER_CALL.SUCCEEDED:
            return handleProviderCallSucceeded(state, action);
        case PROVIDER_CALL.TIMEOUT:
            return handleProviderCallTimeout$1(state, action);
        case PROVIDER_STATS.ADDED:
            return handleProviderAdded$1(state, action);
        default:
            return state;
    }
};

const handleProviderCallSucceeded$1 = (state, { payload }) => {
    const call = state[payload.providerCall.callId];
    if (!call || !call.pending) {
        throw Error(`Pending provider call not found ${call ? call.callId : ''}`);
    }
    return Object.assign(Object.assign({}, state), { [payload.providerCall.callId]: Object.assign(Object.assign({}, payload.providerCall), { result: payload.result, error: null, pending: false }) });
};
const handleProviderCallFailed = (state, { payload }) => {
    const call = state[payload.providerCall.callId];
    if (!call || !call.pending) {
        throw Error('Pending provider call not found');
    }
    return Object.assign(Object.assign({}, state), { [payload.providerCall.callId]: Object.assign(Object.assign({ error: payload.error }, payload.providerCall), { result: null, pending: false }) });
};
const handleProviderCallFlushed = (state, { payload }) => {
    const call = state[payload.providerCall.callId];
    if (!call || !call.pending) {
        console.error('Pending provider call not found when flushing');
    }
    return Object.assign(Object.assign({}, state), { [payload.providerCall.callId]: Object.assign(Object.assign({ error: payload.error }, payload.providerCall), { result: null, pending: false }) });
};
const handleProviderCallPending = (state, { payload }) => {
    const call = state[payload.callId];
    // a duplicate check that makes sure the incoming call is either new or a retry call
    if (call && call.numOfRetries === payload.numOfRetries) {
        throw Error('Provider call already exists');
    }
    return Object.assign(Object.assign({}, state), { [payload.callId]: Object.assign(Object.assign({}, payload), { error: null, result: null, pending: true }) });
};
const handleWorkerProcessing$1 = (state, { payload: { currentPayload } }) => {
    const prevPayload = state[currentPayload.callId];
    if (!prevPayload || !prevPayload.pending) {
        throw Error('Pending provider call not found');
    }
    const nextPayload = Object.assign(Object.assign({}, prevPayload), { providerId: currentPayload.providerId });
    return Object.assign(Object.assign({}, state), { [currentPayload.callId]: nextPayload });
};
const INITIAL_STATE$3 = {};
const providerCallsReducer = (state = INITIAL_STATE$3, action) => {
    switch (action.type) {
        case PROVIDER_CALL.REQUESTED:
            return handleProviderCallPending(state, action);
        case WORKER.PROCESSING:
            return handleWorkerProcessing$1(state, action);
        case PROVIDER_CALL.SUCCEEDED:
            return handleProviderCallSucceeded$1(state, action);
        case PROVIDER_CALL.FAILED:
            return handleProviderCallFailed(state, action);
        case PROVIDER_CALL.FLUSHED:
            return handleProviderCallFlushed(state, action);
        default:
            return state;
    }
};

var SUBSCRIBE;
(function (SUBSCRIBE) {
    SUBSCRIBE["ACTION"] = "SUBSCRIBE_TO_ACTION";
})(SUBSCRIBE || (SUBSCRIBE = {}));

function subscribeToAction(payload) {
    return { type: SUBSCRIBE.ACTION, payload };
}

const triggerOnMatchingCallId = (callId, includeTimeouts) => (action) => {
    // check if the action is a provider failed or succeeded call
    if (action.type === PROVIDER_CALL.SUCCEEDED ||
        action.type === PROVIDER_CALL.FAILED ||
        action.type === PROVIDER_CALL.FLUSHED ||
        (includeTimeouts && action.type === PROVIDER_CALL.TIMEOUT)) {
        // make sure its the same call
        return action.payload.providerCall.callId === callId;
    }
};
function waitForNetworkSwitch(dispatch, id) {
    return new Promise(res => dispatch(subscribeToAction({
        trigger: (action) => {
            if (action.type === BALANCER.NETWORK_SWITCH_SUCCEEDED) {
                return action.meta.id === id;
            }
            return false;
        },
        callback: res,
    })));
}
function waitForManualMode(dispatch) {
    function triggerOnSuccessOrFail(action) {
        return (action.type === BALANCER.MANUAL_SUCCEEDED ||
            action.type === BALANCER.MANUAL_FAILED);
    }
    const returnSuccessOrFail = (resolve, reject) => (action) => action.type === BALANCER.MANUAL_SUCCEEDED
        ? resolve(action.payload.providerId)
        : reject(Error(action.payload.error));
    return new Promise((resolve, reject) => dispatch(subscribeToAction({
        trigger: triggerOnSuccessOrFail,
        callback: returnSuccessOrFail(resolve, reject),
    })));
}

var PROVIDER_CONFIG;
(function (PROVIDER_CONFIG) {
    PROVIDER_CONFIG["ADD"] = "PROVIDER_CONFIG_ADD";
    PROVIDER_CONFIG["CHANGE"] = "PROVIDER_CONFIG_CHANGE";
    PROVIDER_CONFIG["REMOVE"] = "PROVIDER_CONFIG_REMOVE";
})(PROVIDER_CONFIG || (PROVIDER_CONFIG = {}));

const INITIAL_STATE$4 = {};
const handleProviderConfigAdd = (state, { payload }) => {
    if (state[payload.id]) {
        throw Error(`Provider config ${payload.id} already exists`);
    }
    return Object.assign(Object.assign({}, state), { [payload.id]: payload.config });
};
const handleProviderConfigChange = (state, { payload }) => {
    const { config, id } = payload;
    if (!state[id]) {
        throw Error(`Provider config ${id} does not exist`);
    }
    return Object.assign(Object.assign({}, state), { [id]: Object.assign(Object.assign(Object.assign({}, state[id]), config), { supportedMethods: Object.assign(Object.assign({}, state[id].supportedMethods), config.supportedMethods) }) });
};
const handleProviderConfigRemove = (state, { payload }) => {
    if (!state[payload.id]) {
        throw Error(`Provider config ${payload.id} does not exist`);
    }
    const stateCopy = Object.assign({}, state);
    Reflect.deleteProperty(stateCopy, payload.id);
    return stateCopy;
};
const providerConfigs = (state = INITIAL_STATE$4, action) => {
    switch (action.type) {
        case PROVIDER_CONFIG.ADD:
            return handleProviderConfigAdd(state, action);
        case PROVIDER_CONFIG.CHANGE:
            return handleProviderConfigChange(state, action);
        case PROVIDER_CONFIG.REMOVE:
            return handleProviderConfigRemove(state, action);
        default:
            return state;
    }
};

const addProviderConfig = (payload) => ({
    type: PROVIDER_CONFIG.ADD,
    payload,
});

function stripHexPrefix(value) {
    return value.replace('0x', '');
}
const handleValues = (input) => {
    if (typeof input === 'string') {
        return input.startsWith('0x')
            ? new BN(stripHexPrefix(input), 16)
            : new BN(input);
    }
    if (typeof input === 'number') {
        return new BN(input);
    }
    if (BN.isBN(input)) {
        return input;
    }
    else {
        throw Error('unsupported value conversion');
    }
};
const hexToNumber = (hex) => handleValues(hex).toNumber();
const makeBN = handleValues;
const Wei = handleValues;

// JSONSchema Validations for Rpc responses
const v = new Validator();
const schema = {
    RpcProvider: {
        type: 'object',
        additionalProperties: true,
        properties: {
            jsonrpc: { type: 'string' },
            id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
            result: {
                oneOf: [{ type: 'string' }, { type: 'array' }, { type: 'object' }],
            },
            status: { type: 'string', pattern: '1' },
            message: { type: 'string', pattern: '^OK' },
        },
        oneOf: [
            {
                additionalProperties: true,
                type: 'object',
                required: ['jsonrpc'],
                properties: { jsonrpc: { type: 'string' } },
            },
            {
                additionalProperties: true,
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string' } },
            },
        ],
        dependencies: {
            jsonrpc: ['id', 'result'],
            status: ['message', 'result'],
        },
        not: {
            anyOf: [
                {
                    additionalProperties: true,
                    properties: {
                        error: {
                            anyOf: [
                                { type: 'string', minLength: 1 },
                                { type: ['array', 'object', 'number', 'boolean'] },
                            ],
                        },
                    },
                    required: ['error'],
                },
            ],
        },
    },
};
function isValidResult(response, schemaFormat) {
    return v.validate(response, schemaFormat).valid;
}
function formatErrors(response, apiType) {
    if (response) {
        if (response.error && response.error.message) {
            // Metamask errors are sometimes full-blown stacktraces, no bueno. Instead,
            // We'll just take the first line of it, and the last thing after all of
            // the colons. An example error message would be:
            // "Error: Metamask Sign Tx Error: User rejected the signature."
            const lines = response.error.message.split('\n');
            if (lines.length > 2) {
                return lines[0].split(':').pop();
            }
            else {
                return `${response.error.message} ${response.error.data || ''}`;
            }
        }
        else if (response.result && response.status) {
            return response.result;
        }
    }
    return `Invalid ${apiType} Error`;
}
var API_NAME;
(function (API_NAME) {
    API_NAME["Get_Balance"] = "Get Balance";
    API_NAME["Estimate_Gas"] = "Estimate Gas";
    API_NAME["Call_Request"] = "Call Request";
    API_NAME["Token_Balance"] = "Token Balance";
    API_NAME["Transaction_Count"] = "Transaction Count";
    API_NAME["Current_Block"] = "Current Block";
    API_NAME["Raw_Tx"] = "Raw Tx";
    API_NAME["Send_Transaction"] = "Send Transaction";
    API_NAME["Sign_Message"] = "Sign Message";
    API_NAME["Get_Accounts"] = "Get Accounts";
    API_NAME["Net_Version"] = "Net Version";
    API_NAME["Transaction_By_Hash"] = "Transaction By Hash";
    API_NAME["Transaction_Receipt"] = "Transaction Receipt";
})(API_NAME || (API_NAME = {}));
const isValidEthCall = (response, schemaType) => (apiName, cb) => {
    if (!isValidResult(response, schemaType)) {
        if (cb) {
            return cb(response);
        }
        throw new Error(formatErrors(response, apiName));
    }
    return response;
};
const isValidGetBalance = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Get_Balance);
const isValidEstimateGas = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Estimate_Gas);
const isValidCallRequest = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Call_Request);
const isValidTransactionCount = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Transaction_Count);
const isValidTransactionByHash = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Transaction_By_Hash);
const isValidTransactionReceipt = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Transaction_Receipt);
const isValidCurrentBlock = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Current_Block);
const isValidRawTxApi = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Raw_Tx);
const isValidSendTransaction = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Send_Transaction);
const isValidSignMessage = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Sign_Message);
const isValidGetAccounts = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Get_Accounts);
const isValidGetNetVersion = (response) => isValidEthCall(response, schema.RpcProvider)(API_NAME.Net_Version);

class RPCClient {
    constructor(endpoint, headers = {}) {
        this.decorateRequest = (req) => (Object.assign(Object.assign({}, req), { id: this.id(), jsonrpc: '2.0' }));
        this.call = (request) => {
            return fetch(this.endpoint, {
                method: 'POST',
                headers: this.createHeaders(Object.assign({ 'Content-Type': 'application/json' }, this.headers)),
                body: JSON.stringify(this.decorateRequest(request)),
            }).then(r => r.json());
        };
        this.batch = (requests) => {
            return fetch(this.endpoint, {
                method: 'POST',
                headers: this.createHeaders(Object.assign({ 'Content-Type': 'application/json' }, this.headers)),
                body: JSON.stringify(requests.map(this.decorateRequest)),
            }).then(r => r.json());
        };
        this.createHeaders = (headerObject) => {
            const headers = new Headers();
            Object.keys(headerObject).forEach(name => {
                headers.append(name, headerObject[name]);
            });
            return headers;
        };
        this.endpoint = endpoint;
        this.headers = headers;
    }
    id() {
        return randomBytes(16).toString('hex');
    }
}

class RPCRequests {
    getNetVersion() {
        return { method: 'net_version' };
    }
    sendRawTx(signedTx) {
        return {
            method: 'eth_sendRawTransaction',
            params: [signedTx],
        };
    }
    estimateGas(transaction) {
        return {
            method: 'eth_estimateGas',
            params: [transaction],
        };
    }
    getBalance(address) {
        return {
            method: 'eth_getBalance',
            params: [`0x${stripHexPrefix(address)}`, 'pending'],
        };
    }
    ethCall(txObj) {
        return {
            method: 'eth_call',
            params: [txObj, 'pending'],
        };
    }
    getTransactionCount(address) {
        return {
            method: 'eth_getTransactionCount',
            params: [address, 'pending'],
        };
    }
    getTransactionByHash(txhash) {
        return {
            method: 'eth_getTransactionByHash',
            params: [txhash],
        };
    }
    getTransactionReceipt(txhash) {
        return {
            method: 'eth_getTransactionReceipt',
            params: [txhash],
        };
    }
    getCurrentBlock() {
        return {
            method: 'eth_blockNumber',
        };
    }
}

class RPCProvider {
    constructor(endpoint) {
        this.client = new RPCClient(endpoint);
        this.requests = new RPCRequests();
    }
    getNetVersion() {
        return this.client
            .call(this.requests.getNetVersion())
            .then(({ result }) => result);
    }
    ping() {
        return this.client
            .call(this.requests.getNetVersion())
            .then(() => true)
            .catch(() => false);
    }
    sendCallRequest(txObj) {
        return this.client
            .call(this.requests.ethCall(txObj))
            .then(isValidCallRequest)
            .then(response => response.result);
    }
    sendCallRequests(txObjs) {
        return this.client
            .batch(txObjs.map(this.requests.ethCall))
            .then(r => r.map(isValidCallRequest))
            .then(r => r.map(({ result }) => result));
    }
    getBalance(address) {
        return this.client
            .call(this.requests.getBalance(address))
            .then(isValidGetBalance)
            .then(({ result }) => Wei(result));
    }
    estimateGas(transaction) {
        return this.client
            .call(this.requests.estimateGas(transaction))
            .then(isValidEstimateGas)
            .then(({ result }) => Wei(result))
            .catch(error => {
            throw new Error(error.message);
        });
    }
    getTransactionCount(address) {
        return this.client
            .call(this.requests.getTransactionCount(address))
            .then(isValidTransactionCount)
            .then(({ result }) => result);
    }
    getCurrentBlock() {
        return this.client
            .call(this.requests.getCurrentBlock())
            .then(isValidCurrentBlock)
            .then(({ result }) => makeBN(result).toString());
    }
    sendRawTx(signedTx) {
        return this.client
            .call(this.requests.sendRawTx(signedTx))
            .then(isValidRawTxApi)
            .then(({ result }) => {
            return result;
        });
    }
    getTransactionByHash(txhash) {
        return this.client
            .call(this.requests.getTransactionByHash(txhash))
            .then(isValidTransactionByHash)
            .then(({ result }) => (Object.assign(Object.assign({}, result), { to: result.to || '0x0', value: Wei(result.value), gasPrice: Wei(result.gasPrice), gas: Wei(result.gas), nonce: hexToNumber(result.nonce), blockNumber: result.blockNumber
                ? hexToNumber(result.blockNumber)
                : null, transactionIndex: result.transactionIndex
                ? hexToNumber(result.transactionIndex)
                : null })));
    }
    getTransactionReceipt(txhash) {
        return this.client
            .call(this.requests.getTransactionReceipt(txhash))
            .then(isValidTransactionReceipt)
            .then(({ result }) => (Object.assign(Object.assign({}, result), { transactionIndex: hexToNumber(result.transactionIndex), blockNumber: hexToNumber(result.blockNumber), cumulativeGasUsed: Wei(result.cumulativeGasUsed), gasUsed: Wei(result.gasUsed), status: result.status ? hexToNumber(result.status) : null, root: result.root || null })));
    }
}

class MyCryptoCustomProvider extends RPCProvider {
    constructor(config) {
        super(config.url);
        const headers = {};
        if (config.auth) {
            const { username, password } = config.auth;
            headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
        }
        this.client = new RPCClient(config.url, headers);
    }
}

class EtherscanClient extends RPCClient {
    constructor() {
        super(...arguments);
        this.call = (request) => fetch(this.endpoint, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }),
            body: this.encodeRequest(request),
        }).then(r => r.json());
        this.batch = (requests) => {
            const promises = requests.map(req => this.call(req));
            return Promise.all(promises);
        };
    }
    encodeRequest(request) {
        const encoded = new URLSearchParams();
        Object.keys(request).forEach((key) => {
            if (request[key]) {
                encoded.set(key, request[key]);
            }
        });
        return encoded.toString();
    }
}

class EtherscanRequests extends RPCRequests {
    sendRawTx(signedTx) {
        return {
            module: 'proxy',
            action: 'eth_sendRawTransaction',
            hex: signedTx,
        };
    }
    estimateGas(transaction) {
        return {
            module: 'proxy',
            action: 'eth_estimateGas',
            to: transaction.to,
            value: transaction.value,
            data: transaction.data,
            from: transaction.from,
        };
    }
    getBalance(address) {
        return {
            module: 'account',
            action: 'balance',
            tag: 'latest',
            address,
        };
    }
    ethCall(transaction) {
        return {
            module: 'proxy',
            action: 'eth_call',
            to: transaction.to,
            data: transaction.data,
        };
    }
    getTransactionByHash(txhash) {
        return {
            module: 'proxy',
            action: 'eth_getTransactionByHash',
            txhash,
        };
    }
    getTransactionReceipt(txhash) {
        return {
            module: 'proxy',
            action: 'eth_getTransactionReceipt',
            txhash,
        };
    }
    getTransactionCount(address) {
        return {
            module: 'proxy',
            action: 'eth_getTransactionCount',
            tag: 'latest',
            address,
        };
    }
    getCurrentBlock() {
        return {
            module: 'proxy',
            action: 'eth_blockNumber',
        };
    }
}

class EtherscanProvider extends RPCProvider {
    constructor(endpoint) {
        super(endpoint);
        this.client = new EtherscanClient(endpoint);
        this.requests = new EtherscanRequests();
    }
}

class InfuraClient extends RPCClient {
    id() {
        return parseInt(randomBytes(5).toString('hex'), 16);
    }
}

class InfuraProvider extends RPCProvider {
    constructor(endpoint) {
        super(endpoint);
        this.client = new InfuraClient(endpoint);
    }
}

class Web3Client extends RPCClient {
    constructor() {
        super('web3'); // initialized with fake endpoint
        this.decorateRequest = (req) => (Object.assign(Object.assign({}, req), { id: this.id(), jsonrpc: '2.0', params: req.params || [] }));
        this.call = (request) => this.sendAsync(this.decorateRequest(request));
        this.batch = (requests) => this.sendAsync(requests.map(this.decorateRequest));
        this.sendAsync = (request) => {
            return new Promise((resolve, reject) => {
                this.provider.sendAsync(request, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                });
            });
        };
        this.provider = window.web3.currentProvider;
    }
}

class Web3Requests extends RPCRequests {
    sendTransaction(web3Tx) {
        return {
            method: 'eth_sendTransaction',
            params: [web3Tx],
        };
    }
    signMessage(msgHex, fromAddr) {
        return {
            method: 'personal_sign',
            params: [msgHex, fromAddr],
        };
    }
    getAccounts() {
        return {
            method: 'eth_accounts',
        };
    }
}

class Web3Provider extends RPCProvider {
    constructor() {
        super('web3'); // initialized with fake endpoint
        this.client = new Web3Client();
        this.requests = new Web3Requests();
    }
    getNetVersion() {
        return this.client
            .call(this.requests.getNetVersion())
            .then(isValidGetNetVersion)
            .then(({ result }) => result);
    }
    sendTransaction(web3Tx) {
        return this.client
            .call(this.requests.sendTransaction(web3Tx))
            .then(isValidSendTransaction)
            .then(({ result }) => result);
    }
    signMessage(msgHex, fromAddr) {
        return this.client
            .call(this.requests.signMessage(msgHex, fromAddr))
            .then(isValidSignMessage)
            .then(({ result }) => result);
    }
    getAccounts() {
        return this.client
            .call(this.requests.getAccounts())
            .then(isValidGetAccounts)
            .then(({ result }) => result);
    }
}

class ProviderStorage {
    constructor(providers = {}) {
        this.classes = providers;
        this.instances = {};
    }
    /**
     * Sets the class
     * @param providerName
     * @param Provider
     */
    setClass(providerName, Provider) {
        this.classes[providerName] = Provider;
    }
    getClass(providerName) {
        const Provider = this.classes[providerName];
        if (!Provider) {
            throw Error(`${providerName} implementation does not exist in storage`);
        }
        return Provider;
    }
    setInstance(providerName, provider) {
        this.instances[providerName] = provider;
    }
    getInstance(providerName) {
        const provider = this.instances[providerName];
        if (!provider) {
            throw Error(`${providerName} instance does not exist in storage`);
        }
        return provider;
    }
}
const providerStorage = new ProviderStorage({
    rpc: RPCProvider,
    etherscan: EtherscanProvider,
    infura: InfuraProvider,
    web3: Web3Provider,
    myccustom: MyCryptoCustomProvider,
});

const getProviderConfigs = (state) => getRootState(state).providerConfigs;
const getProviderConfigById = (state, id) => getProviderConfigs(state)[id];
const providerSupportsMethod = (state, id, method) => {
    const config = getProviderConfigById(state, id);
    return !!(config && config.supportedMethods[method]);
};
const getProviderTimeoutThreshold = (state, id) => {
    const config = getProviderConfigById(state, id);
    if (!config) {
        throw Error(`Could not find config for provider ${id}`);
    }
    return config.timeoutThresholdMs;
};
const getProviderInstAndTimeoutThreshold = (state, id) => {
    const provider = providerStorage.getInstance(id);
    const timeoutThreshold = getProviderTimeoutThreshold(state, id);
    return { provider, timeoutThreshold };
};

var providerConfigsSelectors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getProviderConfigs: getProviderConfigs,
    getProviderConfigById: getProviderConfigById,
    providerSupportsMethod: providerSupportsMethod,
    getProviderTimeoutThreshold: getProviderTimeoutThreshold,
    getProviderInstAndTimeoutThreshold: getProviderInstAndTimeoutThreshold
});

function addProvider(providerName, Provider) {
    return providerStorage.setClass(providerName, Provider);
}
function useProvider(providerName, instanceName, config, ...args) {
    const Provider = providerStorage.getClass(providerName);
    const provider = new Provider(...args);
    providerStorage.setInstance(instanceName, provider);
    const action = addProviderConfig({ config, id: instanceName });
    storeManager.getStore().dispatch(action);
    return config;
}

const allRPCMethods = [
    'ping',
    'getNetVersion',
    'sendCallRequest',
    'sendCallRequests',
    'getBalance',
    'estimateGas',
    'getTransactionCount',
    'getTransactionReceipt',
    'getTransactionByHash',
    'getCurrentBlock',
    'sendRawTx',
    /*web3 specific methods */
    'sendTransaction',
    'signMessage',
];

const idGenerator = idGeneratorFactory();
const respondToCallee = (resolve, reject) => (action) => {
    if (action.type === PROVIDER_CALL.SUCCEEDED) {
        const { providerCall, result } = action.payload;
        logger.log(`CallId: ${providerCall.callId} Pid: ${providerCall.providerId}
     ${providerCall.rpcMethod} ${providerCall.rpcArgs}
     Result: ${result}`);
        resolve(action.payload.result);
    }
    else {
        reject(Error(action.payload.error));
    }
};
const makeProviderCall = (rpcMethod, rpcArgs) => {
    const isManual = getManualMode(storeManager.getStore().getState());
    const providerCall = Object.assign({ callId: idGenerator(), numOfRetries: 0, rpcArgs,
        rpcMethod, minPriorityProviderList: [] }, (isManual ? { providerWhiteList: [isManual] } : {}));
    return providerCall;
};
const dispatchRequest = (providerCall) => {
    // make the request to the load balancer
    const networkReq = providerCallRequested(providerCall);
    storeManager.getStore().dispatch(networkReq);
    return networkReq.payload.callId;
};
const waitForResponse = (callId) => new Promise((resolve, reject) => storeManager.getStore().dispatch(subscribeToAction({
    trigger: triggerOnMatchingCallId(callId, false),
    callback: respondToCallee(resolve, reject),
})));
const providerCallDispatcher = (rpcMethod) => (...rpcArgs) => {
    const providerCall = makeProviderCall(rpcMethod, rpcArgs);
    const callId = dispatchRequest(providerCall);
    return waitForResponse(callId);
};
const handler = {
    get: (target, methodName) => {
        if (!allRPCMethods.includes(methodName)) {
            return target[methodName];
        }
        return providerCallDispatcher(methodName);
    },
};
const createProviderProxy = () => new Proxy({}, handler);

class Shepherd {
    /**
     *
     * @description Initializes the balancer, returning a single instance of a provider to be used across your application
     * @param {IInitConfig} [{ customProviders, ...config }={}] Initialization configuration parameter, custom providers are
     * your own supplied implementations that adhere to the {IProvider} interface. The {providerCallRetryThreshold} determines
     * how many times a provider can fail a call before its determined to be offline. The {network} is what network the balancer
     * will initialize to, defaulting to 'ETH'. The {storeRoot} is the shepherd rootReducer when using a custom store.
     * E.g If the top level is { foo, shepherdReducer } then `storeRoot` would be `shepherdReducer`. Note that this setting only supports one level of nesting.
     * The {store} is the custom store to use if you want to use your own, make sure to supply the setting above too or else it will not work.
     * {queueTimeout} is the timeout based on when there are pending calls that have not been assigned to a worker. The most common case of this happening
     * is when the balancer is offline and there's calls to the balancer still happening.
     * @returns {Promise<IProvider>} A provider instances to be used for making rpc calls
     * @memberof Shepherd
     */
    init(_a = {}) {
        var { customProviders, storeRoot, store } = _a, config = __rest(_a, ["customProviders", "storeRoot", "store"]);
        return __awaiter(this, void 0, void 0, function* () {
            if (storeRoot) {
                storeManager.setRoot(storeRoot);
            }
            if (store) {
                storeManager.setStore(store);
            }
            if (customProviders) {
                for (const [customProviderName, Provider] of Object.entries(customProviders)) {
                    addProvider(customProviderName, Provider);
                }
            }
            if (!config.network) {
                config.network = 'ETH';
            }
            if (!config.providerCallRetryThreshold) {
                config.providerCallRetryThreshold = 3;
            }
            const node = createProviderProxy();
            const initAction = balancerInit(config);
            const promise = waitForNetworkSwitch(storeManager.getStore().dispatch, initAction.meta.id);
            storeManager.getStore().dispatch(initAction);
            yield promise;
            return node;
        });
    }
    /**
     *
     * @description Adds a custom Provider implementation to be later used and instantiated by useProvider.
     * This library comes with default Provider implementations of 'rpc' 'etherscan' 'infura' 'web3' 'myccustom'
     * already availble for use in useProvider. This method can be used before init
     * @param {string} providerName
     * @param {IProviderContructor} Provider The provider implementation to store for later usage
     * @returns {void}
     * @memberof Shepherd
     */
    addProvider(providerName, Provider) {
        addProvider(providerName, Provider);
    }
    /**
     * @description Switches the balancer back to "auto" mode. This is the default mode of the balancer.
     * If the balancer was previously in "manual" mode, this will now instead change it back to normal
     * behaviour, which means balancing between all available providers of the current network
     * @returns {void}
     * @memberof Shepherd
     */
    auto() {
        storeManager.getStore().dispatch(setAuto());
    }
    /**
     *
     * @description Switches the balancer to "manual" mode. This will switch the balancer's current network
     * to the manual providers network if it is different, then route all requests to the provider. This method
     * can be used before init
     * @param {string} providerId
     * @param {boolean} skipOfflineCheck Will not fail and throw an error if the manual provider switched to
     * is offline
     * @returns {Promise<string>} Resolves when the manual provider has successfully been switched to,
     * returns a promise containing the provider ID switched to
     * @memberof Shepherd
     */
    manual(providerId, skipOfflineCheck) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = waitForManualMode(storeManager.getStore().dispatch);
            storeManager
                .getStore()
                .dispatch(setManualRequested({ providerId, skipOfflineCheck }));
            return yield promise;
        });
    }
    /**
     * @description Add a provider instance to the balancer to be used for incoming rpc calls,
     * this is distinctly different from addProvider, as addProvider does not add any providers to be
     * used for incoming calls. All addProvider does is add a custom implementation to the pool of default
     * implementations that you can specify in this method to be used and have instances created from.
     * This method can be used before init
     * @param {string} providerName The name of the Provider implementation to use as previously defined in
     * either init (as customProviders), or addProvider, or one of the default implementations supplied:
     * 'rpc' 'etherscan' 'infura' 'web3' 'myccustom'
     * @param {string} instanceName The unique name of the instance to be used
     * @param {IProviderConfig} config
     * @param {...any[]} args The constructor arguments to be supplied to the specifed Provider constructor
     * @returns {void}
     * @memberof Shepherd
     */
    useProvider(providerName, instanceName, config, ...args) {
        useProvider(providerName, instanceName, config, ...args);
    }
    /**
     * @description Switch the network for the balancer to use, all provider instances added by useProvider
     * that match the same network to be swiched to will be used. Can not be used when the balancer is in
     * manual mode, switch to auto mode first.
     * @param {string} network
     * @returns {Promise<void>} Resolves when the network is finished being switched to
     * @memberof Shepherd
     */
    switchNetworks(network) {
        return __awaiter(this, void 0, void 0, function* () {
            if (getManualMode(storeManager.getStore().getState())) {
                throw Error(`Can't switch networks when in manual mode!`);
            }
            const action = balancerNetworkSwitchRequested({ network });
            const promise = waitForNetworkSwitch(storeManager.getStore().dispatch, action.meta.id);
            storeManager.getStore().dispatch(action);
            yield promise;
        });
    }
    /**
     * @description enables logging for the library
     * @memberof Shepherd
     */
    enableLogging() {
        logger.enableLogging();
    }
}
const shepherd = new Shepherd();

// this should be the last middleware, immediately before the store
// if it's an subscription action then do not dispatch it to the store
const filterMiddlware = () => (next) => (action) => action.type === SUBSCRIBE.ACTION ? undefined : next(action);

const providerBalancer = combineReducers({
    providerStats: providerStatsReducer,
    workers: workerReducer,
    balancerConfig: balancerConfigReducer,
    providerCalls: providerCallsReducer,
});
const providerBalancerSelectors = {
    balancerConfigSelectors,
    providerCallsSelectors,
    providerStatsSelectors,
    workersSelectors,
};

function* handleSubscribeToAction({ payload }) {
    const { trigger, callback } = payload;
    const resultingAction = yield take(trigger);
    callback(resultingAction);
}
const subscriptionWatcher = [
    takeEvery(SUBSCRIBE.ACTION, handleSubscribeToAction),
];

const createRetryCall = (currentCall) => {
    const { providerId } = currentCall;
    const currMinList = currentCall.minPriorityProviderList;
    const nextMinPriorityList = currMinList.includes(providerId)
        ? currMinList
        : [...currMinList, providerId];
    const nextCall = Object.assign(Object.assign({}, currentCall), { minPriorityProviderList: nextMinPriorityList, numOfRetries: ++currentCall.numOfRetries });
    return nextCall;
};
const addProviderIdToCall = (call, providerId) => (Object.assign(Object.assign({}, call), { providerId }));
const trackTime = () => {
    const startTime = new Date();
    return {
        end() {
            const endTime = new Date();
            const avgResponseTime = +endTime - +startTime;
            return avgResponseTime;
        },
    };
};
const makeProviderStats = (timer, isOffline) => ({
    avgResponseTime: timer.end(),
    isOffline,
    currWorkersById: [],
    requestFailures: 0,
});
const makeWorkerId = (providerId, workerNumber) => `${providerId}_worker_${workerNumber}`;
const makeWorker = (providerId, task) => ({
    assignedProvider: providerId,
    currentPayload: null,
    task,
});
const reduceProcessedProviders = (processedProviders, network) => {
    const initialState = {
        providerStats: {},
        workers: {},
        network,
    };
    return processedProviders.reduce((accu, currProvider) => {
        const curProviderStats = {
            [currProvider.providerId]: currProvider.stats,
        };
        const providerStats = Object.assign(Object.assign({}, accu.providerStats), curProviderStats);
        const workers = Object.assign(Object.assign({}, accu.workers), currProvider.workers);
        return Object.assign(Object.assign({}, accu), { providerStats,
            workers });
    }, initialState);
};
const makeRetVal = (error = null, result = null) => ({ result, error });

class BaseChannel {
    constructor() {
        this.shouldLog = false;
    }
    get() {
        if (!this.chan) {
            throw Error(`Channel not assigned yet`);
        }
        return this.chan;
    }
    *take() {
        const action = yield take(this.get());
        // set the current action, so when we flush all of the actions we dont miss the currently processing one
        const callid = action.payload.callId;
        this.currentAction = action;
        this.log(`took call`, action.payload.callId);
        // set the current action to null when it isnt in a state of "requested"
        yield put(subscribeToAction({
            trigger: triggerOnMatchingCallId(this.currentAction.payload.callId, true),
            callback: () => {
                this.log(`call ${this.currentAction &&
                    this.currentAction.payload.callId} is now null `);
                this.currentAction = null;
            },
        }));
        this.log(`Returning ${this.currentAction} ${callid}`);
        return this.currentAction;
    }
    *cancelPendingCalls() {
        const pendingCalls = yield apply(this, this.getPendingCalls);
        for (const { payload } of pendingCalls) {
            yield put(providerCallFlushed({
                error: 'Call Flushed',
                providerCall: payload,
            }));
        }
    }
    log(...args) {
        if (this.shouldLog) {
            console.log(this.name, ...args);
        }
    }
    *flushChannel() {
        const messages = yield flush(this.get());
        this.log(`flushing`);
        this.log(messages);
        return messages;
    }
    *getPendingCalls() {
        const queuedCalls = yield apply(this, this.flushChannel);
        const pendingCalls = this.currentAction
            ? [...queuedCalls, this.currentAction]
            : queuedCalls;
        this.log(`get pending calls`);
        this.log(pendingCalls);
        this.currentAction = null;
        return pendingCalls;
    }
}

class BalancerChannel extends BaseChannel {
    constructor() {
        super(...arguments);
        this.name = 'Balancer Channel';
    }
    *init() {
        this.chan = yield actionChannel(PROVIDER_CALL.REQUESTED, buffers.expanding(50));
    }
}

class ProviderChannel extends BaseChannel {
    constructor() {
        super(...arguments);
        this.name = 'Provider Channel';
    }
    *init() {
        this.chan = yield call(channel, buffers.expanding(10));
    }
}
function* providerChannelFactory() {
    const chan = new ProviderChannel();
    yield apply(chan, chan.init);
    return chan;
}

class ProviderChannels {
    constructor() {
        this.providerChannels = {};
    }
    *put(providerId, action) {
        const chan = this.getChannel(providerId).get();
        yield put(chan, action);
    }
    *createChannel(providerId) {
        if (this.providerChannels[providerId]) {
            throw Error(`${providerId} already has an existing channel open`);
        }
        const providerChannel = yield call(providerChannelFactory);
        this.providerChannels[providerId] = providerChannel;
    }
    *take(providerId) {
        const channel = this.getChannel(providerId);
        const action = yield apply(channel, channel.take);
        return action;
    }
    *cancelPendingCalls() {
        const chans = Object.values(this.providerChannels);
        for (const chan of chans) {
            yield apply(chan, chan.cancelPendingCalls);
        }
    }
    deleteAllChannels() {
        for (const providerId of Object.keys(this.providerChannels)) {
            this.deleteChannel(providerId);
        }
    }
    deleteChannel(providerId) {
        //check for existence
        this.getChannel(providerId);
        Reflect.deleteProperty(this.providerChannels, providerId);
    }
    getChannel(providerId) {
        const channel = this.providerChannels[providerId];
        if (!channel) {
            throw Error(`${providerId} does not have an existing channel`);
        }
        return channel;
    }
}

const balancerChannel = new BalancerChannel();
const providerChannels = new ProviderChannels();

const isWeb3Method = (rpcMethod) => rpcMethod === 'sendTransaction' || rpcMethod === 'signMessage';
function* sendRequestToProvider(providerId, rpcMethod, rpcArgs) {
    try {
        const { provider, timeoutThreshold, } = yield select(getProviderInstAndTimeoutThreshold, providerId);
        // make the call in the allotted timeout time
        const { result } = yield race({
            result: apply(provider, provider[rpcMethod], rpcArgs),
            // HACK: If it's an web3 method, then wait 5 minutes because it can be intercepted (see metamask) and then waits on user confirmation
            // TODO: refactor this to support web3 providers natively
            timeout: call(delay, isWeb3Method(rpcMethod) ? 60 * 1000 * 5 : timeoutThreshold),
        });
        if (!result) {
            const error = Error(`Request timed out for ${providerId}`);
            return makeRetVal(error);
        }
        return makeRetVal(null, result);
    }
    catch (error) {
        return makeRetVal(error);
    }
}
function* processRequest(providerId, workerId) {
    // take from the assigned action channel
    const { payload } = yield apply(providerChannels, providerChannels.take, [providerId]);
    const { rpcArgs, rpcMethod } = payload;
    const callWithPid = addProviderIdToCall(payload, providerId);
    if (yield select(isStaleCall, payload.callId)) {
        logger.log(`Call ${payload.callId} is stale before processing`);
        return;
    }
    // after taking a request, declare processing state
    yield put(workerProcessing({ currentPayload: callWithPid, workerId }));
    const { result, error } = yield call(sendRequestToProvider, providerId, rpcMethod, rpcArgs);
    if (yield select(isStaleCall, payload.callId)) {
        logger.log(`Call ${payload.callId} is stale after processing`);
        return;
    }
    if (result) {
        const action = providerCallSucceeded({
            result,
            providerCall: callWithPid,
        });
        return yield put(action);
    }
    else {
        const actionParams = {
            providerCall: callWithPid,
            error,
        };
        const action = isWeb3Method(rpcMethod)
            ? providerCallFailed(actionParams)
            : providerCallTimeout(actionParams);
        return yield put(action);
    }
}
function* processIncomingRequests(thisId, providerId) {
    while (true) {
        yield call(processRequest, providerId, thisId);
    }
}
function* createWorker(thisId, providerId) {
    try {
        yield call(processIncomingRequests, thisId, providerId);
    }
    catch (e) {
        console.error(`${thisId} as errored with ${e.message}`);
    }
    finally {
        if (yield cancelled()) {
            logger.log(`${thisId} has been cancelled`);
        }
    }
}

function* spawnWorkers(providerId, currentWorkers, maxNumOfWorkers) {
    const providerChannel = yield apply(providerChannels, providerChannels.createChannel, [providerId]);
    const workers = {};
    for (let workerNumber = currentWorkers.length; workerNumber < maxNumOfWorkers; workerNumber++) {
        const workerId = makeWorkerId(providerId, workerNumber);
        const workerTask = yield spawn(createWorker, workerId, providerId, providerChannel);
        workers[workerId] = makeWorker(providerId, workerTask);
    }
    return { workers, workerIds: [...currentWorkers, ...Object.keys(workers)] };
}

/**
 * @description polls the offline state of a provider, then returns control to caller when it comes back online
 * @param {string} providerId
 */
function* checkProviderConnectivity(providerId) {
    const provider = providerStorage.getInstance(providerId);
    const timeoutThreshold = yield select(getProviderTimeoutThreshold, providerId);
    try {
        const { lb } = yield race({
            lb: apply(provider, provider.getCurrentBlock),
            to: call(delay, timeoutThreshold),
        });
        return !!lb;
    }
    catch (error) {
        logger.log(error);
    }
    return false;
}

/**
 *
 * @description Handles checking if a provider is online or not,
 * and spawning workers for its concurrency rating
 * @param {string} providerId
 * @param {ProviderConfig} config
 */
function* processProvider(providerId, { concurrency }) {
    const timer = trackTime();
    const providerIsOnline = yield call(checkProviderConnectivity, providerId);
    const stats = makeProviderStats(timer, !providerIsOnline);
    if (!providerIsOnline) {
        yield put(providerOffline({ providerId }));
    }
    const { workers, workerIds } = yield call(spawnWorkers, providerId, stats.currWorkersById, concurrency);
    stats.currWorkersById = workerIds;
    const processedProvider = { providerId, stats, workers };
    return processedProvider;
}

function* handleAddingProviderConfig({ payload: { config, id }, }) {
    const network = yield select(getNetwork);
    if (network !== config.network) {
        return;
    }
    const { processedProvider, } = yield race({
        processedProvider: call(processProvider, id, config),
        cancelled: take(BALANCER.NETWORK_SWTICH_REQUESTED),
    });
    if (!processedProvider) {
        return;
    }
    yield put(providerAdded(processedProvider));
}
const addProviderConfigWatcher = [
    takeEvery(PROVIDER_CONFIG.ADD, handleAddingProviderConfig),
];

function* clearWorkers() {
    const workers = yield select(getWorkers);
    for (const worker of Object.values(workers)) {
        yield cancel(worker.task);
    }
}
function* clearAllPendingCalls() {
    yield apply(providerChannels, providerChannels.cancelPendingCalls);
    yield apply(balancerChannel, balancerChannel.cancelPendingCalls);
}
function* deleteProviderChannels() {
    yield apply(providerChannels, providerChannels.deleteAllChannels);
}
function* clearState({ type }) {
    const isNetworkSwitch = type === BALANCER.NETWORK_SWTICH_REQUESTED;
    yield call(clearAllPendingCalls);
    if (isNetworkSwitch) {
        yield put(balancerFlush());
        yield call(clearWorkers);
        yield call(deleteProviderChannels);
    }
}
const balancerFlushWatcher = [
    takeEvery([
        BALANCER.NETWORK_SWTICH_REQUESTED,
        BALANCER.QUEUE_TIMEOUT,
        BALANCER.MANUAL_SUCCEEDED,
    ], clearState),
];

/**
 * @name filterAgainstArray
 * @description Compares each entry in arr1 against all entries in arr2, if the entry in arr1 matches an entry in arr2 then it is included in the result
 * @param arr1 An array of entries
 * @param arr2 An array of strings to check each entry against
 * @param invert Includes results from arr1 that arent in arr2 instead
 */
const filterAgainstArr = (arr1, arr2, invert = false) => arr1.filter(strToCheck => !invert ? arr2.includes(strToCheck) : !arr2.includes(strToCheck));

const providerExceedsRequestFailureThreshold = (state, { payload }) => {
    const { providerCall: { providerId } } = payload;
    const providerStats = getProviderStatsById(state, providerId);
    const providerConfig = getProviderConfigById(state, providerId);
    if (!providerStats || !providerConfig) {
        throw Error('Could not find provider stats or config');
    }
    // if the provider has reached maximum failures, declare it as offline
    return (providerStats.requestFailures >= providerConfig.requestFailureThreshold);
};
const getAllProvidersOfNetwork = (state, networkId) => {
    const allProvidersOfNetworkId = {};
    const providerConfigs = getProviderConfigs(state);
    return Object.entries(providerConfigs).reduce((allProviders, [currProviderId, currProviderConfig]) => {
        if (currProviderConfig.network !== networkId) {
            return allProviders;
        }
        return Object.assign(Object.assign({}, allProviders), { [currProviderId]: currProviderConfig });
    }, allProvidersOfNetworkId);
};
const getOnlineProviderIdsOfCurrentNetwork = (state) => {
    const network = getNetwork(state);
    const onlineProviders = getOnlineProviders(state);
    const providersOfCurrentNetwork = Object.keys(onlineProviders).filter(id => {
        const config = getProviderConfigById(state, id);
        return config && config.network === network;
    });
    return providersOfCurrentNetwork;
};
const getAllMethodsAvailable = (state) => {
    const availableProviderIds = getOnlineProviderIdsOfCurrentNetwork(state);
    const manualProvider = getManualMode(state);
    // goes through each available provider and reduces all of their
    // available methods into a mapping that contains all supported methods
    const availableMethods = {
        getNetVersion: false,
        estimateGas: false,
        getBalance: false,
        getCurrentBlock: false,
        getTransactionCount: false,
        ping: false,
        sendCallRequest: false,
        sendCallRequests: false,
        sendRawTx: false,
        getTransactionByHash: false,
        getTransactionReceipt: false,
        /* Web3 Methods*/
        sendTransaction: false,
        signMessage: false,
    };
    for (const providerId of availableProviderIds) {
        const providerConfig = getProviderConfigById(state, providerId);
        if (!providerConfig) {
            continue;
        }
        if (manualProvider && providerId !== manualProvider) {
            continue;
        }
        // for the current provider config, OR each rpcMethod against the map
        Object.entries(providerConfig.supportedMethods).forEach(([rpcMethod, isSupported]) => {
            availableMethods[rpcMethod] =
                availableMethods[rpcMethod] || isSupported;
        });
    }
    // check that all methods are supported by the set of all available providers
    return allRPCMethods.reduce((allAvailable, curMethod) => allAvailable && availableMethods[curMethod], true);
};
// available providers -> providers that support the method -> providers that are whitelisted -> prioritized providers -> workers not busy
// TODO: include response time in prioritization
const getAvailableProviderId = (state, payload) => {
    const onlineProviders = getOnlineProviderIdsOfCurrentNetwork(state);
    // filter by providers that can support this method
    const supportsMethod = onlineProviders.filter(providerId => providerSupportsMethod(state, providerId, payload.rpcMethod));
    // filter providers that are in the whitelist if it exists, else continue with providers that support the method
    const payloadProviderWhitelist = payload.providerWhiteList;
    const isWhitelisted = payloadProviderWhitelist
        ? filterAgainstArr(supportsMethod, payloadProviderWhitelist)
        : supportsMethod;
    // grab the providers that are not included in min priority
    const prioritized1 = filterAgainstArr(isWhitelisted, payload.minPriorityProviderList, true);
    // grab the providers that are included
    const prioritized2 = filterAgainstArr(isWhitelisted, payload.minPriorityProviderList);
    // prioritize the list by using providers with most workers free
    const listToPrioritizeByWorker = prioritized1.length > 0 ? prioritized1 : prioritized2;
    let prevProvider = null;
    for (const currentProviderId of listToPrioritizeByWorker) {
        const numOfRequestsCurrentProcessing = getPendingProviderCallsByProviderId(state, currentProviderId);
        // if there's no selected provider yet (aka first iteration)
        // or
        // the current provider has less requests processing, switch the next provider to current provider
        if (!prevProvider ||
            prevProvider.numOfRequestsCurrentProcessing >
                numOfRequestsCurrentProcessing) {
            prevProvider = {
                providerId: currentProviderId,
                numOfRequestsCurrentProcessing,
            };
        }
    }
    return prevProvider ? prevProvider.providerId : null;
};

var rootSelectors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    providerExceedsRequestFailureThreshold: providerExceedsRequestFailureThreshold,
    getAllProvidersOfNetwork: getAllProvidersOfNetwork,
    getOnlineProviderIdsOfCurrentNetwork: getOnlineProviderIdsOfCurrentNetwork,
    getAllMethodsAvailable: getAllMethodsAvailable,
    getAvailableProviderId: getAvailableProviderId
});

function* dispatchOffline() {
    const offline = yield select(isOffline);
    if (!offline) {
        return yield put(setOffline());
    }
}
function* dispatchOnline() {
    const offline = yield select(isOffline);
    const online = !offline;
    if (!online) {
        return yield put(setOnline());
    }
}
function* setBalancerOnlineState({ type }) {
    if (type === BALANCER.NETWORK_SWTICH_REQUESTED) {
        yield call(dispatchOffline);
        //block until network switch is done
        return yield take(BALANCER.NETWORK_SWITCH_SUCCEEDED);
    }
    // check if all methods are available after this provider is online
    const isAllMethodsAvailable = yield select(getAllMethodsAvailable);
    // if they are, put app in online state
    if (isAllMethodsAvailable) {
        yield call(dispatchOnline);
    }
    else {
        yield call(dispatchOffline);
    }
}
function* handleBalancerHealth() {
    const chan = yield actionChannel([
        PROVIDER_STATS.ONLINE,
        PROVIDER_STATS.OFFLINE,
        PROVIDER_STATS.ADDED,
        PROVIDER_STATS.REMOVED,
        BALANCER.NETWORK_SWITCH_SUCCEEDED,
        BALANCER.NETWORK_SWTICH_REQUESTED,
        BALANCER.AUTO,
        BALANCER.MANUAL_SUCCEEDED,
    ], buffers.expanding(50));
    while (true) {
        const action = yield take(chan);
        yield call(setBalancerOnlineState, action);
    }
}
const balancerHealthWatcher = [fork(handleBalancerHealth)];

function* handleCallTimeouts(action) {
    const { payload: { error, providerCall } } = action;
    const { providerId } = providerCall;
    const shouldSetProviderOffline = yield select(providerExceedsRequestFailureThreshold, action);
    if (shouldSetProviderOffline) {
        yield put(providerOffline({ providerId }));
    }
    const callFailed = yield select(callMeetsBalancerRetryThreshold, action);
    if (callFailed) {
        yield put(providerCallFailed({ error: error.message, providerCall }));
    }
    else {
        const nextProviderCall = createRetryCall(providerCall);
        yield put(providerCallRequested(nextProviderCall));
    }
}
const callTimeoutWatcher = [
    takeEvery(PROVIDER_CALL.TIMEOUT, handleCallTimeouts),
];

function* attemptManualMode(providerId, skipOfflineCheck) {
    const config = yield select(getProviderConfigById, providerId);
    if (!config) {
        return yield put(setManualFailed({
            error: `Provider config for ${providerId} not found`,
        }));
    }
    const isOnline = yield call(checkProviderConnectivity, providerId);
    if (!isOnline && !skipOfflineCheck) {
        return yield put(setManualFailed({
            error: `${providerId} to manually set to is not online`,
        }));
    }
    const network = yield select(getNetwork);
    if (config.network !== network) {
        logger.log(`Manually set provider ${providerId} has a different network
      (Provider network: ${config.network}, current network ${network}).
       Setting new network`);
        const requestAction = balancerNetworkSwitchRequested({
            network: config.network,
        });
        yield put(requestAction);
        yield take((action) => {
            if (action.type === BALANCER.NETWORK_SWITCH_SUCCEEDED) {
                return action.meta.id === requestAction.meta.id;
            }
            return false;
        });
    }
    yield put(setManualSucceeded({ providerId }));
}
function* handleManualMode({ payload: { providerId, skipOfflineCheck }, }) {
    yield call(attemptManualMode, providerId, skipOfflineCheck);
}
const manualModeWatcher = [
    takeEvery(BALANCER.MANUAL_REQUESTED, handleManualMode),
];

/**
 * @description Gets all of the providers of the requested next network,
 * then creates all of the workers and provider statistics required for a successful switch
 * @param network
 */
function* initializeNewNetworkProviders(network) {
    const providers = yield select(getAllProvidersOfNetwork, network);
    const providerEntries = Object.entries(providers).map(([providerId, providerConfig]) => call(processProvider, providerId, providerConfig));
    // process adding all providers in parallel
    const processedProviders = yield all(providerEntries);
    const networkSwitchPayload = reduceProcessedProviders(processedProviders, network);
    return networkSwitchPayload;
}

function* handleNetworkSwitch$2({ payload, meta, }) {
    const networkSwitchPayload = yield call(initializeNewNetworkProviders, payload.network);
    logger.log(`Network switch to ${payload.network} succeeded`);
    yield put(balancerNetworkSwitchSucceeded(networkSwitchPayload, meta.id));
}
function* networkSwitchActionChannel() {
    const chan = yield actionChannel([BALANCER.NETWORK_SWTICH_REQUESTED, BALANCER.INIT], buffers.expanding(50));
    while (true) {
        const action = yield take(chan);
        logger.log(`Taking action ${JSON.stringify(action, null, 1)}`);
        yield call(handleNetworkSwitch$2, action);
    }
}
// we dont use takeevery here to avoid processing two switch requests at the same time
const watchNetworkSwitches = [fork(networkSwitchActionChannel)];

function* getOptimalProviderId(payload) {
    // check if the app is offline
    if (yield select(isOffline)) {
        yield take(BALANCER.ONLINE); // wait until its back online
    }
    // get an available providerId to put the action to the channel
    const providerId = yield select(getAvailableProviderId, payload);
    if (!providerId) {
        // TODO: seperate this into a different action
        const action = providerCallFailed({
            providerCall: Object.assign(Object.assign({}, payload), { providerId: 'SHEPHERD' }),
            error: 'No available provider found',
        });
        yield put(action);
        return undefined;
    }
    return providerId;
}
function* handleRequest() {
    yield apply(balancerChannel, balancerChannel.init);
    while (true) {
        // test if this starts queue timeout
        const action = yield apply(balancerChannel, balancerChannel.take);
        function* process() {
            if (!action) {
                return;
            }
            const { payload } = action;
            const providerId = yield call(getOptimalProviderId, payload);
            if (providerId) {
                yield apply(providerChannels, providerChannels.put, [
                    providerId,
                    action,
                ]);
            }
        }
        const queueTimeoutMs = yield select(getQueueTimeout);
        const { queueTimeout } = yield race({
            processed: call(process),
            // we cancel in case of a balancer flush
            // so we dont put an action that's about to be flushed
            // to a worker
            networkSwitch: take(BALANCER.FLUSH),
            queueTimeout: call(delay, queueTimeoutMs),
        });
        if (queueTimeout) {
            console.error('Queue timeout');
            yield put(balancerQueueTimeout());
        }
    }
}
const providerRequestWatcher = [fork(handleRequest)];

function* pollProviderUntilConnected(providerId) {
    while (true) {
        yield call(delay, 5000);
        const connected = yield call(checkProviderConnectivity, providerId);
        if (connected) {
            return true;
        }
    }
}
/**
 * @description waits for any action that adds to the provider stats reducer,
 * and only returns when the specified provider exists
 * @param providerId
 */
function* waitForProviderStatsToExist(providerId) {
    while (true) {
        const stats = yield select(getProviderStatsById, providerId);
        if (stats) {
            return true;
        }
        yield take([BALANCER.NETWORK_SWITCH_SUCCEEDED, PROVIDER_STATS.ADDED]);
    }
}

function* watchOfflineProvider({ payload: { providerId }, }) {
    yield call(pollProviderUntilConnected, providerId);
    // handles failure case of:
    // network switch requested
    // provider isnt online so this fires
    // provider is online before network switch is successful
    // this puts an action to a non existent provider id
    yield call(waitForProviderStatsToExist, providerId);
    yield put(providerOnline({ providerId }));
    return true;
}
function* handleWatching(action) {
    yield race({
        online: call(watchOfflineProvider, action),
        networkSwitched: take(BALANCER.NETWORK_SWTICH_REQUESTED),
    });
}
const providerHealthWatcher = [
    takeEvery(PROVIDER_STATS.OFFLINE, handleWatching),
];

const watchers = [
    ...watchNetworkSwitches,
    ...subscriptionWatcher,
    ...addProviderConfigWatcher,
    ...balancerFlushWatcher,
    ...callTimeoutWatcher,
    ...providerRequestWatcher,
    ...providerHealthWatcher,
    ...balancerHealthWatcher,
    ...manualModeWatcher,
];

function* providerBalancer$1() {
    yield all(watchers);
}

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = composeWithDevTools({
    realtime: true,
    port: 8000,
    maxAge: 300,
});
const rootReducer = combineReducers({
    providerBalancer,
    providerConfigs,
});
const middleware = process.env.DEV_TOOLS
    ? composeEnhancers(applyMiddleware(sagaMiddleware, filterMiddlware))
    : applyMiddleware(sagaMiddleware, filterMiddlware);
const store = createStore(rootReducer, middleware);
storeManager.setStore(store);
const INITIAL_ROOT_STATE = rootReducer(undefined, {});
sagaMiddleware.run(providerBalancer$1);
const selectors = {
    rootSelectors,
    providerBalancerSelectors,
    providerConfigsSelectors,
};

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    shepherdMiddlware: filterMiddlware,
    providerBalancerSaga: providerBalancer$1,
    rootReducer: rootReducer,
    store: store,
    INITIAL_ROOT_STATE: INITIAL_ROOT_STATE,
    selectors: selectors
});

export { index as redux, shepherd };
//# sourceMappingURL=shepherd.es6.js.map
