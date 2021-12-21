import ExplainedDataParser from './parser';

function renderFlowchart(parser) {
  let renderingText = parser.buildMermaidContent();
  renderingText = `graph BT;\n${renderingText}`.trim();

  const htmlElement = document.querySelector('.mermaid');
  mermaid.mermaidAPI.render('mermaid', renderingText, (svgCode) => {
    htmlElement.innerHTML = svgCode;
  });

  setTimeout(() => {
    $('.node').each((_, element) => {
      const keys = $(element).attr('id').split('-');
      const newKeys = keys.splice(1, keys.length - 2);
      const key = newKeys.join('-');
      const explainContent = parser.getExplainContentById(key);

      if (explainContent) {
        $(element).attr('data-toggle', 'popover');
        $(element).attr('data-content', explainContent);
        $(element).attr('data-html', 'true');
      }
    });
    $('[data-toggle="popover"]').popover();
  }, 1000);
}

function getAndParseContent() {
  const dataString = editor.getSession().getValue();
  try {
    const data = JSON.parse(dataString);
    const parser = new ExplainedDataParser(data);
    parser.build();
    renderFlowchart(parser);
  } catch {
    console.log('Failed to decode');
  }
}

editor.getSession().on('change', () => {
  getAndParseContent();
});

getAndParseContent();
