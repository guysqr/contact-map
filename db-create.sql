CREATE SEQUENCE public.boundaries_ogc_fid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.boundaries_ogc_fid_seq
    OWNER TO postgres;

-- Table: public.boundaries

-- DROP TABLE public.boundaries;

CREATE TABLE public.boundaries
(
    ogc_fid integer NOT NULL DEFAULT nextval('boundaries_ogc_fid_seq'::regclass),
    wkb_geometry geometry(Geometry,4326),
    name character varying(70) COLLATE pg_catalog."default",
    area_code character varying(3) COLLATE pg_catalog."default",
    area_description character varying(50) COLLATE pg_catalog."default",
    file_name character varying(50) COLLATE pg_catalog."default",
    feature_serial_number integer,
    collection_serial_number integer,
    global_polygon_id integer,
    admin_unit_id integer,
    census_code character varying(9) COLLATE pg_catalog."default",
    hectares numeric(12,3),
    non_inland_area numeric(12,3),
    area_type_code character varying(2) COLLATE pg_catalog."default",
    area_type_description character varying(25) COLLATE pg_catalog."default",
    non_area_type_code character varying(3) COLLATE pg_catalog."default",
    non_area_type_description character varying(36) COLLATE pg_catalog."default",
    geom_expanded_1km geometry(Geometry,4326),
    CONSTRAINT boundaries_pkey PRIMARY KEY (ogc_fid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.boundaries
    OWNER to postgres;
-- Index: boundaries_wkb_geometry_geom_idx

-- DROP INDEX public.boundaries_wkb_geometry_geom_idx;

CREATE INDEX boundaries_wkb_geometry_geom_idx
    ON public.boundaries USING gist
    (wkb_geometry)
    TABLESPACE pg_default;

CREATE SEQUENCE public.collections_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.collections_id_seq
    OWNER TO postgres;

-- Table: public.collections

-- DROP TABLE public.collections;

CREATE TABLE public.collections
(
    id integer NOT NULL DEFAULT nextval('collections_id_seq'::regclass),
    source integer,
    source_type character varying(7) COLLATE pg_catalog."default",
    origin character varying(4) COLLATE pg_catalog."default",
    destination character varying(4) COLLATE pg_catalog."default",
    from_webtrak boolean,
    collection_start timestamp without time zone,
    collection_end timestamp without time zone,
    operating_mode character varying(10) COLLATE pg_catalog."default",
    passenger_capacity integer,
    wake_turbulence_category character(1) COLLATE pg_catalog."default",
    CONSTRAINT collections_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.collections
    OWNER to postgres;

-- Index: collections_source

-- DROP INDEX public.collections_source;

CREATE INDEX collections_source
    ON public.collections USING btree
    (source ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: collections_collection_start

-- DROP INDEX public.collections_collection_start;

CREATE INDEX collections_collection_start
    ON public.collections USING btree
    (collection_start ASC NULLS LAST)
    TABLESPACE pg_default;


-- SEQUENCE: public.mappoints_id_seq

-- DROP SEQUENCE public.mappoints_id_seq;



ALTER SEQUENCE public.mappoints_id_seq
    OWNER TO postgres;

-- Table: public.mappoints

-- DROP TABLE public.mappoints;

CREATE TABLE public.mappoints
(
    id integer NOT NULL DEFAULT nextval('mappoints_id_seq'::regclass),
    datetime timestamp without time zone,
    point_date date,
    point_hour double precision,
    altitude integer,
    height integer,
    point geometry(Point,4326),
    source_id integer,
    speed integer,
    geog_point geography(Point,4326),
    CONSTRAINT mappoints_pkey PRIMARY KEY (id),
    CONSTRAINT mappoints_source_fkey FOREIGN KEY (source_id)
        REFERENCES public.collections (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.mappoints
    OWNER to postgres;
-- Index: date_index

-- DROP INDEX public.date_index;

CREATE INDEX date_index
    ON public.mappoints USING btree
    (point_date ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: hour_index

-- DROP INDEX public.hour_index;

CREATE INDEX hour_index
    ON public.mappoints USING btree
    (point_hour ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: source_index

-- DROP INDEX public.source_index;

CREATE INDEX source_index
    ON public.mappoints USING btree
    (source_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: point_index

-- DROP INDEX public.point_index;

CREATE INDEX point_index
    ON public.mappoints USING gist
    (point)
    TABLESPACE pg_default;

ALTER TABLE public.mappoints
    CLUSTER ON point_index;