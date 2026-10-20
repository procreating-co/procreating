-- Rodar DEPOIS de criar os 2 usuários em Authentication → Users (Auto Confirm).
-- Casa cada conta de auth.users com uma linha de perfil em public.users (role owner),
-- que é o que getSession() exige além da senha. Não mexe em auth.*.

insert into public.users (id, name, email, role)
select u.id,
       case when u.email like 'martins%' then 'Santiago' else 'Eduardo' end,
       u.email,
       'owner'
from auth.users u
where u.email in ('martins.santiago08@gmail.com', 'martinssantiago08@gmail.com', 'edufraresso11@gmail.com')
on conflict (id) do update set role = 'owner';

-- Diagnóstico: mostra o estado real de cada conta.
select u.email,
       u.email_confirmed_at is not null as confirmado,
       u.banned_until,
       (u.encrypted_password is not null) as tem_senha,
       p.role as perfil
from auth.users u
left join public.users p on p.id = u.id
where u.email in ('martins.santiago08@gmail.com', 'martinssantiago08@gmail.com', 'edufraresso11@gmail.com');
