# linter-ruby-lint

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides
an interface to [ruby-lint](https://github.com/YorickPeterse/ruby-lint) to lint
files

## Installation

On first activation the plugin will install all dependencies automatically, you
no longer have to worry about installing Linter.

You will need ruby-lint installed and on the path

```
gem install ruby-lint
```

## Settings

You can configure linter-ruby-lint by editing `~/.atom/config.cson` (choose Open
Your Config in Atom menu):

```coffeescript
'linter-ruby-lint':
  # ruby-lint path. run `which ruby-lint` to find the path.
  'rubyLintExecutablePath': null

  # ignored extensions, ERB and markdown files by default.
  'ignoredExtensions': 'erb, md'

  # ignored files names, Gemfile by default
  'ignoredFiles': 'Gemfile'

  # analysis checks to enable - by default all are on. See ruby-lint documentation
  # for descriptions
  'enabledAnalysisClasses': 'undefined_methods undefined_variables'

  # skipped checks empty by default - use part of the warning
  'skippedChecks': 'undefined constant'
```
