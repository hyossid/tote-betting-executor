import { Logger } from '@nestjs/common';
import { CustomModuleService } from '@root/services/custom-module/custom-module.interface';

export class DefaultCustomModuleService implements CustomModuleService {
  private logger = new Logger(DefaultCustomModuleService.name);
  constructor() {}

  async processData({ data }: any): Promise<void> {
    // INFO : Users may implement own logic here
    return data;
  }
}
export const CustomModuleProvider = {
  provide: CustomModuleService,
  useClass: DefaultCustomModuleService,
};

export default CustomModuleProvider;
