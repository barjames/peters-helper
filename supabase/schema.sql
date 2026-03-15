-- Reminders table
create table reminders (
  id uuid default gen_random_uuid() primary key,
  message text not null,
  created_at timestamptz default now()
);

alter table reminders enable row level security;
create policy "allow all" on reminders for all using (true);

-- Carer note (single row, overwritten in place)
create table carer_note (
  id int primary key default 1,
  note text not null default '',
  updated_at timestamptz default now()
);

insert into carer_note (id, note) values (1, '');

alter table carer_note enable row level security;
create policy "allow all" on carer_note for all using (true);

-- Barry's location status
create table barry_status (
  id int primary key default 1,
  location text not null default 'home',
  updated_at timestamptz default now()
);

insert into barry_status (id, location) values (1, 'home');

alter table barry_status enable row level security;
create policy "allow all" on barry_status for all using (true);
