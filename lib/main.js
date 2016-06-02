"use babel";
import { extname } from 'path';
import { rangeFromLineNumber, exec } from 'atom-linter';

export default {
  config: {
    rubyLintExecutablePath: {
      type: "string",
      default: "ruby-lint"
    },
    ignoredExtensions: {
      type: 'array',
      default: ['erb', 'md'],
      items: {
        type: 'string'
      }
    },
    skippedChecks: {
      type: 'array',
      default: [],
      items: {
        type: 'string'
      }
    }
  },

  activate: () => {
    require("atom-package-deps").install();
  },

  provideLinter: () => {
    return {
      name: "ruby-lint",
      grammarScopes: ["source.ruby", "source.ruby.rails", "source.ruby.rspec"],
      scope: "file",
      lintOnFly: false,
      lint: (activeEditor) => {
        const command = atom.config.get("linter-ruby-lint.rubyLintExecutablePath");
        const ignored = atom.config.get("linter-ruby-lint.ignoredExtensions");
        const skippedChecks = atom.config.get("linter-ruby-lint.skippedChecks");
        const filePath = activeEditor.getPath();
        const fileExtension = extname(filePath).substr(1);

        if (filePath.endsWith("Gemfile")) {
          return [];
        }
        for (let extension of ignored) {
          if (fileExtension === extension) return [];
        }
        return exec(command, [filePath, '-p=json'], { stream: 'both' }).then(output => {
          var toReturn = [];
          if (output.stderr) {
            console.warn(output.stderr);
          }
          var violations = JSON.parse(output.stdout);

          violations.forEach(function (violation) {

            // OMFG Refactor this if you can be bothered
            for (let skip of skippedChecks){
              if (violation.message.indexOf(skip) == 0) {
                return;
              }
            }

            toReturn.push({
              range: rangeFromLineNumber(activeEditor, violation.line - 1, violation.column - 1),
              type: violation.level,
              text: violation.message,
              filePath: filePath
            });

          });

          return toReturn;
        });
      }
    };
  }
};
