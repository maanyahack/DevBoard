import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getDashboard } from '../services/dashboard.service.js';
import { generateText } from '../services/ai.service.js';

function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

export async function getDashboardData(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const dashboard = await getDashboard(user.id);

    res.status(200).json(dashboard);
  } catch (error) {
    next(error);
  }
}

export async function getDashboardInsights(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const data = await getDashboard(user.id);

    const completionRate = data.stats.tasks > 0
      ? Math.round((data.stats.completedTasks / data.stats.tasks) * 100)
      : 0;

    const activeProjectNames = data.activeProjects.map((p) => p.name).join(', ') || 'none';
    const recentTaskTitles = data.recentTasks.slice(0, 3).map((t) => t.title).join(', ') || 'none';
    const recentNoteTitles = data.recentNotes.slice(0, 3).map((n) => n.title).join(', ') || 'none';

    const prompt = `You are a productivity assistant for a software developer.

Their current workspace summary:
- Projects: ${data.stats.projects} total, active: ${activeProjectNames}
- Tasks: ${data.stats.tasks} total, ${data.stats.completedTasks} completed (${completionRate}% completion rate)
- Notes: ${data.stats.notes} total
- Recent tasks: ${recentTaskTitles}
- Recent notes: ${recentNoteTitles}

Provide 2-3 short, practical, and encouraging productivity insights based on this data. Focus on what they can improve or celebrate. Use plain sentences, no markdown, no bullet points, no headers. Keep the total response under 80 words.`;

    const result = await generateText({ prompt });

    res.status(200).json({ insights: result.text.trim() });
  } catch (error) {
    next(error);
  }
}
