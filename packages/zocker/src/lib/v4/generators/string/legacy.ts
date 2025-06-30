import z4 from "zod/v4";
import * as z from "zod/v4/core";
import { generate, GenerationContext } from "../../generate.js";

/**
 * If the schema has checks for a legacy format (eg `z.string().email()` instead of `z.string()`), this will
 * call the apropriate generator.
 *
 * @returns The generated string, or `null` if no legacy format was used
 */
export function legacyFormatString(
	schema: z.$ZodString,
	ctx: GenerationContext<any>
): string | null {
	const checks = schema._zod.def.checks ?? [];
	const format_checks = checks.filter(
		(check) => check instanceof z4.ZodStringFormat
	);

	const date_checks = format_checks.filter(
		(check) => check instanceof z4.iso.ZodISODate
	);
	if (date_checks.length > 0) {
		const date_schema = z4.iso.date();
		date_schema._zod.def.checks = checks;
		return generate(date_schema, ctx);
	}

	const datetime_checks = format_checks.filter(
		(check) => check instanceof z4.iso.ZodISODateTime
	);
	if (datetime_checks.length > 0) {
		const datetime_schema = z4.iso.datetime();
		datetime_schema._zod.def.checks = checks;
		return generate(datetime_schema, ctx);
	}

	const duration_checks = format_checks.filter(
		(check) => check instanceof z4.iso.ZodISODuration
	);
	if (duration_checks.length > 0) {
		const duration_schema = z4.iso.duration();
		duration_schema._zod.def.checks = checks;
		return generate(duration_schema, ctx);
	}

	const time_checks = format_checks.filter(
		(check) => check instanceof z4.iso.ZodISOTime
	);
	if (time_checks.length > 0) {
		const time_schema = z4.iso.time();
		time_schema._zod.def.checks = checks;
		return generate(time_schema, ctx);
	}

	const email_checks = format_checks.filter(
		(check) => check instanceof z4.ZodEmail
	);
	if (email_checks.length > 0) {
		const email_schema = z4.email();
		email_schema._zod.def.checks = checks;
		return generate(email_schema, ctx);
	}

	const guid_checks = checks.filter((c) => c instanceof z4.ZodGUID);
	if (guid_checks.length > 0) {
		const guid_schema = z4.guid();
		guid_schema._zod.def.checks = checks;
		return generate(guid_schema, ctx);
	}

	const uuid_checks = checks.filter((c) => c instanceof z4.ZodUUID);
	if (uuid_checks.length > 0) {
		const uuid_schema = z4.uuid({ version: uuid_checks[0]!.def.version });
		uuid_schema._zod.def.checks = checks;
		return generate(uuid_schema, ctx);
	}

	const url_checks = checks.filter((c) => c instanceof z4.ZodURL);
	if (url_checks.length > 0) {
		const url_schema = z4.url();
		url_schema._zod.def.checks = checks;
		return generate(url_schema, ctx);
	}

	const cuid_checks = checks.filter((c) => c instanceof z4.ZodCUID);
	if (cuid_checks.length > 0) {
		const cuid_schema = z4.cuid();
		cuid_schema._zod.def.checks = checks;
		return generate(cuid_schema, ctx);
	}

	const cuid2_checks = checks.filter((c) => c instanceof z4.ZodCUID2);
	if (cuid2_checks.length > 0) {
		const cuid2_schema = z4.cuid2();
		cuid2_schema._zod.def.checks = checks;
		return generate(cuid2_schema, ctx);
	}

	const ulid_checks = checks.filter((c) => c instanceof z4.ZodULID);
	if (ulid_checks.length > 0) {
		const ulid_schema = z4.ulid();
		ulid_schema._zod.def.checks = checks;
		return generate(ulid_schema, ctx);
	}

	const emoji_checks = checks.filter((c) => c instanceof z4.ZodEmoji);
	if (emoji_checks.length > 0) {
		const emoji_schema = z4.emoji();
		emoji_schema._zod.def.checks = checks;
		return generate(emoji_schema, ctx);
	}

	const nanoid_checks = checks.filter((c) => c instanceof z4.ZodNanoID);
	if (nanoid_checks.length > 0) {
		const nanoid_schema = z4.nanoid();
		nanoid_schema._zod.def.checks = checks;
		return generate(nanoid_schema, ctx);
	}

	const ipv6_checks = checks.filter((c) => c instanceof z4.ZodIPv6);
	if (ipv6_checks.length > 0) {
		const ipv6_schema = z4.ipv6();
		ipv6_schema._zod.def.checks = checks;
		return generate(ipv6_schema, ctx);
	}

	const ipv4_checks = checks.filter((c) => c instanceof z4.ZodIPv4);
	if (ipv4_checks.length > 0) {
		const ipv4_schema = z4.ipv4();
		ipv4_schema._zod.def.checks = checks;
		return generate(ipv4_schema, ctx);
	}

	const e164_checks = checks.filter((c) => c instanceof z4.ZodE164);
	if (e164_checks.length > 0) {
		const e164_schema = z4.e164();
		e164_schema._zod.def.checks = checks;
		return generate(e164_schema, ctx);
	}

	const cidrv4_checks = checks.filter((c) => c instanceof z4.ZodCIDRv4);
	if (cidrv4_checks.length > 0) {
		const cidrv4_schema = z4.cidrv4();
		cidrv4_schema._zod.def.checks = checks;
		return generate(cidrv4_schema, ctx);
	}

	const cidrv6_checks = checks.filter((c) => c instanceof z4.ZodCIDRv6);
	if (cidrv6_checks.length > 0) {
		const cidrv6_schema = z4.cidrv6();
		cidrv6_schema._zod.def.checks = checks;
		return generate(cidrv6_schema, ctx);
	}

	const base64_url_checks = checks.filter((c) => c instanceof z4.ZodBase64URL);
	if (base64_url_checks.length > 0) {
		const base64_url_schema = z4.base64url();
		base64_url_schema._zod.def.checks = checks;
		return generate(base64_url_schema, ctx);
	}

	const base64_checks = checks.filter((c) => c instanceof z4.ZodBase64);
	if (base64_checks.length > 0) {
		const base64_schema = z4.base64();
		base64_schema._zod.def.checks = checks;
		return generate(base64_schema, ctx);
	}

	const jwt_checks = checks.filter((c) => c instanceof z4.ZodJWT);
	if (jwt_checks.length > 0) {
		const jwt_schema = z4.jwt();
		jwt_schema._zod.def.checks = checks;
		return generate(jwt_schema, ctx);
	}

	const ksuid_checks = checks.filter((c) => c instanceof z4.ZodKSUID);
	if (ksuid_checks.length > 0) {
		const ksuid_schema = z4.ksuid();
		ksuid_schema._zod.def.checks = checks;
		return generate(ksuid_schema, ctx);
	}

	const xid_checks = checks.filter((c) => c instanceof z4.ZodXID);
	if (xid_checks.length > 0) {
		const xid_schema = z4.xid();
		xid_schema._zod.def.checks = checks;
		return generate(xid_schema, ctx);
	}

	return null;
}
