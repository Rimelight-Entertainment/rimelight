-- Space: the On Hold and Canceled workflow states for existing projects, and the areas catalogue that admins create.
--
-- Order, as the owner specified it: Open, In Progress, In Review, On Hold, Done, Won't Do, Canceled. On Hold takes
-- position 4, so Done and every later state move down one. Canceled goes right after Won't Do. Positions are moved
-- inside each project only; issues refer to states by id, so no issue changes. A project that already has a state with
-- the new name keeps it and is left alone.
--
-- Not idempotent: applied once.

DO $$
DECLARE
  p record;
  won_at integer;
BEGIN
  FOR p IN SELECT id FROM projects LOOP
    IF NOT EXISTS (SELECT 1 FROM workflow_states WHERE project_id = p.id AND name = 'On Hold') THEN
      UPDATE workflow_states SET position = position + 1
       WHERE project_id = p.id AND position >= 4;
      INSERT INTO workflow_states (project_id, name, category, position)
      VALUES (p.id, 'On Hold', 'started', 4);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM workflow_states WHERE project_id = p.id AND name = 'Canceled') THEN
      SELECT position INTO won_at FROM workflow_states
       WHERE project_id = p.id AND name = 'Won''t Do';
      IF won_at IS NULL THEN
        SELECT COALESCE(max(position), 0) INTO won_at FROM workflow_states WHERE project_id = p.id;
      END IF;
      UPDATE workflow_states SET position = position + 1
       WHERE project_id = p.id AND position > won_at;
      INSERT INTO workflow_states (project_id, name, category, position)
      VALUES (p.id, 'Canceled', 'cancelled', won_at + 1);
    END IF;
  END LOOP;
END $$;

-- Areas: the catalogue of issue areas (tags). Admins create them; an issue's areas must come from here.
CREATE TABLE areas (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL CHECK (length(btrim(name)) > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX areas_name_key ON areas (lower(name));
