import { Module } from '@nestjs/common';
import CustomModuleProvider from './custom-module.service';

@Module({
  imports: [],
  providers: [CustomModuleProvider],
  exports: [CustomModuleProvider],
})
export class CustomModuleModule {}
