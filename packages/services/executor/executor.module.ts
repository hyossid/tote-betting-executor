import { Module } from '@nestjs/common';
import { PersistentModule } from '@root/persistent/persistent.module';
import { ExecutorProvider } from '@root/services/executor/executor.service';
import { CustomModuleModule } from '../custom-module/custom-module.module';
import { ExecutorRepository } from './executor.repository';

@Module({
  imports: [PersistentModule, CustomModuleModule],
  providers: [ExecutorProvider, ExecutorRepository],
  exports: [ExecutorProvider],
})
export class ExecutorModule {}
