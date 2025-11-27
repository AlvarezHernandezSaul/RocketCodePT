export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.role = data.role || 'user';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDatabase(dbUser) {
    return new User(dbUser);
  }

  static toDatabase(user) {
    return {
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role || 'user'
    };
  }

  static get tableName() {
    return 'users';
  }
}

export class Project {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.owner_id = data.owner_id;
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDatabase(dbProject) {
    return new Project(dbProject);
  }

  static toDatabase(project) {
    return {
      name: project.name,
      description: project.description,
      owner_id: project.owner_id,
      status: project.status || 'active'
    };
  }

  static get tableName() {
    return 'projects';
  }
}

export class Issue {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.project_id = data.project_id;
    this.assignee_id = data.assignee_id;
    this.reporter_id = data.reporter_id;
    this.status = data.status || 'todo';
    this.priority = data.priority || 'medium';
    this.tags = data.tags || [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDatabase(dbIssue) {
    return new Issue(dbIssue);
  }

  static toDatabase(issue) {
    return {
      title: issue.title,
      description: issue.description,
      project_id: issue.project_id,
      assignee_id: issue.assignee_id,
      reporter_id: issue.reporter_id,
      status: issue.status || 'todo',
      priority: issue.priority || 'medium',
      tags: issue.tags || []
    };
  }

  static get tableName() {
    return 'issues';
  }
}
