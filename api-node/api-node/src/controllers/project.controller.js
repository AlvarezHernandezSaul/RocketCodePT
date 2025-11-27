import { ProjectRepository, IssueRepository } from '../repositories/index.js';

const projectRepository = new ProjectRepository();
const issueRepository = new IssueRepository();

export class ProjectController {
  static async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const project = await projectRepository.create({
        name,
        description: description || '',
        owner_id: req.user.id
      });

      res.status(201).json({ project });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAll(req, res) {
    try {
      const projects = await projectRepository.findByOwnerId(req.user.id);
      res.json({ projects });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const project = await projectRepository.findById(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ project });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;

      const existingProject = await projectRepository.findById(id);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (existingProject.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const project = await projectRepository.update(id, {
        name: name || existingProject.name,
        description: description !== undefined ? description : existingProject.description,
        status: status || existingProject.status
      });

      res.json({ project });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingProject = await projectRepository.findById(id);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (existingProject.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await projectRepository.delete(id);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getIssues(req, res) {
    try {
      const { id } = req.params;

      const project = await projectRepository.findById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const issues = await issueRepository.findByProjectId(id);
      res.json({ issues });
    } catch (error) {
      console.error('Get project issues error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
