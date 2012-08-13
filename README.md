# demand.js

demand.js is a single method module allowing node.js developers to be sure
that required modules for their applications are available without having to
bundle the modules with their scripts.

If a module you require is missing, demand.js will automatically ask the user to install it. The user is presented with 3 choices; **y**es, **n**o or **g**lobal. The last option `global` installs the module globally (available from all node.js applications).

## Usage

Since demand.js is loading modules, it would be crazy having it self as a
module. With this said, demand.js may be implemented in any way suitable for
your needs. You may place the js file and require it or just **copy paste** either
the readable or minified version of it into your code.

I suggest you copy paste the code. Don't worry about any license, just by me a beer.

**Syntax**

```javascript

demand(<module(s)>, <callback>);

```

Where `module(s)` may be a string representing a single module or an Array of strings each representing a module. The `callback` will repsond in the same manner you requested the modules. A single string will make the callback respond with a single argument and an array will return an array with all require responses in the same order requested.

```javascript

// single
demand("colors", function (data) {

	var colors = data;

});

demand(["underscore", "coffee-script"], function(data) {

	var underscore = data[0],
		coffee = data[1];

});

```

### Example

In this example we assume demand.js is placed in the same folder as the running
script and we would like to make sure we have commander and colors modules.

```javascript

var demand    = require("./demand.js").demand,

    commander = null,
    colors    = null;

demand(["commander", "colors"], function (data) {

    commander = data[0];
    colors    = data[1];

});
```

## Author

Carl Calderon: [@carlcalderon][twitter]

## License

demand.js is licensed under [beerware-license][beer]

[twitter]:https://twitter.com/carlcalderon
[beer]:http://en.wikipedia.org/wiki/Beerware
