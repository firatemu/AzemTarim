# Coding Agent Orchestrator Skill

## Purpose
Delegate complex development tasks and feature builds to specialized background AI agents.

## When to Trigger
- When requested to build a new feature.
- When requested to refactor a large module.
- When tasked with fixing multiple bugs at once.

## Orchestration Logic
1. **Analyze the main task**: Break it down into smaller, independent sub-tasks.
2. **Launch sub-agents**: Assign each sub-task to a specialized agent (e.g., frontend, backend, database).
3. **Set clear boundaries**: Define the scope and interfaces for each agent.
4. **Aggregate results**: Collect the output from each sub-agent and merge them into a coherent solution.
5. **Verify**: Ensure the integrated solution meets all requirements.

## Communication
Use a shared `implementation_plan.md` to coordinate between the orchestrator and all sub-agents.
Each sub-agent should report their progress to the orchestrator.
