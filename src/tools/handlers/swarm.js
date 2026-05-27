import { handleAgentSpawn } from './agents.js';

const delay = ms => new Promise(r => setTimeout(r, ms));

export async function executeSwarmManager(goal, activeModel) {
  const roles = [
    { role: 'frontend', prompt: `[SWARM FRONTEND SPECIALIST]\nGoal: ${goal}\nFocus purely on frontend (React/UI/Client-side). Coordinate with others if necessary via team_message.` },
    { role: 'backend', prompt: `[SWARM BACKEND ARCHITECT]\nGoal: ${goal}\nFocus purely on backend (Node/Express/API logic). Coordinate with others if necessary via team_message.` },
    { role: 'database', prompt: `[SWARM DATABASE ENGINEER]\nGoal: ${goal}\nFocus purely on database schema, migrations, and data structures. Coordinate with others if necessary via team_message.` }
  ];

  const spawnedIds = [];

  // Stagger spawns by 3 seconds to prevent API rate limits (429/50x)
  for (const r of roles) {
    const res = await handleAgentSpawn({
      goal: r.prompt,
      role: r.role,
      model: activeModel
    });
    spawnedIds.push(res.id);
    await delay(3000);
  }
  
  return {
    type: 'swarm_spawned',
    agents: spawnedIds,
    message: `Swarm initiated with 3 agents: ${spawnedIds.join(', ')}`
  };
}
