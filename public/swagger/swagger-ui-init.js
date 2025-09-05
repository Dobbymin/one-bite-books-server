window.onload = function () {
  // SwaggerUIBundle이 정의되어 있는지 확인
  if (typeof SwaggerUIBundle !== 'undefined') {
    const ui = SwaggerUIBundle({
      url: '/api-json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: 'StandaloneLayout',
    });
  } else {
    console.error(
      'SwaggerUIBundle이 로드되지 않았습니다. swagger-ui-bundle.js 파일을 확인해주세요.',
    );
  }
};
