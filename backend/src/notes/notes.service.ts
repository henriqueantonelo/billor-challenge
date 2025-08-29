import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Note } from './note.entity';
import { Project } from '../projects/project.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  // Método para buscar todas as notas de um projeto
  async findAll(
    projectId: number,
    cursor?: number,
    limit = 10,
    search?: string,
  ): Promise<Note[]> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new HttpException('Invalid projectId', HttpStatus.BAD_REQUEST);
    }

    const where: any = { projectId };
    if (search) {
      where.title = Like(`%${search}%`);
    }
    if (cursor) {
      where.id = cursor;
    }

    return this.notesRepository.find({
      where,
      take: limit,
      order: { id: 'ASC' },
    });
  }

  // Método para criar uma nota
  async create(note: Note, idempotencyKey: string): Promise<Note> {
    const project = await this.projectsRepository.findOne({ where: { id: note.projectId } });
    if (!project) {
      throw new HttpException('Invalid projectId', HttpStatus.BAD_REQUEST);
    }

    const existingNote = await this.notesRepository.findOne({
      where: { title: note.title, projectId: note.projectId },
    });

    if (existingNote && idempotencyKey) {
      throw new HttpException('Note already exists', HttpStatus.CONFLICT);
    }

    return this.notesRepository.save(note);
  }

  // Método para buscar uma nota pelo ID
  async findOne(id: number): Promise<Note> {
    const note = await this.notesRepository.findOneBy({ id });
    if (!note) {
      throw new HttpException(`Note with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return note;
  }

  // Método para atualizar uma nota
  async update(id: number, noteData: Note): Promise<Note> {
    const note = await this.notesRepository.findOneBy({ id });
    if (!note) {
      throw new HttpException(`Note with id ${id} not found`, HttpStatus.NOT_FOUND);
    }

    // Atualiza os campos se vierem no request
    note.title = noteData.title ?? note.title;
    note.content = noteData.content ?? note.content;
    note.projectId = noteData.projectId ?? note.projectId;

    return this.notesRepository.save(note);
  }

  // Método para deletar uma nota
  async delete(id: number): Promise<void> {
    const result = await this.notesRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
    }
  }
}
