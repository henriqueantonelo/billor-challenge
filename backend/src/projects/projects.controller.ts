import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  async create(@Body() project: Project): Promise<Project> {
    return this.projectsService.create(project);
  }
}