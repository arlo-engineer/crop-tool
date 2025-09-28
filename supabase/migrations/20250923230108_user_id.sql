create table "public"."images" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" character varying not null,
    "original_name" character varying not null,
    "r2_key" text not null,
    "processed_r2_key" text,
    "status" character varying not null default 'uploaded'::character varying,
    "error_message" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


alter table "public"."images" enable row level security;

CREATE UNIQUE INDEX images_pkey ON public.images USING btree (id);

alter table "public"."images" add constraint "images_pkey" PRIMARY KEY using index "images_pkey";

grant delete on table "public"."images" to "anon";

grant insert on table "public"."images" to "anon";

grant references on table "public"."images" to "anon";

grant select on table "public"."images" to "anon";

grant trigger on table "public"."images" to "anon";

grant truncate on table "public"."images" to "anon";

grant update on table "public"."images" to "anon";

grant delete on table "public"."images" to "authenticated";

grant insert on table "public"."images" to "authenticated";

grant references on table "public"."images" to "authenticated";

grant select on table "public"."images" to "authenticated";

grant trigger on table "public"."images" to "authenticated";

grant truncate on table "public"."images" to "authenticated";

grant update on table "public"."images" to "authenticated";

grant delete on table "public"."images" to "service_role";

grant insert on table "public"."images" to "service_role";

grant references on table "public"."images" to "service_role";

grant select on table "public"."images" to "service_role";

grant trigger on table "public"."images" to "service_role";

grant truncate on table "public"."images" to "service_role";

grant update on table "public"."images" to "service_role";


