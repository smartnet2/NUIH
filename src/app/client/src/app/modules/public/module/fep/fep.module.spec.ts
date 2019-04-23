import { FepModule } from './fep.module';

describe('FepModule', () => {
  let fepModule: FepModule;

  beforeEach(() => {
    fepModule = new FepModule();
  });

  it('should create an instance', () => {
    expect(fepModule).toBeTruthy();
  });
});
