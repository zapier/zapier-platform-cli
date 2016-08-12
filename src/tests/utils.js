require('should');

require('../entry'); // must import me to babel polyfill!

const utils = require('../utils');

describe('utils', () => {
  it('should have babel polyfill set up', () => {
    global._babelPolyfill.should.eql(true);
  });

  it('should print a nice little table', () => {
    const table = utils.makeTable(
      [{id: 123, title: 'hello'}, {id: 456, title: 'world'}],
      [
        ['ID', 'id'],
        ['Title', 'title'],
        ['Missing', 'missing'],
      ]
    );
    table.indexOf('ID').should.be.above(0);
    table.indexOf('Title').should.be.above(0);
    table.indexOf('Missing').should.be.above(0);
    table.indexOf('123').should.be.above(0);
    table.indexOf('hello').should.be.above(0);
    table.indexOf('456').should.be.above(0);
    table.indexOf('world').should.be.above(0);
  });

  it('should parse some args', () => {
    const [args, argOpts] = utils.argParse(['hello', 'world', '--cat', '--lolz=hahaha']);
    args.should.eql(['hello', 'world']);
    argOpts.should.eql({cat: true, lolz: 'hahaha'});
  });

  it('should enforce some args', () => {
    let spec, args, argOpts, errors;
    spec = {
      argSpec: [
        {name: 'firstGreeting', required: true},
        {name: 'secondGreeting'},
        {rest: true},
      ],
      argOptsSpec: {
        cat: {help: 'Is this a cat?', flag: true},
        lolz: {help: 'What kind of lolz do you have?', required: true}
      }
    };

    [args, argOpts] = utils.argParse([]);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Missing required positional argument 1/firstGreeting',
      'Missing required keyword argument --lolz="value"'
    ]);

    [args, argOpts] = utils.argParse(['hello']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Missing required keyword argument --lolz="value"'
    ]);

    [args, argOpts] = utils.argParse(['hello', '--lolz=hahaha']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([]);

    [args, argOpts] = utils.argParse(['hello', 'world', 'lots', 'more', '--lolz=hahaha']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([]);

  });

  it('should enforce requiredWith args', () => {
    let spec, args, argOpts, errors;
    spec = {
      argSpec: [
        {name: 'version', required: true},
        {name: 'key'},
        {name: 'value', requiredWith: ['key']},
      ]
    };

    [args, argOpts] = utils.argParse([]);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Missing required positional argument 1/version',
    ]);

    [args, argOpts] = utils.argParse(['1.0.0']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([]);

    [args, argOpts] = utils.argParse(['1.0.0', 'some_key']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Missing required positional argument 3/value',
    ]);

    [args, argOpts] = utils.argParse(['1.0.0', 'some_key', 'some_value']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([]);
  });

  it('should enforce no args', () => {
    let spec, args, argOpts, errors;
    spec = {};

    [args, argOpts] = utils.argParse(['something']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Unexpected positional argument 1 "something"',
    ]);

    [args, argOpts] = utils.argParse(['something', 'other']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Unexpected positional argument 1 "something"',
      'Unexpected positional argument 2 "other"',
    ]);

    [args, argOpts] = utils.argParse(['--color=blue']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Unexpected keyword argument --color="blue"',
    ]);

    [args, argOpts] = utils.argParse(['--flaggy']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Unexpected keyword argument --flaggy',
    ]);
  });

  it('should enforce args choices', () => {
    let spec, args, argOpts, errors;
    spec = {
      argSpec: [
        {name: 'color', choices: ['blue', 'red']},
      ],
      argOptsSpec: {
        color: {choices: ['blue', 'red']},
      }
    };

    [args, argOpts] = utils.argParse(['blue']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([]);

    [args, argOpts] = utils.argParse(['urple']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Unexpected positional argument 1 "urple", must be one of "blue", "red"',
    ]);

    [args, argOpts] = utils.argParse(['--color=urple']);
    errors = utils.enforceArgSpec(spec, args, argOpts);
    errors.should.eql([
      'Unexpected keyword argument --color="urple", must be one of "blue", "red"',
    ]);

  });

});
