CREATE TYPE "public"."odometer_unit" AS ENUM('km', 'mi');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'reserved', 'sold');--> statement-breakpoint
CREATE TABLE "sync_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"stock_number" text NOT NULL,
	"slug" text NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"arrived_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sold_at" timestamp with time zone,
	"year" integer NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"variant" text,
	"series" text,
	"price" integer,
	"odometer" integer NOT NULL,
	"odometer_unit" "odometer_unit" DEFAULT 'km' NOT NULL,
	"odometer_km" integer NOT NULL,
	"body" text NOT NULL,
	"transmission" text NOT NULL,
	"fuel" text NOT NULL,
	"drive" text,
	"engine" text,
	"doors" integer,
	"seats" integer,
	"colour" text,
	"interior" text,
	"vin" text,
	"description" text DEFAULT '' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"feature_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_manifest" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"spin360_url" text,
	"source" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "vehicles_status_idx" ON "vehicles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vehicles_make_idx" ON "vehicles" USING btree ("make");--> statement-breakpoint
CREATE INDEX "vehicles_price_idx" ON "vehicles" USING btree ("price");