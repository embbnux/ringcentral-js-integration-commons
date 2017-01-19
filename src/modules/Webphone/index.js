import RingCentralWebphone from 'ringcentral-web-phone';
import incomingAudio from 'ringcentral-web-phone/audio/incoming.ogg';
import outgoingAudio from 'ringcentral-web-phone/audio/outgoing.ogg';
import { combineReducers } from 'redux';
import RcModule from '../../lib/RcModule';
import Enum from '../../lib/Enum';
import moduleStatus from '../../enums/moduleStatus';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

const connectionStatus = new Enum([
  'connecting',
  'connected',
  'disconnecting',
  'disconnected',
], 'connectionStatus');

const actionTypes = new Enum([
  'initSuccess',
  'connect',
  'connectSuccess',
  'connectError',
], 'webphone');

function getVideoElementPreparedReducer(types) {
  return (state = false, { type, videoElementPrepared = state }) => {
    if (type === types.initSuccess) return videoElementPrepared;
    return state;
  };
}

function getConnectionStatusReducer(types) {
  return (state = connectionStatus.disconnected, { type }) => {
    switch (type) {
      case types.connect:
        return connectionStatus.connecting;
      case types.connectSuccess:
        return connectionStatus.connected;
      case types.connectError:
        return connectionStatus.disconnected;
      default:
        return state;
    }
  };
}

function getWebphoneReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    videoElementPrepared: getVideoElementPreparedReducer(types),
    connectionStatus: getConnectionStatusReducer(types),
  });
}


export default class Webphone extends RcModule {
  constructor({
    appKey,
    appName,
    appVersion,
    auth,
    client,
    rolesAndPermissions,
    webphoneLogLevel = 3,
    ...options,
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._appKey = appKey;
    this._appName = appName;
    this._appVersion = appVersion;
    this._webphoneLogLevel = webphoneLogLevel;
    this._auth = auth;
    this._client = client;
    this._rolesAndPermissions = rolesAndPermissions;
    this._webphone = null;
    this._session = null;
    this._remoteVideo = null;
    this._localVideo = null;

    this._reducer = getWebphoneReducer(this.actionTypes);
  }
  _onStateChange = async () => {

  }
  initialize() {
    this.store.subscribe(this._onStateChange);
    if (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    ) {
      this._remoteVideo = document.createElement('video');
      this._remoteVideo.setAttribute('hidden', 'hidden');
      this._localVideo = document.createElement('video');
      this._localVideo.setAttribute('hidden', 'hidden');
      this._localVideo.setAttribute('muted', 'muted');
      document.body.appendChild(this._remoteVideo);
      document.body.appendChild(this._localVideo);
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
        videoElementPrepared: true,
      });
    } else {
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
        videoElementPrepared: false,
      });
    }
  }

  get status() {
    return this.state.status;
  }

  get ready() {
    return this.state.status === moduleStatus.ready;
  }

  get videoElementPrepared() {
    return this.state.videoElementPrepared;
  }

  get enabled() {
    return this.videoElementPrepared && this._rolesAndPermissions.webphoneEnabled;
  }

  get connectionStatus() {
    return this.state.connectionStatus;
  }
  async _sipProvision() {
    return (await this._client.service.platform()
      .post('/client-info/sip-provision', {
        sipInfo: [{ transport: 'WSS' }]
      })).json();
  }

  _createWebphone(provisionData) {
    this._webphone = new RingCentralWebphone(provisionData, {
      appKey: this._appKey,
      appName: this._appName,
      appVersion: this._appVersion,
      uuid: this._auth.endpoingId,
      logLevel: this._webphoneLogLevel, // error 0, warn 1, log: 2, debug: 3
      audioHelper: {
        enabled: true, // enables audio feedback when web phone is ringing or making a call
        incoming: incomingAudio, // path to audio file for incoming call
        outgoing: outgoingAudio, // path to aduotfile for outgoing call
      }
    });
    // this._webphone.userAgent.on('connecting', function () { console.log('@@@ UA connecting'); });
    // this._webphone.userAgent.on('connected', function () { console.log('@@@ UA Connected'); });
    // this._webphone.userAgent.on('disconnected', function () { console.log('@@@ UA Disconnected'); });
    this._webphone.userAgent.on('registered', () => {
      this.store.dispatch({
        type: this.actionTypes.connectSuccess,
      });
    });
    // this._webphone.userAgent.on('unregistered', function () { console.log('@@@ UA Unregistered'); });
    this._webphone.userAgent.once('registrationFailed', (error) => {
      this.store.dispatch({
        type: this.actionTypes.connectError,
        error,
      });
    });
    // this._webphone.userAgent.on('message', function () { console.log('@@@ UA Message', arguments); });
  }

  async connect() {
    if (
      (await this._auth.checkIsLoggedIn()) &&
      this.enabled &&
      this.connectionStatus === connectionStatus.disconnected
    ) {
      try {
        this.store.dispatch({
          type: this.actionTypes.connect,
        });
        this._createWebphone(await this._sipProvision());
      } catch (error) {
        this.store.dispatch({
          type: this.actionTypes.connectError,
          error,
        });
      }
    }
  }
}
