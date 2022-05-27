/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import showdown from 'showdown';
import { pd } from 'pretty-data';

/**
 * Parses the HTML generated by the markdown converter and wraps the content in a div element with class "content"
 * @param {string} html The HTML content string previously generated by tghe markdown converter
 * @returns {string} The string representing the HTML content wrapped in a div element with a "content" class
 */
export function wrapContent(html) {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(html, 'text/html');
  const hasContentDiv = doc.getElementsByClassName('content').length > 0;

  if (hasContentDiv) {
    return pd.xmlmin(html);
  }

  const contentDiv = `<div class="content">${doc.body.innerHTML}</div>`;
  doc.body.innerHTML = contentDiv;

  return pd.xmlmin(doc.body.innerHTML);
}

/**
 * Extracts the innerHTML contained in a div element with class "content" from an HTML document
 * @param {string} content HTML document containing a div element with a class "content"
 * @returns The innerHTML inside of the div with class "content"
 */
export function getContentChildren(content) {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(content, 'text/html');
  const contentDiv = doc.getElementsByClassName('content');
  const hasContentDiv = contentDiv.length > 0;
  return hasContentDiv ? contentDiv[0].innerHTML : content;
}

/**
 * Converts an HTML document into a markdown document
 * @param {string} html HTML document in string format that can be converted to regular a regular markdown document
 * @returns {string} A markdown document as string
 */
export function html2Markdown(html) {
  const content = getContentChildren(html);
  const converter = new showdown.Converter();
  const markdown = converter.makeMarkdown(content);
  return markdown ?? '';
}

/**
 * Converts a markdown content into HTML
 * @param {string} markdown Markdown text to be transformed into HTML
 * @param {boolean} wrapInDivContent If true, the markdown content will be converted to HTML and the HTML will be wraped in a div with class "content"
 * @returns {string} HTML resulted from the convertion of the Markdown document
 */
export function markdown2Html(markdown, wrapInDivContent) {
  const converter = new showdown.Converter({ completeHTMLDocument: false, tables: true });
  const html = converter.makeHtml(markdown);

  if (wrapInDivContent) {
    return wrapContent(html);
  }

  return html;
}

/**
 * Takes a markdown document with some CSS styles and combines them together to create a full HTML document with its corresponding styles for a preview in an iframe container
 * @param {string} markdown Markdown text to be transformed into HTML
 * @param {string} styles Styles represented in CSS format to be applied to the resulting HTML document
 * @returns {string} Full HTML string with styles applied resulted from the convertion of the Markdown document to HTML
 */
export function markdown2HtmlPreview(markdown, styles) {
  const wrapedHtml = markdown2Html(markdown, true);
  const parsedHtml = `<style>${styles}</style>${wrapedHtml}`;
  return parsedHtml;
}
