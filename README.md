# atom-xi

An Atom plugin for [Xi](http://github.com/xi-livecode/xi/), a musical pattern
language written in Ruby.

## Installation

### Linux, OSX

Just install [Xi](https://github.com/xi-livecode/xi) as instructed and install
this package.  No further configuration is needed.

In case you need to specify a different path for the Xi executable, set Xi Path
in configuration page.

### Windows

If you installed Ruby using [RubyInstaller](https://rubyinstaller.org), you
will need to set the *Xi Path* configuration setting to the absolute path of
the `xi.bat` executable.  You will find this in the `bin` directory inside your
Ruby installation directory.  This is usually at
`C:\Ruby[version]-[arch]\bin\xi.bat`. You will also need to specify the command
line option `--irb` because of a current bug related to Pry and Windows.

For example, if you installed Ruby 2.6 x64 (Windows 64-bit), and it is
installed at `C:\`, you should set: `C:\Ruby26-x64\bin\xi.bat --irb`

## Usage

* Open a new file ending with the `.xi` extension, or set file type to Xi.
* Evaluate a paragraph with <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (or
  <kbd>Command</kbd>+<kbd>Enter</kbd>). If this is the first time, Xi will be
  started.

## Contributing

Bug reports and pull requests are welcome on GitHub at
https://github.com/xi-livecode/atom-xi. This project is intended to be a safe,
welcoming space for collaboration, and contributors are expected to adhere to
the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

See [LICENSE](LICENSE.txt)
