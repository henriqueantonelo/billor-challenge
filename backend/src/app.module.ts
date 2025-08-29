import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { ProjectsModule } from './projects/project.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EtagInterceptor } from './etag.interceptor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    NotesModule,
    ProjectsModule, 
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EtagInterceptor,
    },
  ],
})
export class AppModule {}
