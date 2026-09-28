import { bindings, defineConfig, type InferEnv } from "cf/config";

const config = defineConfig({
	worker: {
		name: "rimelight-dot-com",
		compatibilityDate: "2026-08-27",
		entrypoint: "./src/fetch.ts",
		cache: {
			enabled: true,
		},
		observability: {
			enabled: true,
			logs: {
				enabled: true,
				headSamplingRate: 1,
				invocationLogs: true,
			},
			traces: {
				enabled: true,
			},
		},
		domains: [
			"rimelight.com",
			"www.rimelight.com",
		],
		env: {
			CONSTRUCTION_MODE: bindings.text("true"),
			EMAIL_DOMAIN: bindings.text("rimelight.com"),
			AUTH0_CLIENT_SECRET: bindings.secret(),
			AUTH0_SECRET: bindings.secret(),
			DATABASE_URL: bindings.secret(),
			CONSTRUCTION_PASSPHRASE: bindings.secret(),
			TURNSTILE_SITE_KEY: bindings.secret(),
			TURNSTILE_SECRET_KEY: bindings.secret(),
			GITHUB_TOKEN: bindings.secret(),
			"rimelight-dot-com_translations": bindings.kv({
				id: "e1ae79418e4c4532a9344102bf663861",
				dev: {
					remote: true,
				},
			}),
			BLOB: bindings.r2({
				name: "rimelight-dot-com",
				dev: {
					remote: true,
				},
			}),
			EMAIL: bindings.sendEmail({
				dev: {
					remote: true,
				},
			}),
			MY_RATE_LIMITER: bindings.rateLimit({
				namespace: "1001",
				simple: {
					limit: 100,
					period: 60,
				},
			}),
			ASSETS: bindings.assets(),
		},
	},
});

export type Env = InferEnv<typeof config>;
export default config;
