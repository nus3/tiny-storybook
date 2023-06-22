import { Options } from "@storybook/types";
import { resolve } from "path";
import {
  ConfigEnv,
  InlineConfig,
  PluginOption,
  UserConfig,
  loadConfigFromFile,
  mergeConfig,
} from "vite";
import { codeGeneratorPlugin } from "./code-generator-plugin";

const configEnvServe: ConfigEnv = {
  mode: "development",
  command: "serve",
  ssrBuild: false,
};

const isPreservingSymlinks = () => {
  const { NODE_OPTIONS, NODE_PRESERVE_SYMLINKS } = process.env;
  return (
    !!NODE_PRESERVE_SYMLINKS || NODE_OPTIONS?.includes("--preserve-symlinks")
  );
};

const pluginConfig = async (options: Options) => {
  const plugins: PluginOption[] = [codeGeneratorPlugin(options)];
  return plugins;
};

export const commonConfig = async (options: Options): Promise<InlineConfig> => {
  const configEnv = configEnvServe;

  // const { configDir } = await getBuilderOptions<BuilderOptions>(options);

  const { config: { build: buildProperty = undefined, ...userConfig } = {} } =
    (await loadConfigFromFile(configEnv)) ?? {};

  const sbConfig: InlineConfig = {
    configFile: false,
    cacheDir: "node_modules/.cache/.vite-storybook",
    root: resolve(options.configDir, ".."),
    // Allow storybook deployed as subfolder.  See https://github.com/storybookjs/builder-vite/issues/238
    base: "./",
    plugins: await pluginConfig(options),
    resolve: {
      preserveSymlinks: isPreservingSymlinks(),
      alias: {
        assert: require.resolve("browser-assert"),
      },
    },
    // If an envPrefix is specified in the vite config, add STORYBOOK_ to it,
    // otherwise, add VITE_ and STORYBOOK_ so that vite doesn't lose its default.
    envPrefix: userConfig.envPrefix ? ["STORYBOOK_"] : ["VITE_", "STORYBOOK_"],
  };

  const config: UserConfig = mergeConfig(userConfig, sbConfig);

  return config;
};
