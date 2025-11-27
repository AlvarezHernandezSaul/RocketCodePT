import { IssueRepository, ProjectRepository } from '../repositories/index.js';

const issueRepository = new IssueRepository();
const projectRepository = new ProjectRepository();

export class IssueController {
  static async create(req, res) {
    try {
      const { title, description, project_id, priority, assignee_id } = req.body;

      if (!title || !project_id) {
        return res.status(400).json({ error: 'Title and project_id are required' });
      }

      const project = await projectRepository.findById(project_id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      let tags = [];
      try {
        const classificationResponse = await fetch('http://localhost:8001/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description: description || '' })
        });

        if (classificationResponse.ok) {
          const classificationData = await classificationResponse.json();
          tags = classificationData.tags || [];
        }
      } catch (error) {
        console.warn('Classification service unavailable:', error.message);
      }

      const issue = await issueRepository.create({
        title,
        description: description || '',
        project_id,
        assignee_id: assignee_id || null,
        reporter_id: req.user.id,
        priority: priority || 'medium',
        tags
      });

      res.status(201).json({ issue });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAll(req, res) {
    try {
      const { project_id, status, assignee_id } = req.query;
      let issues;

      if (project_id) {
        const project = await projectRepository.findById(project_id);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }

        if (project.owner_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        issues = await issueRepository.findByProjectId(project_id);
      } else if (assignee_id) {
        if (assignee_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
        issues = await issueRepository.findByAssigneeId(assignee_id);
      } else {
        issues = await issueRepository.findAll();
        issues = issues.filter(issue => {
          return issue.project_id && issue.project.owner_id === req.user.id;
        });
      }

      if (status) {
        issues = issues.filter(issue => issue.status === status);
      }

      res.json({ issues });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const issue = await issueRepository.findById(id);

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const project = await projectRepository.findById(issue.project_id);
      if (!project || project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ issue });
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, status, priority, assignee_id, tags } = req.body;

      const existingIssue = await issueRepository.findById(id);
      if (!existingIssue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const project = await projectRepository.findById(existingIssue.project_id);
      if (!project || project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const issue = await issueRepository.update(id, {
        title: title || existingIssue.title,
        description: description !== undefined ? description : existingIssue.description,
        status: status || existingIssue.status,
        priority: priority || existingIssue.priority,
        assignee_id: assignee_id !== undefined ? assignee_id : existingIssue.assignee_id,
        tags: tags !== undefined ? tags : existingIssue.tags
      });

      res.json({ issue });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingIssue = await issueRepository.findById(id);
      if (!existingIssue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const project = await projectRepository.findById(existingIssue.project_id);
      if (!project || project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await issueRepository.delete(id);
      res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
