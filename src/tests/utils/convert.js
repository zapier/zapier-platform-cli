require('should');
const convert = require('../../utils/convert');

/* eslint no-eval: 0 */
const s2js = (string) => eval(`(${string})`);

describe('convert render functions', () => {

  describe('render field', () => {
    it('should render a string field', () => {
      const v2Key = 'test_field';
      const v2Def = {
        label: 'test field',
        type: 'Unicode',
        required: true,
        help_text: 'help text goes here'
      };

      const string = convert.renderField(v2Def, v2Key);
      const field = s2js(string);
      field.should.eql({
        key: 'test_field',
        label: 'test field',
        type: 'string',
        required: true,
        helpText: 'help text goes here'
      });
    });

    it('should pad help text that is too short', () => {
      const v2Key = 'test_field';
      const v2Def = {
        help_text: 'too short'
      };

      const string = convert.renderField(v2Def, v2Key);
      const field = s2js(string);
      field.helpText.should.eql('too short (help text must be at least 10 characters)');
    });
  });

});
