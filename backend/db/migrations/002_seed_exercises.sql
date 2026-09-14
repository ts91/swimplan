-- +goose Up
INSERT INTO exercises (name, category, phase, description, distance) VALUES
-- Warmup exercises
('Easy Freestyle',         'freestyle',    'warmup',   'Relaxed freestyle to warm up',                    200),
('Kick with Board',        'kick',         'warmup',   'Flutter kick holding a kickboard',                 100),
('Catch-up Drill',         'drill',        'warmup',   'Alternate arms, touching at front before pulling', 100),
('Sculling Drill',         'drill',        'warmup',   'Scull on back focusing on hand feel',              50),
('Mixed Stroke Easy',      'mixed',        'warmup',   'Easy backstroke and freestyle alternating 50s',    200),

-- Main set exercises
('Freestyle Sprint',       'sprint',       'main',     'All-out freestyle sprint',                         50),
('Freestyle Threshold',    'freestyle',    'main',     'Freestyle at threshold pace',                      200),
('IM',                     'mixed',        'main',     'Individual medley: fly, back, breast, free',       100),
('Pull Buoy Freestyle',    'pull',         'main',     'Freestyle with pull buoy, focus on upper body',    200),
('Backstroke',             'backstroke',   'main',     'Backstroke at moderate effort',                    100),
('Butterfly',              'butterfly',    'main',     'Butterfly at controlled pace',                     50),
('Breaststroke',           'breaststroke', 'main',     'Breaststroke at steady pace',                      100),
('Descending Freestyle',   'freestyle',    'main',     'Freestyle getting faster each repeat',             100),
('Kick Set',               'kick',         'main',     'Flutter kick without board, streamline',           100),
('Paddles Freestyle',      'pull',         'main',     'Freestyle with paddles for power',                 200),

-- Cooldown exercises
('Easy Backstroke',        'backstroke',   'cooldown', 'Relaxed backstroke to cool down',                  100),
('Easy Choice Swim',       'mixed',        'cooldown', 'Swim any stroke at easy effort',                   200),
('Sculling Cool-down',     'drill',        'cooldown', 'Easy sculling to bring heart rate down',           50),
('Easy Kick',              'kick',         'cooldown', 'Gentle flutter kick on back',                      100);

-- +goose Down
DELETE FROM exercises WHERE name IN (
    'Easy Freestyle', 'Kick with Board', 'Catch-up Drill', 'Sculling Drill', 'Mixed Stroke Easy',
    'Freestyle Sprint', 'Freestyle Threshold', 'IM', 'Pull Buoy Freestyle', 'Backstroke',
    'Butterfly', 'Breaststroke', 'Descending Freestyle', 'Kick Set', 'Paddles Freestyle',
    'Easy Backstroke', 'Easy Choice Swim', 'Sculling Cool-down', 'Easy Kick'
);
