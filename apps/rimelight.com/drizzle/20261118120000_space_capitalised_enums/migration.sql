-- Space: enum-like values are defined and stored capitalised (Task, Bug, Normal, Active, ...) and shown as stored.
--
-- Covers issues.type, issues.priority, workflow_states.category, sprints.state and issue_type_colors.name.
-- Existing lowercase rows are converted with initcap (only rows whose lowercase form is a known value), then the
-- CHECK constraints and the one-active-sprint index are replaced to accept the capitalised values.
--
-- Order: drop the old constraints and index, convert the rows, then add the new constraints and index. Converting
-- before the old constraints are gone would fail; adding the new constraints before converting would fail too.
--
-- The constraint and index statements use IF EXISTS / IF NOT EXISTS so a re-run after a partial failure is safe.
-- The UPDATEs only touch lowercase values, so re-running them changes nothing.
--
-- Note: the Rimelight Space Rust backend (backend/db/migrations/0012_capitalised_enums.sql) makes the same change to
-- the same tables. Apply one of the two to a database, never both.

ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_type_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_priority_check;
ALTER TABLE workflow_states DROP CONSTRAINT IF EXISTS workflow_states_category_check;
ALTER TABLE sprints DROP CONSTRAINT IF EXISTS sprints_state_check;
ALTER TABLE issue_type_colors DROP CONSTRAINT IF EXISTS issue_type_colors_name_check;
DROP INDEX IF EXISTS sprints_one_active_idx;

UPDATE issues SET type = initcap(type)
    WHERE lower(type) IN ('task', 'bug', 'feature', 'epic') AND type <> initcap(type);
UPDATE issues SET priority = initcap(priority)
    WHERE lower(priority) IN ('critical', 'high', 'normal', 'low') AND priority <> initcap(priority);
UPDATE workflow_states SET category = initcap(category)
    WHERE lower(category) IN ('unstarted', 'started', 'done', 'cancelled') AND category <> initcap(category);
UPDATE sprints SET state = initcap(state)
    WHERE lower(state) IN ('planned', 'active', 'closed') AND state <> initcap(state);
UPDATE issue_type_colors SET name = initcap(name)
    WHERE lower(name) IN ('task', 'bug', 'feature', 'epic') AND name <> initcap(name);

ALTER TABLE issues ADD CONSTRAINT issues_type_check
    CHECK (type IN ('Task', 'Bug', 'Feature', 'Epic'));
ALTER TABLE issues ADD CONSTRAINT issues_priority_check
    CHECK (priority IN ('Critical', 'High', 'Normal', 'Low'));
ALTER TABLE workflow_states ADD CONSTRAINT workflow_states_category_check
    CHECK (category IN ('Unstarted', 'Started', 'Done', 'Cancelled'));
ALTER TABLE sprints ADD CONSTRAINT sprints_state_check
    CHECK (state IN ('Planned', 'Active', 'Closed'));
ALTER TABLE issue_type_colors ADD CONSTRAINT issue_type_colors_name_check
    CHECK (name IN ('Task', 'Bug', 'Feature', 'Epic'));

-- At most one active sprint per project.
CREATE UNIQUE INDEX IF NOT EXISTS sprints_one_active_idx ON sprints (project_id)
    WHERE state = 'Active' AND deleted_at IS NULL;
