import { CharacteristicValue } from 'homebridge';
import TuyApi from 'tuyapi';
import Dataloader from 'dataloader';

type SetOptions = {
  dps: number;
  set: CharacteristicValue;
};

type GetOptions = {
  dps?: number;
  schema?: boolean;
};

type DeviceStatus = {
  [dps: string]: CharacteristicValue;
};

export type Device = {
  find: () => Promise<void>;
  connect: () => Promise<void>;
  get: (getOptions: GetOptions) => Promise<DeviceStatus>;
  set: (setOptions: SetOptions) => Promise<void>;
  disconnect: () => Promise<void>;
};

export default class TuyaDevice {
  private device: Device;
  private initialiseDevicePromise: Promise<void>;
  private deviceStatusLoader: Dataloader<number, CharacteristicValue>;

  constructor(
    public readonly id: string,
    public readonly key: string,
  ) {
    this.device = new TuyApi({
      id: this.id,
      key: this.key,
      issueGetOnConnect: false,
    });

    this.initialiseDevicePromise = this.device.find().then(() => this.device.connect());

    this.deviceStatusLoader = new Dataloader(
      async (dpsList) => {
        const device = await this.getDevice();
        const status = await device.get({ schema: true });
        return dpsList.map((dps) => status.dps[dps]);
      },
      {
        cache: false,
      },
    );
  }

  private async getDevice() {
    await this.initialiseDevicePromise;

    return this.device;
  }

  async get(dps: number) {
    return this.deviceStatusLoader.load(dps);
  }

  async set(dps: number, value: CharacteristicValue) {
    const device = await this.getDevice();

    return device.set({
      dps,
      set: value,
    });
  }

  async terminate() {
    const device = await this.getDevice();
    return device.disconnect();
  }
}
