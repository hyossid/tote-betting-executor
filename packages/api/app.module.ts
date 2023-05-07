import { Module } from '@nestjs/common';
import { ExecutorModule } from '@root/services/executor/executor.module';
import { ExecutorController } from './controllers/executor.controller';
import { IndexController } from './controllers/index.controller';

@Module({
  imports: [ExecutorModule],
  controllers: [IndexController, ExecutorController],
})
export class AppModule {}
