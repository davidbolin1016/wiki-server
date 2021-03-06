'use strict';
// create links to other pages when text on submitted content matches title of other page

const LinkService = {
  createLinks(content, otherPage) {
    
    if (!content || !otherPage) {
      return content;
    }
    
    if (!otherPage.page_name) {
      return content;
    }

    // do not create a link if we match part of a word
    const exclusions = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ<>';
    const name = otherPage.page_name;
    const index = content.toLowerCase().indexOf(otherPage.page_name.toLowerCase());

    if (index === -1) {
      return content;
    }

    let charBefore = ' ';
    let charAfter = ' ';

    if (index > 0) {
      charBefore = content[index - 1];
    }

    if (index + name.length < content.length) {
      charAfter = content[index + name.length];
    }

    if (exclusions.indexOf(charBefore) !== -1 || exclusions.indexOf(charAfter) !== -1) {
      return content.slice(0, index + name.length) + this.createLinks(content.slice(index + name.length), otherPage);
    }

    return content.slice(0, index) + `<IntLink ${otherPage.id}>${content.slice(index, index + name.length)}<IntLink />` + this.createLinks(content.slice(index + name.length), otherPage);
  },

  createMultipleLinks(content, otherPages) {
    let result = content;

    otherPages.forEach(page => {
      result = this.createLinks(result, page);
    });

    return result;
  }
};

module.exports = LinkService;

