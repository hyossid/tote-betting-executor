export abstract class CustomModuleService {
  abstract processData({ data }: any): Promise<void>;
}
