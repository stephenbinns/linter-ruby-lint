"use babel";
import { extname } from 'path';
import { rangeFromLineNumber, exec } from 'atom-linter';

const ALL_ANALYSIS_CLASSES = [
  'argument_amount',
  'loop_keywords',
  'pedantics',
  'shadowing_variables',
  'undefined_methods',
  'undefined_variables',
  'unused_variables',
  'useless_equality_checks'
];

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
    ignoredFilenames: {
      type: 'array',
      default: ['Gemfile'],
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
    },
    enabledAnalysisClasses: {
      type: 'array',
      title: 'Checks to enable'
      description: 'Please refer to the ruby-lint documentation for description'
      default: ALL_ANALYSIS_CLASSES,
      enum: ALL_ANALYSIS_CLASSES,
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
        const ignoredExts = atom.config.get("linter-ruby-lint.ignoredExtensions");
        const ignoredFiles = atom.config.get("linter-ruby-lint.ignoredFilenames");
        const skippedChecks = atom.config.get("linter-ruby-lint.skippedChecks");
        const enabledAnalysisClasses = atom.config.get("linter-ruby-lint.enabledAnalysisClasses")
        const filePath = activeEditor.getPath();
        const fileExtension = extname(filePath).substr(1);

        for (let extension of ignoredExts) {
          if (fileExtension === extension) return [];
        }
        for (let fileName of ignoredFiles) {
            if (filePath.endsWith(fileName)) return [];
        }

        let args = '-p=json'
        for (let analysisClass of enabledAnalysisClasses) {
          args += ' -a ' + analysisClass
        }

        return exec(command, [filePath, args], { stream: 'both' }).then(output => {
          var toReturn = [];
          if (output.stderr) {
            console.warn(output.stderr);
          }
          var violations = JSON.parse(output.stdout);

          violations.forEach(function (violation) {

            // Drop this in next version now the check disabling is supported
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
