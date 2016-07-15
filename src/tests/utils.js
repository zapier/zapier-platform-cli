var should = require('should');

var utils = require('../utils');

describe('utils', () => {

  it('should print a nice little table', () => {
    var table = utils.makeTable(
      [{id: 123, title: 'hello'}, {id: 123, title: 'hello'}],
      [
        ['ID', 'id'],
        ['Title', 'title'],
        ['Missing', 'missing'],
      ]
    );
    should(table).eql('ID   Title  Missing\n---  -----  -------\n123  hello         \n123  hello');
  });

  it('should parse some args', () => {
    var [args, opts] = utils.argParse(['hello', 'world', '--cat', '--lolz=hahaha']);
    should(args).eql(['hello', 'world']);
    should(opts).eql({cat: true, lolz: 'hahaha'});
  });

});
