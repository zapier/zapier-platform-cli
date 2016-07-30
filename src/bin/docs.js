#!/usr/bin/env node
'use strict';

const fs = require('fs');

const _ = require('lodash');

const marked = require('marked');
const toc = require('markdown-toc');
const cheerio = require('cheerio');
const hljs = require('highlight.js');

const commands = require('../commands');

const makeTemplateRenderer = (t) => _.template(t, {interpolate: /<%=([\s\S]+?)%>/g});

// const oldLex = marked.Lexer.lex;
// marked.Lexer.lex = function() {
//   const out = oldLex.apply(this, arguments);
//   out.forEach(lexed => {
//     console.log(lexed);
//     console.log('-----');
//   });
//   return out;
// };

const renderMarkdownString = (markdownString) => {
  const rowTemplate = makeTemplateRenderer(`\
  <div class="row">
    <div class="row-height">
      <div class="col-md-6 col-height docs-primary">
        <%= left %>
      </div>
      <div class="col-md-6 col-height docs-code">
        <%= right %>
      </div>
    </div>
  </div>`);

  const row = (left, right) => rowTemplate({left: left || '', right: right || ''});

  const intermediaryOutput = marked(markdownString, {
    highlight: (code, lang) => {
      if (!lang || lang === 'plain') { return code; }
      return hljs.highlight(lang, code).value;
    }
  });

  const $ = cheerio.load(`<div id="root">${intermediaryOutput}</div>`);
  const blocks = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul',
    'li', 'blockquote', 'table', 'hr', 'br', 'pre'
  ];
  const collectLeft = ['p', 'blockquote'];
  const flushRight = ['pre'];

  let stack = [];
  let finalOutput = '';
  // walk all the "root" block level elements, throw anything that can
  // be bunched into the left side of code onto the stack - then flush
  // periodically when we run into code.
  $(`#root > ${blocks.join(',')}`).each((i, el) => {
    const collect = collectLeft.indexOf(el.name) !== -1;
    const flush = flushRight.indexOf(el.name) !== -1;
    let inner = $(el).clone().wrap('<div>').parent().html();

    if (collect) {
      stack.push(inner);
      return;
    }

    if (flush) {
      finalOutput += row(stack.join(''), inner);
      stack = [];
    } else {
      if (stack.length) {
        finalOutput += row(stack.join(''));
      }
      finalOutput += row(inner);
    }

    if (!collect) {
      stack = [];
    }

  });

  if (stack.length) {
    finalOutput += row(stack.join(''));
  }

  return finalOutput;
};


const rollUpCli = () => {
  const docs = _.map(commands, (command, name) => {
    return `\
  ## \`${name}\`

  ${command.help}

  \`${command.usage || command.example}\`

  ${command.docs}
  `.trim();
  }).join('\n\n\n');

  fs.writeFileSync('./docs/cli.md', docs);
};


const mdToHtml = () => {
  const templateString = fs.readFileSync('./docs/index.template.html').toString();
  const renderTemplate = makeTemplateRenderer(templateString);

  const markdownString = fs.readFileSync('./docs/index.md').toString();
  const tableOfContent = marked(toc(markdownString).content);

  const content = renderMarkdownString(markdownString);
  const context = {
    tableOfContent: tableOfContent,
    content: content
  };

  const finalContent = renderTemplate(context);
  fs.writeFileSync('./docs/index.html', finalContent);
};


rollUpCli();
mdToHtml();
