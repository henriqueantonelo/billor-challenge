import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpException, HttpStatus, Query } from '@nestjs/common';
import { NotesService } from './notes.service.js';
import { Note } from './note.entity.js';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes for a project with pagination and search' })
  @ApiQuery({ name: 'projectId', required: true, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('projectId') projectId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<Note[]> {
    const parsedProjectId = parseInt(projectId, 10);
    if (isNaN(parsedProjectId)) {
      throw new HttpException('Invalid projectId', HttpStatus.BAD_REQUEST);
    }
    const parsedCursor = cursor ? parseInt(cursor, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.notesService.findAll(parsedProjectId, parsedCursor, parsedLimit, search);
  }

  @Post()
  @ApiOperation({ summary: 'Create a note' })
  async create(@Body() note: Note, @Request() req): Promise<Note> {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      throw new HttpException('Idempotency-Key header required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.create(note, idempotencyKey);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a note' })
  async update(@Param('id') id: string, @Body() note: Note): Promise<Note> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new HttpException('Invalid note ID', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.update(parsedId, note);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  async delete(@Param('id') id: string): Promise<void> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new HttpException('Invalid note ID', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.delete(parsedId);
  }
}