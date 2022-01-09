import {
  API,
  AccessoryPlugin,
  Logger,
  AccessoryConfig,
  Service,
  Characteristic,
} from 'homebridge';

export default class GoldairFanAccessory implements AccessoryPlugin {
  public readonly fanService: Service;
  public readonly informationService: Service;

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.log.debug('Example Accessory Plugin Loaded');

    // your accessory must have an AccessoryInformation service
    this.informationService = new this.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, 'Custom Manufacturer')
      .setCharacteristic(this.Characteristic.Model, 'Custom Model');

    this.fanService = new this.Service.Fan(this.config.name);

    this.fanService.getCharacteristic(this.Characteristic.On)
      .onGet(async () => {
        this.log.debug('get on');
        return 2;
      })
      .onSet(async (value) => {
        this.log.debug('set on: ', value);
      });

    this.fanService.getCharacteristic(this.Characteristic.RotationSpeed)
      .setProps({
        minValue: 0,
        maxValue: 3,
        minStep: 1,
      })
      .onGet(async () => {
        this.log.debug('get rotation');
        return 1;
      })
      .onSet(async (value) => {
        this.log.debug('set rotation: ', value);
      });

    this.fanService.getCharacteristic(this.Characteristic.SwingMode)
      .onGet(async () => {
        this.log.debug('get swing');
        return false;
      })
      .onSet(async (value) => {
        this.log.debug('set swing: ', value);

      });
  }

  getServices() {
    return [
      this.informationService,
      this.fanService,
    ];
  }
}
