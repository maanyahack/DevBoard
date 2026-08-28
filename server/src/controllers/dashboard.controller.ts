// Import Express types for handler signatures.
import type { NextFunction, Request, Response } from 'express';
// Import User type for the authenticated user.
import type { User } from '@supabase/supabase-js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import AuthenticatedRequest — our custom Request type with .user.
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
// Import the dashboard service that aggregates data from all modules.
import { getDashboard } from '../services/dashboard.service.js';
// Import the AI text generation function for the insights feature.
import { generateText } from '../services/ai.service.js';
// Import the activity logger to record when AI insights are generated.
import { logActivity } from '../services/activity.service.js';

// Helper — extracts and validates the authenticated user from the request.
function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }
  return user;
}

/**
 * GET /api/dashboard — fetch all dashboard data in a single response.
 * Returns stats (counts), recent items, active projects, and activity feed.
 * This is a "aggregate endpoint" — one API call replaces 8 separate queries.
 */
export async function getDashboardData(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // The dashboard service runs all queries in parallel using Promise.all.
    const dashboard = await getDashboard(user.id);

    // The dashboard object is sent directly — it already has the right shape.
    res.status(200).json(dashboard);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dashboard/insights — generate AI-powered productivity insights.
 *
 * This endpoint:
 * 1. Fetches the user's dashboard data (stats, recent items)
 * 2. Builds a detailed prompt with their workspace summary
 * 3. Sends it to Gemini AI for analysis
 * 4. Returns 2-3 short, personalized insights
 *
 * This is the "AI features" part of DevBoard — the server calls the Gemini API
 * and returns the result to the frontend.
 */
export async function getDashboardInsights(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // Fetch the user's current workspace data to provide context to the AI.
    const data = await getDashboard(user.id);

    // Calculate the task completion rate as a percentage.
    // 'Math.round()' rounds to the nearest integer.
    const completionRate = data.stats.tasks > 0
      ? Math.round((data.stats.completedTasks / data.stats.tasks) * 100)
      : 0;  // Avoid division by zero if no tasks exist

    // Build summary strings from the user's data for the AI prompt.
    const activeProjectNames = data.activeProjects.map((p) => p.name).join(', ') || 'none';
    const recentTaskTitles = data.recentTasks.slice(0, 3).map((t) => t.title).join(', ') || 'none';
    const recentNoteTitles = data.recentNotes.slice(0, 3).map((n) => n.title).join(', ') || 'none';

    // Construct a detailed prompt with all the context the AI needs.
    // Template literals allow embedding variables with ${} syntax.
    const prompt = `You are a productivity assistant for a software developer.

Their current workspace summary:
- Projects: ${data.stats.projects} total, active: ${activeProjectNames}
- Tasks: ${data.stats.tasks} total, ${data.stats.completedTasks} completed (${completionRate}% completion rate)
- Notes: ${data.stats.notes} total
- Recent tasks: ${recentTaskTitles}
- Recent notes: ${recentNoteTitles}

Provide 2-3 short, practical, and encouraging productivity insights based on this data. Focus on what they can improve or celebrate. Use plain sentences, no markdown, no bullet points, no headers. Keep the total response under 80 words.`;

    // Send the prompt to Gemini and get the AI's response.
    const result = await generateText({ prompt });

    // Log that AI insights were generated (appears in the activity feed).
    await logActivity(user.id, {
      type: 'ai_summary_generated',
      title: 'AI summary generated',
      metadata: { source: 'dashboard_insights' },
    });

    // Return just the insights text — trimmed of any extra whitespace.
    res.status(200).json({ insights: result.text.trim() });
  } catch (error) {
    next(error);
  }
}
