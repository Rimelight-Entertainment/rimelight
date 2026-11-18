-- Space: colours for areas, and a colour for each issue type.
--
-- Every area gets a colour; existing areas take the default blue. Issue types are a fixed set (task, bug, feature,
-- epic), so their colours live in their own table with one row per type. Colours are six-digit hex codes such as
-- #1659C4.
--
-- Not idempotent: applied once.

ALTER TABLE areas ADD COLUMN color text NOT NULL DEFAULT '#1659C4' CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

CREATE TABLE issue_type_colors (
    name  text PRIMARY KEY CHECK (name IN ('task', 'bug', 'feature', 'epic')),
    color text NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

INSERT INTO issue_type_colors (name, color) VALUES
    ('task', '#1659C4'),
    ('bug', '#D9362B'),
    ('feature', '#2E8B57'),
    ('epic', '#7B4FCF');
