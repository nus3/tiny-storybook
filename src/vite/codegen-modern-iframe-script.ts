export const generateModernIframeScriptCode = () => {
  // TODO: .storybook/main.tsから動的に生成するように
  const previewAnnotationURLs = ["@storybook/react/preview", "/src/components"];

  const getPreviewAnnotationsFunction = `
  const getProjectAnnotations = async () => {
    const configs = await Promise.all([${previewAnnotationURLs
      .map((previewAnnotation) => `import('${previewAnnotation}')`)
      .join(",\n")}])
    return composeConfigs(configs);
  `;

  const code = `
  import { composeConfigs, PreviewWeb, ClientApi } from '@storybook/preview-api';

  `;

  return code;
};
