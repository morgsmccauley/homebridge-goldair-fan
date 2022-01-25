import {
  API,
  AccessoryPlugin,
  Logger,
  AccessoryConfig,
  Service,
  Characteristic,
} from 'homebridge';

import TuyaDevice from './TuyaDevice';

export default class GoldairFanAccessory implements AccessoryPlugin {
  public readonly fanService: Service;
  public readonly informationService: Service;

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly device: TuyaDevice;

  private readonly DPS = {
    ACTIVE: 1,
    ROTATION_SPEED: 3,
    SWING_MODE: 5,
    DISPLAY_LIGHT: 15,
  };

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.device = new TuyaDevice(this.config.id, this.config.key);

    this.informationService = new this.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, this.config.manufacturer)
      .setCharacteristic(this.Characteristic.Model, this.config.model);

    this.fanService = new this.Service.Fan(this.config.name);

    this.fanService.getCharacteristic(this.Characteristic.On)
      .onGet(async () => {
        return await this.device.get(this.DPS.ACTIVE)
          ? this.Characteristic.Active.ACTIVE
          : this.Characteristic.Active.INACTIVE;
      })
      .onSet(async (value) => {
        if (await this.device.get(this.DPS.ACTIVE) !== value) {
          this.device.set(this.DPS.ACTIVE, value);
        }
      });

    this.fanService.getCharacteristic(this.Characteristic.RotationSpeed)
      .setProps({
        minValue: 0,
        maxValue: 3,
        minStep: 1,
      })
      .onGet(() => {
        return this.device.get(this.DPS.ROTATION_SPEED);
      })
      .onSet((value) => {
        if (value !== 0) {
          this.device.set(this.DPS.ROTATION_SPEED, value);
        }
      });

    this.fanService.getCharacteristic(this.Characteristic.SwingMode)
      .onGet(async () => {
        return await this.device.get(this.DPS.SWING_MODE)
          ? this.Characteristic.SwingMode.SWING_ENABLED
          : this.Characteristic.SwingMode.SWING_DISABLED;
      })
      .onSet((value) => {
        this.device.set(this.DPS.SWING_MODE, !!value);
      });

    // use lock to handle display light
    this.fanService.getCharacteristic(this.Characteristic.LockPhysicalControls)
      .onGet(async () => {
        return await this.device.get(this.DPS.DISPLAY_LIGHT)
          ? this.Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED
          : this.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED;
      })
      .onSet((value) => {
        this.device.set(this.DPS.SWING_MODE, !!value);
      });
  }

  getServices() {
    return [
      this.informationService,
      this.fanService,
    ];
  }
}
