-- ============================================
-- CRÉATION DES COMPTES DANS auth.users
-- ============================================

-- 1. ADMINISTRATEUR
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    instance_id,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'admin@nella-house.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Jean', 'last_name', 'Admin'),
    now(),
    now(),
    'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '',
    '',
    '',
    ''
);

-- 2. GESTIONNAIRES
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, role,
    instance_id, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES 
(
    gen_random_uuid(),
    'manager1@nella-house.com',
    crypt('Manager123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Sophie', 'last_name', 'Martin'),
    now(), now(), 'authenticated',
    '00000000-0000-0000-0000-000000000000', '', '', '', ''
),
(
    gen_random_uuid(),
    'manager2@nella-house.com',
    crypt('Manager123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Marc', 'last_name', 'Dubois'),
    now(), now(), 'authenticated',
    '00000000-0000-0000-0000-000000000000', '', '', '', ''
);

-- 3. CONSEILLERS EN STYLE
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, role,
    instance_id, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES 
(
    gen_random_uuid(),
    'conseiller1@nella-house.com',
    crypt('Conseiller123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Aïcha', 'last_name', 'Diallo'),
    now(), now(), 'authenticated',
    '00000000-0000-0000-0000-000000000000', '', '', '', ''
),
(
    gen_random_uuid(),
    'conseiller2@nella-house.com',
    crypt('Conseiller123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Koffi', 'last_name', 'Konan'),
    now(), now(), 'authenticated',
    '00000000-0000-0000-0000-000000000000', '', '', '', ''
);

-- 4. CLIENTS DE TEST
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, role,
    instance_id, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES 
(
    gen_random_uuid(),
    'client1@test.com',
    crypt('Client123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Marie', 'last_name', 'Laurent'),
    now(), now(), 'authenticated',
    '00000000-0000-0000-0000-000000000000', '', '', '', ''
),
(
    gen_random_uuid(),
    'client2@test.com',
    crypt('Client123!', gen_salt('bf')),
    now(),
    jsonb_build_object('first_name', 'Thomas', 'last_name', 'Bernard'),
    now(), now(), 'authenticated',
    '00000000-0000-0000-0000-000000000000', '', '', '', ''
);












////////







Admin	admin@nella-house.com	Admin123!
Manager	manager1@nella-house.com	Manager123!
Manager	manager2@nella-house.com	Manager123!
Advisor	conseiller1@nella-house.com	Conseiller123!
Advisor	conseiller2@nella-house.com	Conseiller123!
Client	client1@test.com	Client123!
Client	client2@test.com	Client123!
