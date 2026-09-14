-- +goose Up

-- Equipment
INSERT INTO equipment (name, abbrev) VALUES
('Kickboard',  'Bd'),
('Pull Buoy',  'PB'),
('Paddles',    'Pd'),
('Fins',       'Fn'),
('Snorkel',    'Sn'),
('Band',       'Bn');

-- Exercise templates (no distance, no phase)
INSERT INTO exercises (name, abbrev, category, description) VALUES
-- Freestyle variants
('Freestyle',               'Fr',       'freestyle',    'Front crawl at steady pace'),
('Freestyle Sprint',        'Fr Spr',   'sprint',       'All-out freestyle sprint'),
('Freestyle Threshold',     'Fr Thr',   'freestyle',    'Freestyle at threshold pace'),
('Descending Freestyle',    'Fr Desc',  'freestyle',    'Freestyle getting faster each repeat'),
-- Other strokes
('Backstroke',              'Bk',       'backstroke',   'Backstroke at steady pace'),
('Breaststroke',            'Br',       'breaststroke', 'Breaststroke at steady pace'),
('Butterfly',               'Fly',      'butterfly',    'Butterfly at controlled pace'),
('IM',                      'IM',       'mixed',        'Individual medley: fly, back, breast, free'),
('Choice Swim',             'Ch',       'mixed',        'Swim any stroke at easy effort'),
-- Kick
('Kick',                    'K',        'kick',         'Flutter kick in streamline'),
('Kick with Board',         'K w/ Bd',  'kick',         'Flutter kick holding a kickboard'),
-- Pull
('Pull Buoy Freestyle',     'Fr Pl',    'pull',         'Freestyle with pull buoy, focus on upper body'),
('Paddles Freestyle',       'Fr Pd',    'pull',         'Freestyle with paddles for power'),
-- Drills
('Catch-up Drill',          'CU Dr',    'drill',        'Alternate arms, touching at front before pulling'),
('Sculling',                'Sc',       'drill',        'Scull on back focusing on hand feel'),
('Fingertip Drag',          'FTD',      'drill',        'Drag fingertips along water surface during recovery');

-- Equipment links
-- Kick with Board -> Kickboard
INSERT INTO exercise_equipment (exercise_id, equipment_id)
SELECT e.id, eq.id FROM exercises e, equipment eq
WHERE e.name = 'Kick with Board' AND eq.name = 'Kickboard';

-- Pull Buoy Freestyle -> Pull Buoy
INSERT INTO exercise_equipment (exercise_id, equipment_id)
SELECT e.id, eq.id FROM exercises e, equipment eq
WHERE e.name = 'Pull Buoy Freestyle' AND eq.name = 'Pull Buoy';

-- Paddles Freestyle -> Paddles
INSERT INTO exercise_equipment (exercise_id, equipment_id)
SELECT e.id, eq.id FROM exercises e, equipment eq
WHERE e.name = 'Paddles Freestyle' AND eq.name = 'Paddles';

-- +goose Down
DELETE FROM exercise_equipment;
DELETE FROM equipment;
DELETE FROM exercises;
