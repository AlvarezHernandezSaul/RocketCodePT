import { supabase } from '../config/database.js';
import { User, Project, Issue } from '../models/index.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
    this.tableName = model.tableName;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(this.model.toDatabase(data))
      .select()
      .single();

    if (error) throw error;
    return this.model.fromDatabase(result);
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.model.fromDatabase(data);
  }

  async findAll(filters = {}) {
    let query = supabase.from(this.tableName).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data.map(item => this.model.fromDatabase(item));
  }

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(this.model.toDatabase(data))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.model.fromDatabase(result);
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.model.fromDatabase(data) : null;
  }
}

export class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findByOwnerId(ownerId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return data.map(item => this.model.fromDatabase(item));
  }
}

export class IssueRepository extends BaseRepository {
  constructor() {
    super(Issue);
  }

  async findByProjectId(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data.map(item => this.model.fromDatabase(item));
  }

  async findByAssigneeId(assigneeId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('assignee_id', assigneeId);

    if (error) throw error;
    return data.map(item => this.model.fromDatabase(item));
  }
}
