import { API } from 'homebridge';

import { ACCESSORY_NAME } from './settings';

import GoldairFanAccessory from './GoldairFanAccessory';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(ACCESSORY_NAME, GoldairFanAccessory);
};
