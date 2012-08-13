/*!
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <Carl Calderon> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.
 * ----------------------------------------------------------------------------
 */

/*! ========= COPY FROM HERE ========= */

/**
 * Demands one or more module.
 *
 * Any module not available from the built in require method of node.js will be
 * promoted to the user which have the option to cancel, install. Install is
 * available as local or global where the global option will install the module
 * in the global node.js module library and the local will install the module
 * in the current directory.
 * @param  {String|Array} modules  Single or list of modules required. Any
 *                                 module not available from the current node
 *                                 session / scope will be directly available
 *                                 for installation and download from npm.
 * @param  {Function}     callback Called upon completion. Argument(s) are
 *                                 either Array or single object pending on the
 *                                 request. demand(<Array>) will result in an
 *                                 Array and demand(<String>) will give you a
 *                                 string as callback argument.
 * @return {Boolean}      Success
 */
var demand = function(modules, callback) {

        // variables
    var result  = null,     // single require response
        module  = null,     // current module placeholder
        args    = null,     // arguments used in child_process exec
        isstr   = false,    // true if requested module was sa string
        results = [],       // list of all require responses

        // shorthands
        proc   = process,
        stdin  = proc.stdin,
        stdout = proc.stdout,
        exit   = function (code) { proc.exit(code); },
        stderr = function (message) { proc.stderr(message); exit(1); };

    // check for single module demand
    if (typeof modules == "string") {
        modules = [modules];
        isstr   = true;
    }

    // each tick reads and require one module
    function tick() {

        // all modules have been required and installed.
        if (!modules.length) {

            // desotry stdin so we dont receiver more input
            stdin.destroy();

            // check if the requested module was a part of
            // an array or a single string.
            // callback will respond in the same manner,
            if (isstr) {
                callback(results[0]);
            } else {
                callback(results);
            }

            // do not continue with tick. all compelte
            return;
        }

        // pick the first module in the list
        module = modules.shift();

        // try catch the required module.
        try {

            result = require(module); // error will be thrown here
            results.push(result);
            tick();

        // no module was found
        } catch (e) {

            // make sure we have the correct encoding
            stdin.setEncoding("utf8");

            // tell about missing module
            stdout.write(
                "Missing required module \"" + module + "\". " +
                "Would you like to install it? " +
                "\033[1my\033[0mes, \033[1mn\033[0mo, \033[1mg\033[0mlobal: ");

            // listen for user choice
            stdin.once("data", function (chunk) {

                // reset the exec commands
                args = ["sudo", "npm", "install"];

                // read user action
                // g = globally
                // y = install module
                // n = cancel
                switch (chunk.substr(0,1).toLowerCase()) {

                    // globally; set the -g flag and continue to "y"
                    case "g":
                        args.push("-g");

                    // yes; install in current path
                    case "y":

                        // find module name (parse out name from path)
                        module = module.split("/");
                        module = module[module.length-1];

                        // append module to exec args
                        args.push(module);

                        // perform exec
                        require("child_process").exec(args.join(" "),
                        function (error, data, err) {

                            // an error occured, halt
                            if (error) {
                                stderr("An error occured while installing " +
                                "\"" + module + "\":" + err + "\n");

                            // everything went fine
                            } else {

                                // try to load the module
                                result = require(module);

                                // save to results if the require was successful
                                if (result) {
                                    results.push(result);
                                    tick();

                                // the module could not be found
                                // this is most likely due to permissions
                                } else {
                                    stderr("Unable to load module " +
                                    "\"" + module + "\" after installation. " +
                                    "Permissions error?");
                                }
                            }
                        });
                        break;

                    // no, cancel or wrong option select
                    default:
                        exit(0);
                }
            }).resume();
        }
    };

    // require first requested module
    tick();
}

/*! ============= TO HERE ============ */

// append to exports
exports.demand = demand;