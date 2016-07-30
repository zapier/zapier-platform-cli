#!/usr/bin/env node
'use strict';

const fs = require('fs');

const _ = require('lodash');

const marked = require('marked');
const toc = require('markdown-toc');
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

  /*
  This is a major hack since marked does not have a lexer/parser
  option in the config. We push a paragraph onto the stack, and
  if it is followed by a code step, we pair them up and flush them.

  EG: blockquotes break it. Lame.
  */
  let stack = [];
  const renderer = new marked.Renderer();
  const wrapBlock = (_renderer, name, {flush = false, collect = false} = {}) => {
    const oldFunc = _renderer[name];
    _renderer[name] = function() {
      let inner = oldFunc.apply(this, arguments);

      if (collect) {
        stack.push(inner);
        return '';
      }

      let out = '';
      if (flush) {
        out += row(stack.join(''), inner);
        stack = [];
      } else {
        if (stack.length) {
          out += row(stack.join(''));
        }
        out += row(inner);
      }

      if (!collect) {
        stack = [];
      }

      return out;
    };
  };

  // all block level elements must be wrapped with a row
  wrapBlock(renderer, 'heading');
  wrapBlock(renderer, 'paragraph', {collect: true});
  wrapBlock(renderer, 'code', {flush: true});
  wrapBlock(renderer, 'blockquote');
  wrapBlock(renderer, 'list');
  wrapBlock(renderer, 'table');
  wrapBlock(renderer, 'hr');
  wrapBlock(renderer, 'html');

  const markedOptions = {
    renderer: renderer,
    highlight: (code, lang) => {
      if (!lang || lang === 'plain') { return code; }
      return hljs.highlight(lang, code).value;
    }
  };

  let output = marked(markdownString, markedOptions);
  output += stack.length ? row(stack.join('')) : '';
  return output;
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
